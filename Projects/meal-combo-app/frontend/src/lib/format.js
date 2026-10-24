const kes = new Intl.NumberFormat('en-KE', { maximumFractionDigits: 0 })

// "KES 1,400" with a non-breaking space, so the amount never wraps away from KES.
export function formatKES(amount) {
  return `KES\u00a0${kes.format(amount)}`
}

const ratingFormat = new Intl.NumberFormat('en-KE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

export function formatRating(value) {
  return ratingFormat.format(value)
}

const dayFormat = new Intl.DateTimeFormat('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })
const timeFormat = new Intl.DateTimeFormat('en-KE', { hour: 'numeric', minute: '2-digit' })

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

// "Today", "Yesterday", or "Tue, 6 Oct".
export function formatDay(date, now = new Date()) {
  const days = Math.round((startOfDay(now) - startOfDay(date)) / 86_400_000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  return dayFormat.format(date)
}

export function formatTime(date) {
  return timeFormat.format(date)
}

// "Pilau + Chai" for display, "Pilau and Chai" for screen readers.
export function joinNames(items, separator = ' + ') {
  return items.map((item) => item.name).join(separator)
}
