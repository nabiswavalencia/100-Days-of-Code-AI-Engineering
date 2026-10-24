import { Link } from 'react-router'
import UserMenu from '../components/UserMenu.jsx'
import { ErrorState, Skeleton } from '../components/States.jsx'
import { SkipLink } from '../components/RestaurantLayout.jsx'
import { Wordmark } from './LoginPage.jsx'
import { api } from '../lib/api.js'
import { formatKES } from '../lib/format.js'
import { useApi } from '../lib/useApi.js'
import { useSession } from '../lib/session.jsx'

// Exactly 4 cells for 4 restaurants: one tall tile, two side by side, one wide (DESIGN.md §5).
const TILE_LAYOUT = [
  'sm:col-span-2 lg:col-span-1 lg:row-span-2',
  '',
  '',
  'sm:col-span-2 lg:col-span-2',
]
const IMAGE_HEIGHT = ['h-56 lg:h-auto lg:flex-1', 'h-44', 'h-44', 'h-44 lg:h-40']

export default function RestaurantsPage() {
  const { user } = useSession()
  const { data: restaurants, error, reload } = useApi(api.restaurants, 'restaurants')

  return (
    <div className="min-h-dvh">
      <SkipLink />
      <header className="border-b border-line pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6 lg:px-8">
          <Wordmark />
          <UserMenu showChangeRestaurant={false} />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto grid max-w-[1200px] gap-8 px-4 py-10 outline-none sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-2">
          <p className="t-body-lg text-muted">Habari, {user.name.split(' ')[0]}.</p>
          <h1 className="t-h1">Where are you eating today?</h1>
        </div>

        {error ? (
          <ErrorState message="The restaurants didn't load. Check your connection and try again." onRetry={reload} />
        ) : !restaurants ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-2">
            <p role="status" className="sr-only">Loading restaurants…</p>
            {TILE_LAYOUT.map((layout, n) => <Skeleton key={n} className={`h-72 ${layout}`} />)}
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:grid-rows-[auto_auto]">
            {restaurants.map((restaurant, index) => (
              <li key={restaurant.id} data-restaurant={restaurant.id} className={`flex ${TILE_LAYOUT[index] ?? ''}`}>
                <Link
                  to={`/r/${restaurant.id}`}
                  className="group flex w-full flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition-[box-shadow,transform] hover:ring-2 hover:ring-ink active:scale-[0.99]"
                >
                  <img
                    src={`/images/${restaurant.hero_image}`}
                    alt=""
                    width="640"
                    height="420"
                    fetchPriority={index === 0 ? 'high' : undefined}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    className={`w-full object-cover ${IMAGE_HEIGHT[index] ?? 'h-44'}`}
                  />
                  <div className="kikoi" />
                  <div className="grid gap-1 p-5">
                    <h2 translate="no" className="font-display text-xl leading-7 font-bold">{restaurant.name}</h2>
                    <p className="t-small text-muted">
                      {restaurant.kind}, {restaurant.area}
                    </p>
                    <p className="t-small tnum font-semibold">
                      {formatKES(restaurant.min_price)} to {formatKES(restaurant.max_price)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  )
}
