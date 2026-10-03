import { comboKey } from "../combo.js";

// Concept: conditional rendering. We return different JSX depending on the
// state: an error, loading, an invalid budget, nothing fits, or the list.
function RecommendationPanel({ combos, budget, status, error, onOrder, orderingKey, message }) {
  let body;
  if (error) {
    body = <p className="field-error">{error}</p>;
  } else if (budget === null) {
    body = <p className="empty">Enter a budget to see your top picks.</p>;
  } else if (status === "loading" && combos.length === 0) {
    body = <p className="empty">Finding the best combos...</p>;
  } else if (combos.length === 0) {
    body = <p className="empty">No combo fits KES {budget}. Try raising your budget.</p>;
  } else {
    body = (
      <ol className={`combo-list ${status === "loading" ? "is-stale" : ""}`}>
        {combos.map((combo, index) => {
          const key = comboKey(combo);
          const isOrdering = orderingKey === key;
          return (
            <li key={key} className={`combo-card ${index === 0 ? "combo-card--best" : ""}`}>
              <div className="tags">
                {index === 0 && <span className="tag tag--best">Top pick</span>}
                <span className="tag">{combo.items.length === 3 ? "Full meal" : "2 items"}</span>
              </div>
              <p className="combo-names">{combo.items.map((item) => item.name).join(" + ")}</p>
              <div className="combo-footer">
                <p className="meta">
                  <strong className="price">KES {combo.total}</strong> · ★{" "}
                  {combo.avg_rating.toFixed(1)} avg
                </p>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onOrder(combo)}
                  disabled={orderingKey !== null}
                >
                  {isOrdering ? "Ordering..." : "Order"}
                </button>
              </div>
            </li>
          );
        })}
      </ol>
    );
  }

  return (
    <section className="panel recommendations" aria-live="polite">
      <h2>Top picks</h2>
      {body}
      {message && (
        <p className={message.ok ? "message" : "field-error"}>{message.text}</p>
      )}
    </section>
  );
}

export default RecommendationPanel;
