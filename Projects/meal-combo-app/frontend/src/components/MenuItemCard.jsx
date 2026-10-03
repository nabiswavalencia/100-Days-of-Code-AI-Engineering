// Concept: props. The parent passes data in as attributes
// (<MenuItemCard item={...} />) and we destructure them here.
function MenuItemCard({ item, eatenRecently, onToggleHistory }) {
  return (
    // Template literal lets us add a class conditionally.
    <li className={`item-card ${eatenRecently ? "item-card--eaten" : ""}`}>
      <div>
        <h3>{item.name}</h3>
        <p className="meta">
          <strong className="price">KES {item.price}</strong> · ★ {item.rating} ·{" "}
          {item.purchases} orders
        </p>
      </div>
      <button
        type="button"
        aria-pressed={eatenRecently}
        aria-label={`${item.name}: ${eatenRecently ? "undo ate yesterday" : "ate yesterday"}`}
        onClick={() => onToggleHistory(item.id)}
      >
        {eatenRecently ? "Undo" : "Ate yesterday"}
      </button>
    </li>
  );
}

export default MenuItemCard;
