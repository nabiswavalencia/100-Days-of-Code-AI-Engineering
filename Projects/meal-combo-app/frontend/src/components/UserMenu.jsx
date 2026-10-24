import { useEffect, useId, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { CaretDown, SignOut, Storefront } from '@phosphor-icons/react'
import Avatar from './Avatar.jsx'
import { useSession } from '../lib/session.jsx'

// A disclosure (button + list of links), not an ARIA menu: simpler and works with
// Tab, Enter and Escape out of the box.
export default function UserMenu({ showChangeRestaurant = true }) {
  const { user, signOut } = useSession()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const rootRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(event) {
      if (!rootRef.current?.contains(event.target)) setOpen(false)
    }
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) return null
  const firstName = user.name.split(' ')[0]

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="btn btn-ghost gap-2 pr-2 pl-1"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((value) => !value)}
      >
        <Avatar user={user} size="sm" />
        <span className="hidden sm:inline">{firstName}</span>
        <span className="sr-only sm:hidden">{firstName}</span>
        <CaretDown aria-hidden="true" className="size-4 text-muted" />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute right-0 z-40 mt-2 w-64 rounded-2xl bg-surface p-2 shadow-raised ring-1 ring-line"
        >
          <div className="flex items-center gap-3 px-3 py-3">
            <Avatar user={user} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{user.name}</p>
              <p className="t-small truncate text-muted">{user.profile}</p>
            </div>
          </div>
          <ul className="border-t border-line pt-2">
            {showChangeRestaurant && (
              <li>
                <Link
                  to="/restaurants"
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center gap-3 rounded-xl px-3 font-semibold hover:bg-surface-2"
                >
                  <Storefront aria-hidden="true" className="size-5" />
                  Change Restaurant
                </Link>
              </li>
            )}
            <li>
              <button
                type="button"
                onClick={() => {
                  signOut()
                  navigate('/login')
                }}
                className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left font-semibold hover:bg-surface-2"
              >
                <SignOut aria-hidden="true" className="size-5" />
                Log Out
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
