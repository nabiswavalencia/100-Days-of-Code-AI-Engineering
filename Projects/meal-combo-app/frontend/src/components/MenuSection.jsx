import MenuItemCard from "./MenuItemCard.jsx";

// Concept: rendering lists. We turn an array of data into an array of
// components with .map(). Each element needs a unique `key` so React can
// track which item is which between renders.
function MenuSection({ title, items, history, onToggleHistory }) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="item-list">
        {items.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            eatenRecently={history.includes(item.id)}
            onToggleHistory={onToggleHistory}
          />
        ))}
      </ul>
    </section>
  );
}

export default MenuSection;
