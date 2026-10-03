// TEMPORARY stand-in for the Python recommendation engine.
// It gives the layout something real to display today. Once the FastAPI
// endpoint exists, App.jsx will fetch combos from it and this file goes away.

// Cartesian product: one item from each slot, built with nested loops.
function buildCombos(menu) {
  const combos = [];
  for (const main of menu.main) {
    for (const side of menu.side) {
      for (const drink of menu.drink) {
        combos.push([main, side, drink]);
      }
    }
  }
  return combos;
}

// Keeps combos within budget that avoid anything eaten recently, then
// sorts by average rating (highest first).
export function recommendCombos(menu, budget, history, limit = 3) {
  return buildCombos(menu)
    .filter((items) => !items.some((item) => history.includes(item.id)))
    .map((items) => {
      const total = items.reduce((sum, item) => sum + item.price, 0);
      const avgRating = items.reduce((sum, item) => sum + item.rating, 0) / items.length;
      return { items, total, avgRating };
    })
    .filter((combo) => combo.total <= budget)
    .sort((a, b) => b.avgRating - a.avgRating)
    .slice(0, limit);
}
