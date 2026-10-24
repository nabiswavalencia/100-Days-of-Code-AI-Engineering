import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router'
import { motion } from 'motion/react'
import { CheckCircle, ForkKnife, House, Receipt, Sparkle, WarningCircle, X } from '@phosphor-icons/react'
import UserMenu from './UserMenu.jsx'
import { ErrorState, Skeleton } from './States.jsx'
import { api } from '../lib/api.js'
import { formatKES, joinNames } from '../lib/format.js'
import { useApi } from '../lib/useApi.js'
import { useSession } from '../lib/session.jsx'

const RestaurantContext = createContext(null)
const OrderingContext = createContext(null)

export function useRestaurant() {
  return useContext(RestaurantContext)
}

export function useOrdering() {
  return useContext(OrderingContext)
}

const NAV = [
  { to: '', end: true, label: 'Home', short: 'Home', icon: House },
  { to: 'menu', label: 'Our Menu', short: 'Menu', icon: ForkKnife },
  { to: 'orders', label: 'Your Orders', short: 'Orders', icon: Receipt },
  { to: 'recommend', label: 'Recommendations', short: 'Recommend', icon: Sparkle, isNew: true },
]

export function SkipLink() {
  return (
    <a
      href="#main"
      className="btn btn-primary sr-only z-50 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
    >
      Skip to Content
    </a>
  )
}

function useOrderingState(user, slug) {
  const [pendingKey, setPendingKey] = useState(null) // order being sent right now
  const [doneKey, setDoneKey] = useState(null) // order that just succeeded (shows a check)
  const [ordersVersion, setOrdersVersion] = useState(0) // bumped after every order so pages refetch
  const [toast, setToast] = useState(null)

  const placeOrder = useCallback(
    (items, key) => {
      setPendingKey(key)
      setToast(null)
      api
        .placeOrder(user.id, slug, items.map((item) => item.id))
        .then(({ total }) => {
          setToast({ ok: true, text: `Ordered ${joinNames(items)} for ${formatKES(total)}. Paid with M-Pesa.` })
          setDoneKey(key)
          setOrdersVersion((n) => n + 1)
        })
        .catch(() => setToast({ ok: false, text: "Your order didn't go through. Check your connection and try again." }))
        .finally(() => setPendingKey(null))
    },
    [user.id, slug],
  )

  useEffect(() => {
    if (!doneKey) return
    const timer = setTimeout(() => setDoneKey(null), 2500)
    return () => clearTimeout(timer)
  }, [doneKey])

  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 7000)
    return () => clearTimeout(timer)
  }, [toast])

  return { placeOrder, pendingKey, doneKey, ordersVersion, toast, dismissToast: () => setToast(null) }
}

function Toast({ toast, onDismiss, ordersHref }) {
  // The live region is always in the page, so screen readers announce new messages reliably.
  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-30 flex justify-center lg:bottom-6"
    >
      {toast && (
        <div className="pointer-events-auto flex w-full max-w-xl items-start gap-3 rounded-2xl bg-ink p-4 text-bg shadow-raised">
          {toast.ok ? (
            <CheckCircle weight="fill" aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          ) : (
            <WarningCircle weight="fill" aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          )}
          <p className="flex-1 font-semibold">
            {toast.text}{' '}
            {toast.ok && (
              <Link to={ordersHref} className="underline underline-offset-4">
                View Your Orders
              </Link>
            )}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss message"
            className="-m-2 grid size-11 shrink-0 place-items-center rounded-full hover:bg-bg/15"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </div>
      )}
    </div>
  )
}

function PageSkeleton() {
  return (
    <div className="grid gap-6">
      <LoadingLine />
      <Skeleton className="h-12 w-2/3 max-w-md" />
      <Skeleton className="h-6 w-full max-w-lg" />
      <Skeleton className="h-72 w-full" />
    </div>
  )
}

function LoadingLine() {
  return <p role="status" className="sr-only">Loading…</p>
}

export default function RestaurantLayout() {
  const { slug } = useParams()
  const { user } = useSession()
  const location = useLocation()
  const { data: restaurant, error, reload } = useApi(() => api.restaurant(slug), slug)
  const ordering = useOrderingState(user, slug)
  const notFound = error?.message.includes('404')

  const restaurantValue = useMemo(
    () => (restaurant ? { restaurant, slug, ordersVersion: ordering.ordersVersion } : null),
    [restaurant, slug, ordering.ordersVersion],
  )

  return (
    <div data-restaurant={slug} className="min-h-dvh bg-bg text-ink">
      <SkipLink />
      <header className="sticky top-0 z-20 border-b border-line bg-bg pt-[env(safe-area-inset-top)]">
        <div className="kikoi" />
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to={`/r/${slug}`} translate="no" className="min-w-0 truncate font-display text-xl font-bold">
            {restaurant?.name ?? <span className="sr-only">Restaurant</span>}
          </Link>
          <nav aria-label="Restaurant" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map(({ to, end, label, icon: Icon, isNew }) => (
                <li key={label}>
                  <NavLink
                    to={to ? `/r/${slug}/${to}` : `/r/${slug}`}
                    end={end}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-2 rounded-full px-4 text-[0.9375rem] font-semibold transition-colors ${
                        isActive ? 'bg-accent-soft text-accent-text' : 'text-ink hover:bg-surface-2'
                      }`
                    }
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {label}
                    {isNew && <span className="badge bg-accent text-on-accent">New</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <UserMenu />
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-[1200px] px-4 pt-8 pb-16 outline-none sm:px-6 lg:px-8 lg:pt-12 lg:pb-20"
      >
        {notFound ? (
          <div className="grid max-w-xl gap-4">
            <h1 className="t-h1">That Restaurant Isn&rsquo;t Here</h1>
            <p className="text-muted">The link may be old. Pick one of the restaurants on Chakula Combos instead.</p>
            <Link to="/restaurants" className="btn btn-primary justify-self-start">
              See All Restaurants
            </Link>
          </div>
        ) : error && !restaurant ? (
          <ErrorState message="This restaurant didn't load. Check your connection and try again." onRetry={reload} />
        ) : !restaurantValue ? (
          <PageSkeleton />
        ) : (
          <RestaurantContext.Provider value={restaurantValue}>
            <OrderingContext.Provider value={ordering}>
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Outlet />
              </motion.div>
            </OrderingContext.Provider>
          </RestaurantContext.Provider>
        )}
      </main>

      <footer className="mx-auto max-w-[1200px] px-4 pb-32 sm:px-6 lg:px-8 lg:pb-10">
        <p className="t-small border-t border-line pt-6 text-muted">
          <span translate="no">Chakula Combos</span> is a demo. The restaurants, people and orders are fictional. Dish photos come from
          Wikimedia Commons and Pexels; see CREDITS.md.
        </p>
      </footer>

      <nav
        aria-label="Restaurant"
        className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] shadow-raised lg:hidden"
      >
        <ul className="grid grid-cols-4">
          {NAV.map(({ to, end, short, icon: Icon }) => (
            <li key={short}>
              <NavLink
                to={to ? `/r/${slug}/${to}` : `/r/${slug}`}
                end={end}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-bold ${
                    isActive ? 'text-accent-text' : 'text-muted hover:text-ink'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`grid h-8 w-14 place-items-center rounded-full transition-colors ${isActive ? 'bg-accent-soft' : ''}`}
                    >
                      <Icon weight={isActive ? 'fill' : 'regular'} aria-hidden="true" className="size-6" />
                    </span>
                    {short}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Toast toast={ordering.toast} onDismiss={ordering.dismissToast} ordersHref={`/r/${slug}/orders`} />
    </div>
  )
}
