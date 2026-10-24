import { useCallback, useEffect, useState } from 'react'

// Loads data for `key`. Pass key = null to wait (nothing is fetched).
//
// "Loading" isn't stored: if the last answer was for a different key, we're waiting
// for a new one (the derived-state idea from v1, Day 42). With keepPrevious, the old
// data stays on screen while the new request runs, so lists can dim instead of blanking.
export function useApi(load, key, { keepPrevious = false } = {}) {
  const [state, setState] = useState({ key: null, data: null, error: null })
  const [attempt, setAttempt] = useState(0)
  const requestKey = key == null ? null : `${key}#${attempt}`

  useEffect(() => {
    if (requestKey == null) return
    let ignore = false
    load()
      .then((data) => {
        if (!ignore) setState({ key: requestKey, data, error: null })
      })
      .catch((error) => {
        if (!ignore) setState((prev) => ({ key: requestKey, data: prev.data, error }))
      })
    return () => {
      ignore = true
    }
    // `load` is a new function every render; the key says when the request really changed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  const current = state.key === requestKey
  const reload = useCallback(() => setAttempt((n) => n + 1), [])
  return {
    data: current || keepPrevious ? state.data : null,
    error: current ? state.error : null,
    loading: requestKey != null && !current,
    reload,
  }
}
