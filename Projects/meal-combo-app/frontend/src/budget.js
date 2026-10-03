// Turns the raw text in the budget box into a whole number of KES.
// Returns { budget, error }: budget is null when the box is empty or invalid.
// The API only accepts whole numbers 0 or more, so we check that before asking it.
export function parseBudget(text) {
  if (text.trim() === "") return { budget: null, error: null };

  const value = Number(text);
  if (!Number.isInteger(value) || value < 0) {
    return { budget: null, error: "Enter a whole number of KES, 0 or more." };
  }
  return { budget: value, error: null };
}
