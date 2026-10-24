import DishImage from '../components/DishImage.jsx'
import OrderButton from '../components/OrderButton.jsx'
import { Price, Rating } from '../components/Price.jsx'
import { useRestaurant } from '../components/RestaurantLayout.jsx'
import { ErrorState, Skeleton } from '../components/States.jsx'
import { api } from '../lib/api.js'
import { formatKES } from '../lib/format.js'
import { useApi } from '../lib/useApi.js'

export const SLOT_LABELS = { main: 'Mains', side: 'Sides', drink: 'Drinks' }

function DishRow({ item }) {
  const onSpecial = item.regular_price != null && item.price < item.regular_price
  return (
    <li className="flex items-center gap-4 py-4">
      <DishImage item={item} className="size-18 text-xl sm:size-20" />
      <div className="grid min-w-0 flex-1 gap-1">
        <h3 translate="no" className="t-h3 break-words">{item.name}</h3>
        <p className="t-small flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <span className="font-bold text-ink">
            <Price amount={item.price} />
          </span>
          {onSpecial && (
            <span className="tnum line-through">
              <span className="sr-only">Usually </span>
              {formatKES(item.regular_price)}
            </span>
          )}
          <Rating value={item.rating} />
          <span className="tnum">{item.purchases} orders</span>
        </p>
        {onSpecial && <span className="badge justify-self-start">Today&rsquo;s special</span>}
      </div>
      <OrderButton
        items={[item]}
        orderKey={`menu:${item.id}`}
        accessibleName={`${item.name}, ${formatKES(item.price)}`}
        variant="secondary"
        className="btn-sm shrink-0"
      />
    </li>
  )
}

export default function MenuPage() {
  const { restaurant, slug, ordersVersion } = useRestaurant()
  // Refetched after an order so purchase counts stay current; the old menu stays up meanwhile.
  const { data: menu, error, reload } = useApi(() => api.menu(slug), `${slug}|${ordersVersion}`, {
    keepPrevious: true,
  })

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="t-h1">Our Menu</h1>
        <p className="text-muted">Everything {restaurant.name} is cooking today, with prices in shillings.</p>
      </div>

      {/* Jump links (real anchors) instead of tabs: the whole menu stays scannable and linkable. */}
      <nav aria-label="Menu sections" className="sticky top-[70px] z-10 -mx-4 bg-bg px-4 py-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <ul className="flex gap-2 overflow-x-auto">
          {Object.entries(SLOT_LABELS).map(([slot, label]) => (
            <li key={slot}>
              <a href={`#${slot}`} className="chip">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {error && !menu ? (
        <ErrorState message="The menu didn't load. Check your connection and try again." onRetry={reload} />
      ) : !menu ? (
        <div className="grid gap-4">
          <p role="status" className="sr-only">Loading the menu…</p>
          {[0, 1, 2, 3].map((n) => <Skeleton key={n} className="h-24" />)}
        </div>
      ) : (
        <div className="grid gap-12">
          {Object.entries(SLOT_LABELS).map(([slot, label]) => (
            <section key={slot} id={slot} aria-labelledby={`${slot}-heading`} className="grid gap-2">
              <h2 id={`${slot}-heading`} className="t-h2">{label}</h2>
              <ul className="grid gap-x-10 divide-y divide-line md:grid-cols-2 md:divide-y-0">
                {menu[slot].map((item) => (
                  <DishRow key={item.id} item={item} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
