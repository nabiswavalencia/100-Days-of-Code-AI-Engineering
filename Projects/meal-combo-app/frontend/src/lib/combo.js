// A combo's key: its item ids joined together, e.g. "mw-pilau|mw-chai".
// Used as the React list key and to know which combo is being ordered.
export function comboKey(combo) {
  return combo.items.map((item) => item.id).join('|')
}

export function comboShape(combo) {
  return combo.items.length === 3 ? 'Full meal' : '2 items'
}
