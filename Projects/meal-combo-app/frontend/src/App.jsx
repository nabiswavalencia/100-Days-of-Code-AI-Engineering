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

  // Concept: useEffect runs code AFTER React renders, which is where talking to
  // the outside world (like an API) belongs. The empty array [] means
  // "run once, when the app first loads".
  useEffect(() => {
    fetch("/api/menu")
      .then((response) => response.json())
      .then(setMenu)
      .catch(() => setError("Could not load the menu. Is the FastAPI server running?"));
  }, []);

  // [budget, history] means "run again whenever budget or history changes".
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
  }, [budget, history]);

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
          <RecommendationPanel combos={combos} budget={budget} />
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
