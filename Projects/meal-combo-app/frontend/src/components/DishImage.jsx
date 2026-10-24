// A dish photo with explicit dimensions (no layout shift), or a tinted tile with the
// dish's initial when there's no photo. Decorative by default: the dish name is always
// printed right next to it, so screen readers don't need to hear it twice.
export default function DishImage({ item, className = 'size-16', width = 160, height = 160, priority = false, alt = '' }) {
  if (!item.image) {
    return (
      <span
        aria-hidden={alt ? undefined : 'true'}
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={`grid shrink-0 place-items-center overflow-hidden rounded-2xl bg-accent-soft font-display font-bold text-accent-text ${className}`}
      >
        <span className="text-[1.5em] leading-none">{item.name[0]}</span>
      </span>
    )
  }
  return (
    <img
      src={`/images/${item.image}`}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`shrink-0 rounded-2xl bg-surface-2 object-cover ${className}`}
    />
  )
}
