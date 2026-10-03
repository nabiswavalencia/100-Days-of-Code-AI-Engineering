const PRESETS = [150, 200, 300];

// Concept: a "controlled input". The input does NOT keep its own value;
// it shows whatever `value` the parent passes in, and reports changes back
// up through `onChange`. This is called "lifting state up".
//
// `value` is the raw text (a string), so the box can be empty while typing.
// The parent decides whether it's a valid budget and passes `error` if not.
function BudgetForm({ value, onChange, error }) {
  return (
    <section className="panel">
      <label htmlFor="budget">Your budget (KES)</label>
      <input
        id="budget"
        type="number"
        inputMode="numeric"
        min="0"
        step="10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? "budget-error" : undefined}
      />
      {error && (
        <p id="budget-error" className="field-error">
          {error}
        </p>
      )}

      <div className="presets" aria-label="Quick budgets">
        {PRESETS.map((amount) => (
          <button
            key={amount}
            type="button"
            className={`chip ${value === String(amount) ? "chip--active" : ""}`}
            onClick={() => onChange(String(amount))}
          >
            KES {amount}
          </button>
        ))}
      </div>
    </section>
  );
}

export default BudgetForm;
