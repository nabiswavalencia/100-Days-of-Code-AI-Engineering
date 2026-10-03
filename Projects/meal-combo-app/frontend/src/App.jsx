import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import BudgetForm from "./components/BudgetForm.jsx";
import MenuSection from "./components/MenuSection.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import { parseBudget } from "./budget.js";
import { comboKey } from "./combo.js";

// Labels for each slot, used as section headings in the UI.
const slotLabels = {
  main: "Mains",
  side: "Sides",
  drink: "Drinks",
};

// fetch() only rejects on network failure. A 422 or 500 still "succeeds",
// so check response.ok ourselves before trusting the JSON.
async function getJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

// App is the parent that owns the state. Children receive it as props.
function App() {
  // Concept: useState. Calling the setter re-renders the component with the new value.
  const [budgetText, setBudgetText] = useState("300"); // raw text from the input box
  const [history, setHistory] = useState([]); // ids of items eaten yesterday
  const [menu, setMenu] = useState(null); // null until the API responds
  const [menuError, setMenuError] = useState(null);
  // The last answer from /api/recommend, and which request it was for.
  const [recs, setRecs] = useState({ key: null, combos: [], failed: false });
  const [message, setMessage] = useState(null); // { text, ok } after an order
  const [orderingKey, setOrderingKey] = useState(null); // combo being ordered right now
  // Bumped after every order so both effects below fetch fresh data.
  const [ordersPlaced, setOrdersPlaced] = useState(0);

  // Derived from state on every render, not stored separately.
  const { budget, error: budgetError } = parseBudget(budgetText);

  const params = new URLSearchParams({ budget: budget ?? "" });
  history.forEach((id) => params.append("history", id));
  const query = params.toString();
  // Which request the screen should be showing. Includes ordersPlaced so picks refresh after an order.
  const requestKey = `${query}|${ordersPlaced}`;

  // "Loading" isn't stored: if the last answer was for a different request, we're waiting for a new one.
  let recStatus = "done";
  if (recs.key !== requestKey) recStatus = "loading";
  else if (recs.failed) recStatus = "error";

  // Concept: useEffect runs code AFTER React renders, which is where talking to
  // the outside world (like an API) belongs. The array at the end lists what
  // the effect depends on: it runs on first load, then again after each order
  // so the purchase counts stay up to date.
  useEffect(() => {
    getJson("/api/menu")
      .then((data) => {
        setMenu(data);
        setMenuError(null);
      })
      .catch(() => setMenuError("Could not load the menu. Is the FastAPI server running?"));
  }, [ordersPlaced]);

  // Runs again whenever the request changes (budget, history or number of orders).
  useEffect(() => {
    if (budget === null) return; // nothing valid to ask for yet

    // Cleanup: if budget changes again before this request finishes, the
    // older response is ignored so it can't overwrite the newer one.
    let ignore = false;
    getJson(`/api/recommend?${query}`)
      .then((data) => {
        if (!ignore) setRecs({ key: requestKey, combos: data, failed: false });
      })
      .catch(() => {
        // Keep the old combos so the panel doesn't go blank, but mark this request as failed.
        if (!ignore) setRecs((prev) => ({ ...prev, key: requestKey, failed: true }));
      });
    return () => {
      ignore = true;
    };
  }, [budget, query, requestKey]);

  // Concept: sending data with fetch. POST + a JSON body, instead of just reading.
  function placeOrder(combo) {
    const names = combo.items.map((item) => item.name).join(" + ");
    setOrderingKey(comboKey(combo)); // disables the buttons, so a double click can't order twice
    setMessage(null);

    getJson("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_ids: combo.items.map((item) => item.id) }),
    })
      .then(() => {
        setMessage({ text: `Ordered ${names} 🎉`, ok: true });
        setOrdersPlaced((count) => count + 1);
      })
      .catch(() => setMessage({ text: "Order failed. Please try again.", ok: false }))
      .finally(() => setOrderingKey(null));
  }

  function toggleHistory(id) {
    // Never mutate state directly; always create a new array.
    setHistory((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  if (!menu) {
    return (
      <div className="app">
        <Header />
        <p className={`panel ${menuError ? "field-error" : "empty"}`}>
          {menuError ?? "Loading menu..."}
        </p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="layout">
        <aside className="sidebar">
          <BudgetForm value={budgetText} onChange={setBudgetText} error={budgetError} />
          <RecommendationPanel
            combos={recs.combos}
            budget={budget}
            status={recStatus}
            error={recStatus === "error" ? "Could not load recommendations. Try again." : null}
            onOrder={placeOrder}
            orderingKey={orderingKey}
            message={message}
          />
        </aside>

        <div className="menu">
          {Object.keys(menu).map((slot) => (
            <MenuSection
              key={slot}
              title={slotLabels[slot]}
              items={menu[slot]}
              history={history}
              onToggleHistory={toggleHistory}
            />
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
