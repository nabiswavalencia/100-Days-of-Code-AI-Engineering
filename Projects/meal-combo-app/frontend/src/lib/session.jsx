import { createContext, useCallback, useContext, useMemo, useState } from 'react'

// The demo login: which profile is using the app. Kept in localStorage so a refresh
// doesn't log you out. Storage can be unavailable (private mode), so every access is guarded.
const KEY = 'chakula.user'
const SessionContext = createContext(null)

function readUser() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function SessionProvider({ children, initialUser }) {
  const [user, setUser] = useState(() => initialUser ?? readUser())

  const signIn = useCallback((next) => {
    setUser(next)
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch { /* keep the in-memory session */ }
  }, [])

  const signOut = useCallback(() => {
    setUser(null)
    try { localStorage.removeItem(KEY) } catch { /* nothing to clear */ }
  }, [])

  const value = useMemo(() => ({ user, signIn, signOut }), [user, signIn, signOut])
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
