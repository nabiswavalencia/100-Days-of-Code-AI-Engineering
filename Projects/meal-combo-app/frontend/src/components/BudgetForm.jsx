// Concept: a "controlled input". The input does NOT keep its own value;
// it shows whatever `budget` the parent passes in, and reports changes back
// up through `onBudgetChange`. This is called "lifting state up".
function BudgetForm({ budget, onBudgetChange }) {
  return (
    <section className="panel">
      <label htmlFor="budget">Your budget (KES)</label>
      <input
        id="budget"
        type="number"
        min="0"
        step="10"
        value={budget}
        onChange={(event) => onBudgetChange(Number(event.target.value))}
      />
    </section>
  );
}

export default BudgetForm;
