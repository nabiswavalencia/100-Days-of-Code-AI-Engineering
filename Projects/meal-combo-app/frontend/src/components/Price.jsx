import { Star } from '@phosphor-icons/react'
import { formatKES, formatRating } from '../lib/format.js'

export function Price({ amount, className = '' }) {
  return <span className={`tnum ${className}`}>{formatKES(amount)}</span>
}

// The star is decorative; screen readers hear "4.6 rating".
export function Rating({ value, suffix = 'rating', className = '' }) {
  return (
    <span className={`inline-flex items-center gap-1 tnum ${className}`}>
      <Star weight="fill" aria-hidden="true" className="size-4 text-accent-text" />
      {formatRating(value)}
      <span className="sr-only"> {suffix}</span>
    </span>
  )
}
