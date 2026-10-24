import { Link } from 'react-router'
import { ArrowRight, Sparkle } from '@phosphor-icons/react'
import DishImage from '../components/DishImage.jsx'
import OrderButton from '../components/OrderButton.jsx'
import { Price } from '../components/Price.jsx'
import { useRestaurant } from '../components/RestaurantLayout.jsx'
import { formatKES } from '../lib/format.js'

function SpecialCard({ special }) {
  const { item, special_price: specialPrice, note } = special
  const price = specialPrice ?? item.price
  // Ordering a special charges the menu price in this demo; the offer is shown for the impression.
  return (
    <li className="flex w-[78%] shrink-0 snap-start flex-col overflow-hidden rounded-2xl bg-surface ring-1 ring-line sm:w-[46%] lg:w-auto">
      <DishImage item={item} className="aspect-[16/10] h-auto w-full rounded-none text-4xl" width={640} height={400} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="grid gap-1">
          <h3 translate="no" className="t-h3">{item.name}</h3>
          <p className="t-small text-muted">{note}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3">
          <p className="grid">
            {specialPrice != null && (
              <span className="t-small tnum text-muted line-through">
                <span className="sr-only">Was </span>
                {formatKES(item.price)}
              </span>
            )}
            <span className="font-display text-2xl font-bold">
              {specialPrice != null && <span className="sr-only">Now </span>}
              <Price amount={price} />
            </span>
          </p>
          <OrderButton
            items={[item]}
            orderKey={`special:${item.id}`}
            accessibleName={`${item.name}, ${formatKES(item.price)}`}
            variant="secondary"
            className="btn-sm"
          />
        </div>
      </div>
    </li>
  )
}

export default function HomePage() {
  const { restaurant, slug } = useRestaurant()
  const discounted = restaurant.specials.filter((s) => s.special_price != null).length

  return (
    <div className="grid gap-16 lg:gap-24">
      {/* 1. Split hero: fits the first viewport, max 4 text elements. */}
      <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
        <div className="grid gap-5">
          <p className="t-small font-semibold text-accent-text">
            {restaurant.kind}, {restaurant.area}
          </p>
          <h1 translate="no" className="t-display">{restaurant.name}</h1>
          <p className="t-body-lg max-w-[42ch] text-muted">{restaurant.tagline}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={`/r/${slug}/recommend`} className="btn btn-primary">
              <Sparkle weight="fill" aria-hidden="true" className="size-5" />
              Get a Recommendation
            </Link>
            <Link to={`/r/${slug}/menu`} className="btn btn-secondary">
              See the Menu
            </Link>
          </div>
        </div>
        <img
          src={`/images/${restaurant.hero_image}`}
          alt=""
          width="640"
          height="480"
          fetchPriority="high"
          className="aspect-[4/3] w-full rounded-2xl bg-surface-2 object-cover"
        />
      </section>

      {/* 2. Today's specials: a scroll-snap row on phones, a grid on wide screens. */}
      <section aria-labelledby="specials-heading" className="grid gap-6">
        <div className="grid gap-1">
          <h2 id="specials-heading" className="t-h2">Today&rsquo;s Specials</h2>
          <p className="text-muted">
            {discounted > 0
              ? `${discounted} ${discounted === 1 ? 'offer' : 'offers'} on today, while they last.`
              : 'Fresh from the kitchen today.'}
          </p>
        </div>
        <ul className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:scroll-px-6 [scrollbar-width:thin] sm:-mx-6 sm:px-6 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
          {restaurant.specials.map((special) => (
            <SpecialCard key={special.item.id} special={special} />
          ))}
        </ul>
      </section>

      {/* 3. House quote: full width, 3 lines max, curly quotes. */}
      <section aria-label="From the house" className="grid gap-6">
        <figure className="grid max-w-4xl gap-4">
          <blockquote className="font-display text-3xl leading-tight font-semibold text-balance sm:text-4xl">
            &ldquo;{restaurant.quote}&rdquo;
          </blockquote>
          <figcaption className="t-small font-semibold text-muted">{restaurant.quote_by}</figcaption>
        </figure>
        <div className="kikoi max-w-md rounded-full" />
      </section>

      {/* 4. Callout for the new feature. */}
      <section
        aria-labelledby="new-heading"
        className="flex flex-col gap-5 rounded-2xl bg-accent-soft p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
      >
        <div className="grid gap-2">
          <span className="badge justify-self-start bg-accent text-on-accent">New</span>
          <h2 id="new-heading" className="t-h2">Not sure what to order?</h2>
          <p className="max-w-[52ch]">
            Set a budget and get the best-rated combo you can afford, minus what you had last time.
          </p>
        </div>
        <Link to={`/r/${slug}/recommend`} className="btn btn-primary shrink-0">
          Get a Recommendation
          <ArrowRight aria-hidden="true" className="size-5" />
        </Link>
      </section>
    </div>
  )
}
