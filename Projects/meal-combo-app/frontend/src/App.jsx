import { useState } from "react";
import Header from "./components/Header.jsx";
import BudgetForm from "./components/BudgetForm.jsx";
import MenuSection from "./components/MenuSection.jsx";
import RecommendationPanel from "./components/RecommendationPanel.jsx";
import { menu, slotLabels } from "./data/menu.js";
import { recommendCombos } from "./utils/combos.js";

// App is the parent that owns the state. Children receive it as props.
function App() {
  // Concept: useState. Calling the setter re-renders the component with the new value.
  const [budget, setBudget] = useState(300);
  const [history, setHistory] = useState([]); // ids of items eaten yesterday

  function toggleHistory(id) {
    // Never mutate state directly; always create a new array.
    setHistory((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  }

  // Derived data: recomputed on every render from state, not stored in state.
  const combos = recommendCombos(menu, budget, history);

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
