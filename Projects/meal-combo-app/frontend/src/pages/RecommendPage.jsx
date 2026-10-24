import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'
import { LayoutGroup, motion } from 'motion/react'
import { CaretDown, Prohibit, Trophy, WarningCircle } from '@phosphor-icons/react'
import DishImage from '../components/DishImage.jsx'
import OrderButton from '../components/OrderButton.jsx'
import { Price, Rating } from '../components/Price.jsx'
import { useRestaurant } from '../components/RestaurantLayout.jsx'
import { ErrorState, Skeleton } from '../components/States.jsx'
import { SLOT_LABELS } from './MenuPage.jsx'
import { api } from '../lib/api.js'
import { parseBudget } from '../lib/budget.js'
import { comboKey, comboShape } from '../lib/combo.js'
import { formatKES, joinNames } from '../lib/format.js'
import { useApi } from '../lib/useApi.js'
import { useDebounced } from '../lib/useDebounced.js'
import { useSession } from '../lib/session.jsx'

const spring = { type: 'spring', stiffness: 260, damping: 30 }

// The cheapest combo you could still get: the cheapest main plus the cheapest side or drink.
export function cheapestCombo(menu, skip) {
  const allowed = (slot) => menu[slot].filter((item) => !skip.includes(item.id)).map((item) => item.price)
  const mains = allowed('main')
  const extras = [...allowed('side'), ...allowed('drink')]
  if (!mains.length || !extras.length) return null
  return Math.min(...mains) + Math.min(...extras)
}

// ---------- Controls ----------

function BudgetField({ value, onChange, error, presets }) {
  return (
    <div className="grid gap-3">
      <div className="grid gap-2">
        <label htmlFor="budget" className="font-semibold">
          Your budget (KES)
        </label>
        <div className="field" data-invalid={Boolean(error)}>
          <span aria-hidden="true" className="font-semibold text-muted">KES</span>
          <input
            id="budget"
            name="budget"
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'budget-error' : undefined}
            className="tnum font-display text-2xl font-bold"
          />
        </div>
        {/* Always in the page, so screen readers announce the error as soon as it appears. */}
        <p id="budget-error" aria-live="polite" className="t-small flex items-start gap-1.5 font-semibold text-danger empty:hidden">
          {error && <WarningCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />}
          {error}
        </p>
      </div>
      <div role="group" aria-label="Quick budgets" className="flex flex-wrap gap-2">
        {presets.map((amount) => (
          <button
            key={amount}
            type="button"
            className="chip tnum"
            aria-pressed={value === String(amount)}
            onClick={() => onChange(String(amount))}
          >
            {formatKES(amount)}
          </button>
        ))}
      </div>
    </div>
  )
}

