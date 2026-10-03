// Concept: a component is just a function that returns JSX (HTML-like syntax).
// This one takes no props and has no state, the simplest kind there is.
function Header() {
  return (
    <header className="header">
      <h1>Chakula Combos</h1>
      <p>Smart Kenyan meal combos that fit your budget.</p>
    </header>
  );
}

export default Header;
