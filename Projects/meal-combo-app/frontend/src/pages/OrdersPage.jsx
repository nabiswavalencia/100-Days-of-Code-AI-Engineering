import { Link } from 'react-router'
import { CheckCircle, Receipt } from '@phosphor-icons/react'
import DishImage from '../components/DishImage.jsx'
import OrderButton from '../components/OrderButton.jsx'
import { Price } from '../components/Price.jsx'
import { useRestaurant } from '../components/RestaurantLayout.jsx'
import { ErrorState, Skeleton } from '../components/States.jsx'
import { api } from '../lib/api.js'
import { formatDay, formatKES, formatTime, joinNames } from '../lib/format.js'
import { useApi } from '../lib/useApi.js'
import { useSession } from '../lib/session.jsx'

// Orders arrive newest first; group them under "Today", "Yesterday", "Tue, 6 Oct"...
export function groupByDay(orders, now = new Date()) {
  const groups = []
  for (const order of orders) {
    const label = formatDay(new Date(order.created_at), now)
    const last = groups.at(-1)
    if (last?.label === label) last.orders.push(order)
    else groups.push({ label, orders: [order] })
  }
  return groups
}

function OrderRow({ order }) {
  const when = new Date(order.created_at)
  return (
    <li className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <div className="flex shrink-0 -space-x-3" aria-hidden="true">
        {order.items.slice(0, 3).map((item, index) => (
          <DishImage key={`${item.id}-${index}`} item={item} className="size-14 text-lg ring-4 ring-bg" />
        ))}
      </div>
      <div className="grid min-w-0 flex-1 gap-1">
        <p translate="no" className="t-h3 break-words">{joinNames(order.items)}</p>
        <p className="t-small flex flex-wrap items-center gap-x-3 gap-y-1 text-muted">
          <time dateTime={order.created_at} className="tnum">{formatTime(when)}</time>
          <span className="inline-flex items-center gap-1 font-semibold text-accent-text">
            <CheckCircle weight="fill" aria-hidden="true" className="size-4" />
            Paid with {order.payment}
          </span>
        </p>
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <p className="font-display text-xl font-bold">
          <Price amount={order.total} />
        </p>
        <OrderButton
          items={order.items}
          orderKey={`again:${order.id}`}
          label="Order Again"
          accessibleName={joinNames(order.items, ' and ')}
          variant="secondary"
          className="btn-sm"
        />
      </div>
    </li>
  )
}

export default function OrdersPage() {
  const { restaurant, slug, ordersVersion } = useRestaurant()
  const { user } = useSession()
  const { data: orders, error, reload } = useApi(() => api.orders(user.id, slug), `${user.id}|${slug}|${ordersVersion}`, {
    keepPrevious: true,
  })

  const spent = orders?.reduce((sum, order) => sum + order.total, 0) ?? 0

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="t-h1">Your Orders</h1>
        <p className="text-muted">
          {orders?.length
            ? `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} at ${restaurant.name}, ${formatKES(spent)} in total.`
            : `Everything you order at ${restaurant.name} shows up here.`}
        </p>
      </div>

      {error && !orders ? (
        <ErrorState message="Your orders didn't load. Check your connection and try again." onRetry={reload} />
      ) : !orders ? (
        <div className="grid gap-4">
          <p role="status" className="sr-only">Loading your orders…</p>
          {[0, 1, 2].map((n) => <Skeleton key={n} className="h-20" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="grid max-w-lg justify-items-start gap-4 rounded-2xl bg-surface p-8">
          <Receipt aria-hidden="true" className="size-10 text-accent-text" />
          <h2 className="t-h2">No Orders Here Yet</h2>
          <p className="text-muted">Not sure where to start? Set a budget to see the best combo you can afford.</p>
          <Link to={`/r/${slug}/recommend`} className="btn btn-primary">
            Get a Recommendation
          </Link>
        </div>
      ) : (
        <div className="grid max-w-4xl gap-10">
          {groupByDay(orders).map((group, index) => (
            <section key={group.label} aria-labelledby={`day-${index}`} className="grid">
              <h2 id={`day-${index}`} className="t-small font-bold tracking-wide text-muted">
                {group.label}
              </h2>
              <ul className="divide-y divide-line">
                {group.orders.map((order) => (
                  <OrderRow key={order.id} order={order} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
