import { useEffect, useState } from 'react'

// Returns `value`, but only after it has stopped changing for `delay` ms.
// Typing "300" sends one request instead of three (audit: request per keystroke).
export function useDebounced(value, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
