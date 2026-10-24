import { ForkKnife, GraduationCap, Laptop, UsersThree } from '@phosphor-icons/react'

// Each demo profile gets an icon that says who they are, in a tinted circle
// (DESIGN.md §1: no generic user icons, no initials). The name is always printed
// next to the avatar, so the avatar itself is decorative.
const ICONS = {
  achieng: GraduationCap, // student
  brian: Laptop, // software engineer
  fatuma: UsersThree, // parent of two
}

export default function Avatar({ user, size = 'md' }) {
  const Icon = ICONS[user.id] ?? ForkKnife
  const sizes = { sm: 'size-9', md: 'size-11', lg: 'size-14' }
  const iconSizes = { sm: 'size-5', md: 'size-6', lg: 'size-7' }
  return (
    <span
      data-user={user.id}
      aria-hidden="true"
      className={`avatar inline-grid shrink-0 place-items-center rounded-full ${sizes[size]}`}
    >
      <Icon weight="duotone" className={iconSizes[size]} />
    </span>
  )
}
