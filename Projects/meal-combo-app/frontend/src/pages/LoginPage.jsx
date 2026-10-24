import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { ArrowRight } from '@phosphor-icons/react'
import Avatar from '../components/Avatar.jsx'
import { ErrorState, Skeleton } from '../components/States.jsx'
import { SkipLink } from '../components/RestaurantLayout.jsx'
import { api } from '../lib/api.js'
import { useApi } from '../lib/useApi.js'
import { useSession } from '../lib/session.jsx'

export function Wordmark() {
  return (
    <span translate="no" className="flex items-center gap-2 font-display text-xl font-bold">
      <img src="/favicon.svg" alt="" width="28" height="28" className="size-7" />
      Chakula Combos
    </span>
  )
}

export default function LoginPage() {
  const { user, signIn } = useSession()
  const navigate = useNavigate()
  const { data: users, error, reload } = useApi(api.users, 'users')
  const [pendingId, setPendingId] = useState(null)
  const [loginError, setLoginError] = useState(null)

  if (user) return <Navigate to="/restaurants" replace />

  function choose(profile) {
    setPendingId(profile.id)
    setLoginError(null)
    api
      .login(profile.id)
      .then((signedIn) => {
        signIn(signedIn)
        navigate('/restaurants')
      })
      .catch(() => {
        setLoginError("Sign-in didn't work. Check your connection and try again.")
        setPendingId(null)
      })
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <SkipLink />
      <header className="flex flex-col gap-8 bg-surface px-4 pt-6 pb-8 sm:px-10 lg:justify-between lg:p-14">
        <Wordmark />
        <div className="grid gap-4">
          <h1 className="t-display max-w-[14ch]">The best meal your budget can buy.</h1>
          <p className="t-body-lg max-w-[40ch] text-muted">
            Pick a restaurant, set a budget, and get a combo ranked by rating and popularity.
          </p>
        </div>
        <img
          src="/images/hero-login.webp"
          alt="A large pan of pilau with potatoes, cooking"
          width="640"
          height="360"
          fetchPriority="high"
          className="h-40 w-full rounded-2xl object-cover sm:h-56 lg:aspect-[16/10] lg:h-auto"
        />
      </header>

      <main id="main" tabIndex={-1} className="flex items-center px-4 py-10 outline-none sm:px-10 lg:p-14">
        <div className="mx-auto grid w-full max-w-md gap-6">
          <div className="grid gap-2">
            <h2 className="t-h1">Who&rsquo;s eating?</h2>
            <p className="text-muted">This is a demo, so there&rsquo;s no password. Pick a profile to see their orders.</p>
          </div>

          {error ? (
            <ErrorState message="The profiles didn't load. Is the FastAPI server running on port 8000? Start it, then try again." onRetry={reload} />
          ) : !users ? (
            <div className="grid gap-3">
              <p role="status" className="sr-only">Loading profiles…</p>
              {[0, 1, 2].map((n) => <Skeleton key={n} className="h-20" />)}
            </div>
          ) : (
            <ul className="grid gap-3">
              {users.map((profile) => (
                <li key={profile.id}>
                  <button
                    type="button"
                    disabled={pendingId !== null}
                    onClick={() => choose(profile)}
                    className="group flex min-h-20 w-full items-center gap-4 rounded-2xl bg-surface p-4 text-left ring-1 ring-line transition-[box-shadow,transform] hover:ring-2 hover:ring-ink active:scale-[0.99] disabled:cursor-not-allowed"
                  >
                    <Avatar user={profile} size="lg" />
                    <span className="grid min-w-0 flex-1">
                      <span className="t-h3 truncate">{profile.name}</span>
                      <span className="t-small text-muted">{profile.profile}</span>
                    </span>
                    <span className="t-small shrink-0 font-semibold text-muted group-hover:text-ink">
                      {pendingId === profile.id ? (
                        'Signing in…'
                      ) : (
                        <ArrowRight aria-hidden="true" className="size-5" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {loginError && <ErrorState message={loginError} />}
        </div>
      </main>
    </div>
  )
}
