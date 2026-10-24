import { Check } from '@phosphor-icons/react'
import { useOrdering } from './RestaurantLayout.jsx'

// One button for every "Order" action. All of them disable while any order is sending,
// so a double click can't order twice (v1 regression). The accessible name always says
// what is being ordered (audit: three identical "Order" buttons).
export default function OrderButton({ items, orderKey, label = 'Order', accessibleName, variant = 'primary', className = '' }) {
  const { placeOrder, pendingKey, doneKey } = useOrdering()
  const sending = pendingKey === orderKey
  const done = doneKey === orderKey && !sending

  return (
    <button
      type="button"
      className={`btn btn-${variant} ${className}`}
      disabled={pendingKey !== null}
      aria-label={sending ? `Ordering ${accessibleName}` : `${label} ${accessibleName}`}
      onClick={() => placeOrder(items, orderKey)}
    >
      {done && <Check weight="bold" aria-hidden="true" className="size-4" />}
      {sending ? 'Ordering…' : done ? 'Ordered' : label}
    </button>
  )
}
