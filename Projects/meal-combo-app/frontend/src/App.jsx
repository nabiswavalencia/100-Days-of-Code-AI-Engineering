import { useEffect, useState } from "react";
import Header from "./components/Header.jsx";
import BudgetForm from "./components/BudgetForm.jsx";
import MenuSection from "./components/MenuSection.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";

// Labels for each slot, used as section headings in the UI.
const slotLabels = {
  main: "Mains",
  side: "Sides",
  drink: "Drinks",
};

// App is the parent that owns the state. Children receive it as props.
function App() {
  // Concept: useState. Calling the setter re-renders the component with the new value.
  const [budget, setBudget] = useState(300);
  const [history, setHistory] = useState([]); // ids of items eaten yesterday
  const [menu, setMenu] = useState(null); // null until the API responds
  const [combos, setCombos] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  // Bumped after every order so both effects below fetch fresh data.
  const [ordersPlaced, setOrdersPlaced] = useState(0);

  // Concept: useEffect runs code AFTER React renders, which is where talking to
  // the outside world (like an API) belongs. The array at the end lists what
  // the effect depends on: it runs on first load, then again after each order
  // so the purchase counts stay up to date.
  useEffect(() => {
    fetch("/api/menu")
      .then((response) => response.json())
      .then(setMenu)
      .catch(() => setError("Could not load the menu. Is the FastAPI server running?"));
  }, [ordersPlaced]);

  // Runs again whenever budget, history or the number of orders changes.
  useEffect(() => {
    const params = new URLSearchParams({ budget });
    history.forEach((id) => params.append("history", id));

    // Cleanup: if budget changes again before this request finishes, the
    // older response is ignored so it can't overwrite the newer one.
    let ignore = false;
    fetch(`/api/recommend?${params}`)
      .then((response) => response.json())
      .then((data) => {
        if (!ignore) setCombos(data);
      })
      .catch(() => setError("Could not load recommendations."));
    return () => {
      ignore = true;
    };
  }, [budget, history, ordersPlaced]);

  // Concept: sending data with fetch. POST + a JSON body, instead of just reading.
  function placeOrder(combo) {
    fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item_ids: combo.items.map((item) => item.id) }),
    })
      .then((response) => {
        if (!response.ok) throw new Error();
        setMessage(`Ordered ${combo.items.map((item) => item.name).join(" + ")} 🎉`);
        setOrdersPlaced((count) => count + 1);
      })
      .catch(() => setMessage("Order failed. Please try again."));
  }

  function toggleHistory(id) {
    // Never mutate state directly; always create a new array.
    setHistory((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  if (error) {
    return (
      <div className="app">
        <Header />
        <p className="panel empty">{error}</p>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="app">
        <Header />
        <p className="panel empty">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="app">
      <Header />

      <main className="layout">
        <aside className="sidebar">
          <BudgetForm budget={budget} onBudgetChange={setBudget} />
          <RecommendationPanel
            combos={combos}
            budget={budget}
            onOrder={placeOrder}
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
