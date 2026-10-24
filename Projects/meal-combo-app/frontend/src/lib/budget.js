// Turns the raw text in the budget box into a whole number of KES.
// Returns { budget, error }: budget is null when the box is empty or invalid.
// The API only accepts whole numbers 0 or more, so we check that before asking it.
export function parseBudget(text) {
  const cleaned = text.replace(/[,\s]/g, '')
  if (cleaned === '') return { budget: null, error: null }

  const value = Number(cleaned)
  if (!Number.isInteger(value) || value < 0) {
    return { budget: null, error: 'Enter a whole number of shillings, like 300.' }
  }
  return { budget: value, error: null }
}
