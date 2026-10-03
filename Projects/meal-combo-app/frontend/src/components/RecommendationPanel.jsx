// Concept: conditional rendering. We return different JSX depending on the
// data: an empty-state message when nothing fits, otherwise the list.
function RecommendationPanel({ combos, budget, onOrder, message }) {
  if (combos.length === 0) {
    return (
      <section className="panel recommendations">
        <h2>Top picks</h2>
        <p className="empty">No combo fits KES {budget}. Try raising your budget.</p>
      </section>
    );
  }

  return (
    <section className="panel recommendations">
      <h2>Top picks</h2>
      <ol className="combo-list">
        {combos.map((combo) => (
          // The ids joined together make a unique key for each combo.
          <li key={combo.items.map((item) => item.id).join("-")} className="combo-card">
            <p className="combo-names">{combo.items.map((item) => item.name).join(" + ")}</p>
            <div className="combo-footer">
              <p className="meta">
                KES {combo.total} · ★ {combo.avg_rating.toFixed(1)} avg
              </p>
              <button type="button" onClick={() => onOrder(combo)}>
                Order
              </button>
            </div>
          </li>
        ))}
      </ol>
      {message && <p className="meta">{message}</p>}
    </section>
  );
}

export default RecommendationPanel;