function SkipPicker({ menu, skip, onToggle, fromRecent }) {
  const detailsRef = useRef(null)
  // Open on wide screens, collapsed on phones so the Top pick stays near the top.
  useEffect(() => {
    if (window.matchMedia('(min-width: 1024px)').matches && detailsRef.current) detailsRef.current.open = true
  }, [])

  return (
    <details ref={detailsRef} className="group border-t border-line pt-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 font-semibold [&::-webkit-details-marker]:hidden">
        <span>
          Skip what you had recently
          <span className="t-small block font-medium text-muted">
            {skip.length === 0 ? 'Nothing skipped' : `Skipping ${skip.length} ${skip.length === 1 ? 'dish' : 'dishes'}`}
          </span>
        </span>
        <CaretDown aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-180" />
      </summary>
      <div className="grid gap-4 pt-3">
        {fromRecent && (
          <p className="t-small text-muted">Filled in from what you ordered here in the last 24 hours. Tap a dish to change it.</p>
        )}
        {!menu ? (
          <Skeleton className="h-24" />
        ) : (
          Object.entries(SLOT_LABELS).map(([slot, label]) => (
            <div key={slot} role="group" aria-label={`Skip ${label.toLowerCase()}`} className="grid gap-2">
              <p className="t-small font-semibold text-muted">{label}</p>
              <div className="flex flex-wrap gap-2">
                {menu[slot].map((item) => {
                  const skipped = skip.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className="chip chip-skip"
                      aria-pressed={skipped}
                      aria-label={`Skip ${item.name}`}
                      onClick={() => onToggle(item.id)}
                    >
                      {skipped && <Prohibit aria-hidden="true" className="size-4" />}
                      <span translate="no" className="chip-label">{item.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </details>
  )
}

// ---------- Results ----------

function TopPick({ combo }) {
  const name = joinNames(combo.items, ' and ')
  return (
    <motion.li
      layout
      transition={spring}
      className="grid gap-5 rounded-2xl bg-surface p-5 shadow-raised ring-1 ring-line sm:p-7"
    >
      <div className="flex flex-wrap gap-2">
        <span className="badge">
          <Trophy weight="fill" aria-hidden="true" className="size-3.5" />
          Top pick
        </span>
        <span className="badge badge-quiet">{comboShape(combo)}</span>
      </div>
      <div className="flex gap-3" aria-hidden="true">
        {combo.items.map((item) => (
          <DishImage key={item.id} item={item} className="size-20 text-2xl sm:size-28 sm:text-3xl" width={224} height={224} />
        ))}
      </div>
      <h3 translate="no" className="font-display text-2xl leading-tight font-bold break-words sm:text-3xl">{joinNames(combo.items)}</h3>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="grid gap-1">
          <p className="font-display text-4xl leading-none font-bold">
            <Price amount={combo.total} />
          </p>
          <p className="t-small text-muted">
            <Rating value={combo.avg_rating} suffix="average rating" /> <span aria-hidden="true">average</span>
          </p>
        </div>
        <OrderButton
          items={combo.items}
          orderKey={comboKey(combo)}
          label="Order This Combo"
          accessibleName={`${name}, ${formatKES(combo.total)}`}
        />
      </div>
    </motion.li>
  )
}

function RunnerUp({ combo, rank }) {
  return (
    <motion.li layout transition={spring} className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center">
      <div className="flex items-center gap-4 sm:flex-1">
        <span className="w-6 shrink-0 font-display text-2xl font-bold text-muted" aria-hidden="true">
          {rank}
        </span>
        <div className="flex shrink-0 -space-x-3" aria-hidden="true">
          {combo.items.map((item) => (
            <DishImage key={item.id} item={item} className="size-12 text-base ring-4 ring-bg" />
          ))}
        </div>
        <div className="grid min-w-0 gap-1">
          <h3 translate="no" className="t-h3 break-words">{joinNames(combo.items)}</h3>
          <p className="t-small flex flex-wrap gap-x-3 text-muted">
            <span className="font-bold text-ink"><Price amount={combo.total} /></span>
            <Rating value={combo.avg_rating} suffix="average rating" />
            <span>{comboShape(combo)}</span>
          </p>
        </div>
      </div>
      <OrderButton
        items={combo.items}
        orderKey={comboKey(combo)}
        accessibleName={`${joinNames(combo.items, ' and ')}, ${formatKES(combo.total)}`}
        variant="secondary"
        className="btn-sm self-start sm:self-center"
      />
    </motion.li>
  )
}

function Results({ status, combos, budget, cheapest, onUseBudget, onRetry }) {
  if (status === 'invalid') {
    return <p className="rounded-2xl bg-surface p-6 text-muted">Fix the budget to see your picks.</p>
  }
  if (status === 'empty-budget') {
    return <p className="rounded-2xl bg-surface p-6 text-muted">Enter a budget to see your top picks.</p>
  }
  if (status === 'error' && !combos) {
    return <ErrorState message="Recommendations didn't load. Check your connection and try again." onRetry={onRetry} />
  }
  if (!combos) {
    return (
      <div className="grid gap-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    )
  }
  if (combos.length === 0) {
    return (
      <div className="grid justify-items-start gap-3 rounded-2xl bg-surface p-6">
        <h3 className="t-h3">Nothing fits {formatKES(budget)} here</h3>
        <p className="text-muted">
          {cheapest != null
            ? `The cheapest combo here costs ${formatKES(cheapest)}. Raise your budget or skip fewer dishes.`
            : 'Every main or every side and drink is skipped. Skip fewer dishes to see picks.'}
        </p>
        {cheapest != null && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onUseBudget(cheapest)}>
            Use {formatKES(cheapest)}
          </button>
        )}
      </div>
    )
  }

  const [top, ...rest] = combos
  return (
    <div className="grid gap-3">
      {status === 'error' && (
        <ErrorState message="These picks didn't refresh, so they may be out of date. Try again in a moment." onRetry={onRetry} />
      )}
      <LayoutGroup>
        <ol className={`grid ${status === 'loading' ? 'is-stale' : ''}`} aria-busy={status === 'loading'}>
          <TopPick key={comboKey(top)} combo={top} />
          {rest.length > 0 && (
            <li className="pt-4" aria-hidden="true">
              <p className="t-small font-semibold text-muted">Also good</p>
            </li>
          )}
          {rest.map((combo, index) => (
            <RunnerUp key={comboKey(combo)} combo={combo} rank={index + 2} />
          ))}
        </ol>
      </LayoutGroup>
    </div>
  )
}

// ---------- Page ----------

export default function RecommendPage() {
  const { restaurant, slug, ordersVersion } = useRestaurant()
  const { user } = useSession()
  const [params, setParams] = useSearchParams()

  // The URL holds the budget and skipped dishes, so a set of picks can be shared or bookmarked.
  const budgetText = params.get('budget') ?? String(restaurant.default_budget)
  const skipParam = params.get('skip')

  const { data: menu } = useApi(() => api.menu(slug), slug)
  // Everything you ordered here in the last 24 hours pre-fills "skip", so you don't get
  // the same meal again. The database works this out (v2 only looked at your last order).
  const { data: recent, error: recentError } = useApi(() => api.recentItems(user.id, slug), `${user.id}|${slug}`)
  const recentIds = recent?.item_ids ?? []
  const skip = skipParam != null ? skipParam.split(',').filter(Boolean) : recentIds
  const skipKnown = skipParam != null || recent != null || recentError != null

  // Show errors as you type, but only ask the API once typing pauses.
  const { budget: typedBudget, error: budgetError } = parseBudget(budgetText)
  const { budget } = parseBudget(useDebounced(budgetText, 300))
  const settled = budget === typedBudget

  const requestKey =
    budget != null && skipKnown ? `${slug}|${budget}|${[...skip].sort().join(',')}|${ordersVersion}` : null
  const recs = useApi(() => api.recommend(slug, budget, skip), requestKey, { keepPrevious: true })

  function update(changes) {
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(changes).forEach(([key, value]) => next.set(key, value))
        return next
      },
      { replace: true },
    )
  }

  function toggleSkip(id) {
    // Never mutate state directly; always build a new list.
    const next = skip.includes(id) ? skip.filter((itemId) => itemId !== id) : [...skip, id]
    update({ skip: next.join(',') })
  }

  let status = 'done'
  if (budgetError) status = 'invalid'
  else if (typedBudget == null) status = 'empty-budget'
  else if (recs.error) status = 'error'
  else if (recs.loading || !settled || !skipKnown) status = 'loading'

  const combos = status === 'invalid' || status === 'empty-budget' ? null : recs.data
  const announcement =
    status === 'loading'
      ? 'Finding the best combos…'
      : status === 'done' && combos
        ? combos.length
          ? `${combos.length} picks. Top pick: ${joinNames(combos[0].items, ' and ')}, ${formatKES(combos[0].total)}.`
          : `Nothing fits ${formatKES(budget)}.`
        : ''

  return (
    <div className="grid gap-8">
      <div className="grid gap-2">
        <h1 className="t-h1 flex flex-wrap items-center gap-3">
          Recommendations
          <span className="badge bg-accent text-on-accent">New</span>
        </h1>
        <p className="max-w-[60ch] text-muted">
          Set a budget to see every combo on the menu, ranked by rating and popularity.
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(300px,360px)_1fr] lg:gap-12">
        <section
          aria-label="Budget and dishes to skip"
          className="grid min-w-0 gap-5 rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6 lg:sticky lg:top-24 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain"
        >
          <BudgetField
            value={budgetText}
            onChange={(text) => update({ budget: text })}
            error={budgetError}
            presets={restaurant.presets}
          />
          <SkipPicker menu={menu} skip={skip} onToggle={toggleSkip} fromRecent={skipParam == null && recentIds.length > 0} />
        </section>

        <section aria-labelledby="results-heading" className="grid min-w-0 gap-4">
          <h2 id="results-heading" className="t-h2">
            {typedBudget != null && !budgetError ? `Top Picks for ${formatKES(typedBudget)}` : 'Top Picks'}
          </h2>
          <p role="status" className="sr-only">{announcement}</p>
          <Results
            status={status}
            combos={combos}
            budget={budget}
            cheapest={menu ? cheapestCombo(menu, skip) : null}
            onUseBudget={(amount) => update({ budget: String(amount) })}
            onRetry={recs.reload}
          />
        </section>
      </div>
    </div>
  )
}
