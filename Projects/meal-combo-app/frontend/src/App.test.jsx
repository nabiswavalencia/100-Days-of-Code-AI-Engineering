import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App.jsx";

const menu = {
  main: [{ id: "pilau", name: "Pilau", price: 170, rating: 4.8, purchases: 150 }],
  side: [{ id: "kachumbari", name: "Kachumbari", price: 30, rating: 4.5, purchases: 110 }],
  drink: [{ id: "chai", name: "Chai", price: 30, rating: 4.4, purchases: 200 }],
};
const combos = [
  { items: [menu.main[0], menu.drink[0]], total: 200, avg_rating: 4.6, score: 1.1 },
];

function jsonResponse(body, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }));
}

// A fake fetch that answers like the FastAPI server. Tests can override any route.
function mockApi(overrides = {}) {
  const fetchMock = vi.fn((url, options) => {
    if (url.startsWith("/api/menu")) return overrides.menu?.() ?? jsonResponse(menu);
    if (url.startsWith("/api/recommend")) return overrides.recommend?.(url) ?? jsonResponse(combos);
    if (url.startsWith("/api/orders")) return overrides.orders?.(options) ?? jsonResponse({ order_id: 1 }, 201);
    throw new Error(`Unexpected request: ${url}`);
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

function recommendCalls(fetchMock) {
  return fetchMock.mock.calls.map(([url]) => url).filter((url) => url.startsWith("/api/recommend"));
}

describe("App", () => {
  beforeEach(() => {
    mockApi();
  });

  it("loads the menu and the top picks", async () => {
    render(<App />);
    expect(await screen.findByText("Pilau + Chai")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
  });

  it("shows a helpful message when the server is down", async () => {
    mockApi({ menu: () => Promise.reject(new TypeError("Failed to fetch")) });
    render(<App />);
    expect(await screen.findByText(/Is the FastAPI server running/)).toBeInTheDocument();
  });

  it("does not crash on a negative budget, and does not ask the API", async () => {
    // Regression test: this used to blank the whole page.
    const fetchMock = mockApi();
    render(<App />);
    await screen.findByText("Pilau + Chai");
    const before = recommendCalls(fetchMock).length;

    const input = screen.getByLabelText(/Your budget/);
    await userEvent.clear(input);
    await userEvent.type(input, "-5");

    expect(screen.getByText(/whole number of KES/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
    expect(recommendCalls(fetchMock)).toHaveLength(before);
  });

  it("keeps the menu on screen if recommendations fail", async () => {
    mockApi({ recommend: () => jsonResponse({ detail: "boom" }, 500) });
    render(<App />);
    expect(await screen.findByText(/Could not load recommendations/)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mains" })).toBeInTheDocument();
  });

  it("quick budget buttons change the budget", async () => {
    const fetchMock = mockApi();
    render(<App />);
    await screen.findByText("Pilau + Chai");

    await userEvent.click(screen.getByRole("button", { name: "KES 150" }));

    expect(screen.getByLabelText(/Your budget/)).toHaveValue(150);
    await waitFor(() => expect(recommendCalls(fetchMock).at(-1)).toContain("budget=150"));
  });

  it("sends 'ate yesterday' items as history", async () => {
    const fetchMock = mockApi();
    render(<App />);
    await screen.findByText("Pilau + Chai");

    await userEvent.click(screen.getByRole("button", { name: "Pilau: ate yesterday" }));

    await waitFor(() => expect(recommendCalls(fetchMock).at(-1)).toContain("history=pilau"));
    expect(screen.getByRole("button", { name: "Pilau: undo ate yesterday" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("places an order with the combo's item ids", async () => {
    const fetchMock = mockApi();
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Order" }));

    expect(await screen.findByText(/Ordered Pilau \+ Chai/)).toBeInTheDocument();
    const [, options] = fetchMock.mock.calls.find(([url]) => url === "/api/orders");
    expect(options.method).toBe("POST");
    expect(JSON.parse(options.body)).toEqual({ item_ids: ["pilau", "chai"] });
  });

  it("only sends one order on a double click", async () => {
    // Regression test: the button used to stay clickable while the order was sending.
    let finishOrder;
    const fetchMock = mockApi({
      orders: () => new Promise((resolve) => (finishOrder = resolve)),
    });
    render(<App />);
    const button = await screen.findByRole("button", { name: "Order" });

    await userEvent.dblClick(button);

    expect(screen.getByRole("button", { name: "Ordering..." })).toBeDisabled();
    expect(fetchMock.mock.calls.filter(([url]) => url === "/api/orders")).toHaveLength(1);

    finishOrder(new Response(JSON.stringify({ order_id: 1 }), { status: 201 }));
    expect(await screen.findByText(/Ordered Pilau \+ Chai/)).toBeInTheDocument();
  });

  it("shows a failure message if the order is rejected", async () => {
    mockApi({ orders: () => jsonResponse({ detail: "Unknown item id in order." }, 400) });
    render(<App />);
    await userEvent.click(await screen.findByRole("button", { name: "Order" }));

    expect(await screen.findByText(/Order failed/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Order" })).toBeEnabled();
  });

  it("refreshes the menu and picks after an order", async () => {
    const fetchMock = mockApi();
    render(<App />);
    await screen.findByText("Pilau + Chai");
    const menuCallsBefore = fetchMock.mock.calls.filter(([url]) => url === "/api/menu").length;

    await userEvent.click(screen.getByRole("button", { name: "Order" }));
    await screen.findByText(/Ordered/);

    await waitFor(() =>
      expect(fetchMock.mock.calls.filter(([url]) => url === "/api/menu").length).toBe(
        menuCallsBefore + 1
      )
    );
  });
});
