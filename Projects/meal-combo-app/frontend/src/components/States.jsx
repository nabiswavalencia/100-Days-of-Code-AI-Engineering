import { WarningCircle } from '@phosphor-icons/react'

// Inline error with a way out (audit: v1 replaced the whole page with one line of text).
export function ErrorState({ message, onRetry, className = '' }) {
  return (
    <div role="alert" className={`flex flex-col items-start gap-3 rounded-2xl bg-surface p-5 ${className}`}>
      <p className="flex items-start gap-2 font-semibold text-danger">
        <WarningCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
        {message}
      </p>
      {onRetry && (
        <button type="button" className="btn btn-secondary btn-sm" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  )
}

export function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`skeleton ${className}`} />
}

// Announced once by screen readers; the wrapper never re-announces a whole panel.
export function LoadingText({ children }) {
  return <p role="status" className="sr-only">{children}</p>
}
