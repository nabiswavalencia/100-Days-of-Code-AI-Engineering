import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RecommendationPanel from "./RecommendationPanel.jsx";

const pilauChai = {
  items: [
    { id: "pilau", name: "Pilau", price: 170 },
    { id: "chai", name: "Chai", price: 30 },
  ],
  total: 200,
  avg_rating: 4.6,
};
const fullMeal = {
  items: [
    { id: "pilau", name: "Pilau", price: 170 },
    { id: "kachumbari", name: "Kachumbari", price: 30 },
    { id: "chai", name: "Chai", price: 30 },
  ],
  total: 230,
  avg_rating: 4.43,
};

function renderPanel(props) {
  return render(
    <RecommendationPanel
      combos={[pilauChai, fullMeal]}
      budget={300}
      status="done"
      error={null}
      onOrder={() => {}}
      orderingKey={null}
      message={null}
      {...props}
    />
  );
}

describe("RecommendationPanel", () => {
  it("shows each combo with its price and rating", () => {
    renderPanel();
    expect(screen.getByText("Pilau + Chai")).toBeInTheDocument();
    expect(screen.getByText("KES 200")).toBeInTheDocument();
    expect(screen.getByText(/4\.6 avg/)).toBeInTheDocument();
  });

  it("marks only the first combo as the top pick", () => {
    renderPanel();
    expect(screen.getAllByText("Top pick")).toHaveLength(1);
  });

  it("tags full meals and 2-item combos", () => {
    renderPanel();
    expect(screen.getByText("2 items")).toBeInTheDocument();
    expect(screen.getByText("Full meal")).toBeInTheDocument();
  });

  it("calls onOrder with the combo that was clicked", async () => {
    const onOrder = vi.fn();
    renderPanel({ onOrder });
    await userEvent.click(screen.getAllByRole("button", { name: "Order" })[1]);
    expect(onOrder).toHaveBeenCalledWith(fullMeal);
  });

  it("disables every Order button while an order is in progress", () => {
    renderPanel({ orderingKey: "pilau-chai" });
    expect(screen.getByRole("button", { name: "Ordering..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Order" })).toBeDisabled();
  });

  it("says when nothing fits the budget", () => {
    renderPanel({ combos: [], budget: 100 });
    expect(screen.getByText(/No combo fits KES 100/)).toBeInTheDocument();
  });

  it("asks for a budget when there isn't a valid one", () => {
    renderPanel({ budget: null });
    expect(screen.getByText(/Enter a budget/)).toBeInTheDocument();
  });

  it("shows an error instead of the list", () => {
    renderPanel({ error: "Could not load recommendations. Try again." });
    expect(screen.getByText(/Could not load/)).toBeInTheDocument();
    expect(screen.queryByText("Pilau + Chai")).not.toBeInTheDocument();
  });
});
