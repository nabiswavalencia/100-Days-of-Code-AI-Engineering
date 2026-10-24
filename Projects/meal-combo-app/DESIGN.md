# Chakula Combos v2: Design Direction

Every component in this app follows this file. If a component needs something that isn't here, add it here first.

**Design read:** a full visual overhaul of a consumer restaurant app for Kenyan diners. The look is warm and market-bright, like Kenyan food itself. It is built with Tailwind v4, custom tokens, self-hosted fonts and restrained Motion.

**Dials:** `DESIGN_VARIANCE 6` · `MOTION_INTENSITY 4` · `VISUAL_DENSITY 5`.
This is product UI (menus, orders, a recommender), not a landing page. Restaurant Home pages get the expressive treatment, and the working pages (Menu, Orders, Recommendations) stay calm and easy to scan.

---

## 1. Product structure

```
/login                          pick one of 3 demo profiles (no passwords)
/restaurants                    "Where are you eating today?"  (4 restaurants)
/r/:slug                        Home: hero, today's specials, the house quote
/r/:slug/menu                   Our Menu
/r/:slug/orders                 Your Orders (this user, this restaurant)
/r/:slug/recommend              Recommendations  ← the feature we are launching ("New" badge)
```

The URL holds the restaurant and the page, so every view can be deep-linked (audit: no URL state).

### The four restaurants (all fictional)

| Slug | Name | Kind | Price range (KES) | Budget presets | Accent |
|---|---|---|---|---|---|
| `mama-wanjiku` | Mama Wanjiku's Kibanda | Local kibanda | 30 - 220 | 150 · 200 · 300 | Sukuma green |
| `kahawa-house` | Kahawa House | Café | 150 - 650 | 400 · 600 · 900 | Coffee-cherry red |
| `baobab-room` | The Baobab Room | Upscale dining | 450 - 2,900 | 2,000 · 3,500 · 5,000 | Lamu blue |
| `moto` | Moto Pizza & Chicken | Fast food | 120 - 1,400 | 600 · 1,000 · 1,500 | Maize yellow |

Each restaurant has: a tagline, a one-line house quote with attribution, 2-3 "today's specials" (one with a discount), and a menu in the same `main / side / drink` slots, so the existing engine works unchanged.

### The three demo users

| Name | Profile | Usual spots | Seeded orders |
|---|---|---|---|
| Achieng Otieno | Student at UoN, tight budget | Mama Wanjiku's, Moto | Many small orders |
| Brian Kiprono | Software engineer in Westlands | Kahawa House, Baobab Room | Weekday lunches, one dinner |
| Fatuma Hassan | Parent of two in South B | Moto, Mama Wanjiku's | Family-sized orders |

Avatars are a Phosphor icon that says who the person is (graduation cap, laptop, family) in a tinted circle. No initials, no generic user icon.

---

## 2. Colour

The shell is a neutral leafy off-white with a near-black "jiko charcoal" text colour. It deliberately avoids the cream/brass/espresso palette of the old app. **Each restaurant brings exactly one accent, and the accent is locked for every page of that restaurant.** The shell pages (login, restaurant picker) use no accent. Charcoal is the action colour there, and the restaurant colours appear only on each restaurant's own card.

### Neutrals (CSS variables, light / dark)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` | `#F2F3EE` | `#121410` | Page |
| `--surface` | `#FBFBF8` | `#1B1E19` | Raised panels, inputs |
| `--surface-2` | `#E8EAE2` | `#252922` | Quiet fills, skeletons |
| `--ink` | `#1B1E19` | `#ECEEE7` | Text (15:1) |
| `--muted` | `#565C52` | `#A3A99C` | Secondary text (≥ 6:1) |
| `--line` | `#D9DCD2` | `#30352D` | Hairline dividers only (decorative) |
| `--field` | `#868C80` | `#6E7468` | Input / control borders (≥ 3.3:1, passes non-text) |
| `--danger` | `#B42318` | `#F28B7F` | Errors (5.9:1) |

### Restaurant accents

Three tokens per restaurant, so a fill colour is never reused as a text colour where it fails contrast:

| Restaurant | `--accent` (fills) | `--on-accent` (text on fill) | `--accent-text` (accent as text) | `--accent-soft` (tint) | Dark `--accent` |
|---|---|---|---|---|---|
| Mama Wanjiku's | `#2E6B3E` | `#FBFBF8` (6.2:1) | `#2E6B3E` (5.7:1) | `#E3EFE4` | `#7FC38F` |
| Kahawa House | `#A3372A` | `#FBFBF8` (6.5:1) | `#A3372A` (6.0:1) | `#F6E3DF` | `#F08A7A` |
| The Baobab Room | `#1F4A73` | `#FBFBF8` (8.9:1) | `#1F4A73` (8.2:1) | `#E1E9F2` | `#8DB8E3` |
| Moto | `#E8A10C` | `#1B1E19` (7.7:1) | `#855300` (5.8:1) | `#FBEFCF` | `#F5B937` |

In dark mode `--on-accent` is `#121410` for every restaurant, and `--accent-text` equals the dark `--accent`. All pairs are ≥ 7.6:1.

Accent text on its own soft tint is ≥ 5.4:1 for all four (this fixes the old "Top pick" badge at 4.45:1).

### Pattern

**Kikoi stripe:** a thin band of the accent, `--accent-soft` and `--ink`, drawn with `repeating-linear-gradient` (no SVG illustration). It's used in only two places: the top edge of the restaurant header, and under the house quote. Don't use it anywhere else.

---

## 3. Typography

Self-hosted with `@fontsource-variable/*`, `font-display: swap`, no Google Fonts `<link>`.

- **Display: Bricolage Grotesque (variable).** It's a warm, slightly irregular grotesque that feels hand-painted, like a kibanda signboard, without being a novelty font. Use it for headings, restaurant names and big prices.
- **Body / UI: Manrope (variable).** It's clean and has tabular figures. Use it for everything else.
- No serif. No italics inside display headlines.

| Step | Size / line-height | Font | Use |
|---|---|---|---|
| `display` | 56/60 desktop, 40/44 mobile, weight 700, tracking -0.02em | Bricolage | Restaurant name in Home hero |
| `h1` | 40/44 desktop, 32/36 mobile, 700 | Bricolage | Page titles |
| `h2` | 28/32, 650 | Bricolage | Section headings |
| `h3` | 20/26, 600 | Manrope | Card titles, dish names |
| `body-lg` | 18/28, 450 | Manrope | Hero subtext, quotes |
| `body` | 16/24, 450 | Manrope | Default |
| `small` | 14/20, 500 | Manrope | Meta, labels |
| `micro` | 12/16, 600 | Manrope | Badges only, never body copy |

Rules (from the audit):
- `text-wrap: balance` on h1-h3, `text-wrap: pretty` on paragraphs, max line length 65ch.
- All prices use `tabular-nums` and go through one `formatKES()` helper built on `Intl.NumberFormat("en-KE")`. They render as `KES 1,400`, with a non-breaking space after KES.
- Use the real ellipsis `…` (`Loading…`, `Ordering…`) and curly quotes in all copy.
- No em-dashes in UI copy. No emoji as the only success cue (use an icon and text).

---

## 4. Spacing, shape and elevation

**Spacing scale (4px base):** `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`. Nothing in between.
- Inside a component: 8-16. Between components: 24-32. Between page sections: 64 desktop, 48 mobile.
- Page gutter: 16 mobile, 24 tablet, 32 desktop. Content max width 1200px.

**Shape rule (one system, documented):**
- Interactive pills (buttons, chips, tabs, badges): fully rounded `999px`.
- Containers (cards, panels, images): `16px`.
- Inputs: `12px`.

**Elevation:** don't nest cards. Group with space and a single `--line` divider. Only two things get a raised surface with a tinted shadow (`0 8px 24px rgb(27 30 25 / .08)`): the **Top pick** card and the **mobile bottom bar**. Everything else is flat on `--bg` or `--surface`.

**Touch targets:** every control is at least 44×44px (audit: old buttons were about 30px).

---

## 5. Layout per page

**App shell (inside a restaurant)**
- Desktop: a top bar, 64px high and on one line. It has the restaurant wordmark on the left; Home, Our Menu, Your Orders and Recommendations (with a "New" badge) in the centre; and the user avatar menu (switch restaurant, log out) on the right.
- Mobile (< 768px): a slim top bar with the restaurant name and avatar, plus a **fixed bottom tab bar** with the same 4 tabs, icon and label. It uses `env(safe-area-inset-bottom)`.
- A skip link to `#main` comes first in the tab order.

**Login:** 50/50 split on desktop. Left: an app wordmark, a one-line promise and a food photo. Right: "Who's eating?" with the 3 profile cards (avatar, name, one-line profile, "Continue as Achieng"). On mobile it stacks: the photo becomes a 160px banner, with the profiles under it.

**Restaurant picker:** an asymmetric 4-cell grid on desktop (1 large tile spanning 2 rows, 3 smaller tiles). That's exactly 4 cells for 4 restaurants. Each tile has a photo, the name, the kind, a price range and an accent stripe. It's one column on mobile.

**Home (`/r/:slug`)** has three different layout families:
1. **Split hero:** text on the left (restaurant name in `display`, tagline of 20 words or fewer, primary CTA "Get a Recommendation" and secondary "See the Menu"), and a photo on the right. It fits in the first viewport.
2. **Today's specials:** a horizontal scroll-snap row of 2-3 cards (photo, dish, price, a struck-through old price if discounted, and the end time). It becomes a grid on wide screens if there are 3 or fewer.
3. **House quote:** full width, `body-lg`, 3 lines at most, curly quotes, attribution "Mama Wanjiku, owner", with the kikoi stripe below.
A slim callout introduces Recommendations as new. No eyebrow labels, except at most one on the hero.

**Our Menu:** sticky jump links (Mains · Sides · Drinks) that are real anchor links (`#main`, `#side`, `#drink`). *(Changed while building: tabs would hide two thirds of a 10-dish menu, so all three sections stay visible and the links just jump to them.)* Dishes go in a 2-column grid on desktop and 1 column on mobile. Each dish row has a 64px square photo, the name (h3), price, rating and order count. Rows are separated by space, not borders. Each dish has an "Order" button with an accessible name like "Order Pilau".

**Recommendations (`/r/:slug/recommend`)**, the hero feature:
- Desktop: 2 columns (`minmax(300px, 360px) 1fr`). On the left is a **controls panel**: a budget input with a fixed `KES` prefix, preset chips scaled to that restaurant, and "Skip what you had recently" chips pre-filled from everything the user ordered there in the last 24 hours (`/recent-items`, Day 44). On the right are the **results**.
- The results use a different layout for #1 than for #2 and #3. **#1 Top pick** is a large raised card with photos of the items in a row, the names, the total in big display figures, the average rating and an "Order this combo" button. **#2 and #3** are compact rows underneath.
- Mobile: the controls become a compact block at the top (input and chips), and the skip chips go into a disclosure ("Skip 2 items ▾"), so the Top pick shows above the fold (audit: the old phone layout pushed the first dish about 1,000px down).
- The controls panel is sticky on desktop with `max-height: calc(100dvh - 96px); overflow:auto` (audit: the old sticky sidebar was unreachable).
- The input is debounced by 300ms (audit: one request per keystroke).
- Budget and skipped dishes live in the URL (`?budget=300&skip=mw-pilau,mw-chai`).

**Special prices:** a special's price replaces the menu price everywhere: on the menu (with the old price struck through), in recommendations and in order totals. *(Added while building, so the Home page never advertises a price the order doesn't charge.)*

**Your Orders:** grouped by day ("Today", "Yesterday", "Tue 6 Oct", formatted with `Intl.DateTimeFormat`). Each order shows the items, the total (tabular), the time and a status pill ("Paid · M-Pesa", which is mocked to give the impression of payment). An "Order again" button sends the same items again. The empty state has a short line plus a CTA to Recommendations.

**States, everywhere:** skeletons shaped like the final layout (no spinners). Errors are inline with a **Try again** button (audit: the old menu error replaced the whole page). Every async message goes in a dedicated `role="status"` line, never in an `aria-live` on a whole panel.

---

## 6. Imagery

- Real, open-licensed photos of the actual dishes, from Wikimedia Commons (32) and Pexels (11), so **every dish has a photo**. They're saved into `frontend/public/images/` and credited in `CREDITS.md`. Google Images was not used: most results there carry no reuse licence.
- Every `<img>` has `width` and `height`, and `loading="lazy"` below the fold. Photos use `alt=""` when the dish name is printed right beside them (so screen readers don't hear it twice), and descriptive alt text otherwise. The hero image gets `fetchpriority="high"`.
- No text or pills overlaid on photos. Captions go below if needed.
- The tinted tile in `DishImage` remains only as a safety net for a future dish added without a photo. No current dish uses it.

---

## 7. Icons and motion

- **Icons:** `@phosphor-icons/react`, regular weight, 20px in UI and 24px in the tab bar. Decorative icons get `aria-hidden`. Icons sit next to text labels, never alone without an `aria-label`. The ★ for ratings is the Phosphor Star icon with `aria-hidden`, and the visible text reads "4.6 rating" for screen readers.
- **Motion** (`motion/react`), only where it says something:
  - Route change: content fades up by 8px over 200ms (state transition).
  - Recommendation results: `layout` animation when the ranking changes (shows the list re-ranked rather than replaced).
  - Order button: `:active` scale 0.98, then a check icon and "Ordered" for 2s (feedback).
  - Old results dim to 60% opacity while new ones load (keeps the original's good idea).
- `prefers-reduced-motion: reduce` turns all of the above into instant changes. Only transform and opacity are animated, and `transition: all` is never used.

---

## 8. Accessibility checklist (from AUDIT.md)

- [ ] Every Order button names its combo or dish (`aria-label="Order Pilau and Chai, KES 200"`).
- [ ] "Skip" chips are `aria-pressed` toggle buttons, and their selected state uses text and an icon, not just colour or opacity.
- [ ] No `opacity` on whole cards for state. Skipped items use `--muted` text plus a strike-through, and the controls keep full contrast.
- [ ] Visible `:focus-visible` ring: 2px `--ink` plus a 2px `--bg` offset, so it works on every accent.
- [ ] Hover, active and disabled each look different. Disabled also gets `cursor: not-allowed` and an explanation where useful ("Ordering…").
- [ ] One `<h1>` per page, with headings in order.
- [ ] `<html lang="en">`, `color-scheme: light dark`, and `<meta name="theme-color">` for both schemes.
- [ ] The budget input has `name="budget"`, `inputMode="numeric"`, `autoComplete="off"`, and its error sits next to the field with `aria-describedby`.
- [ ] `touch-action: manipulation` on controls.
- [ ] Dark mode is designed and checked, and follows the system setting.

---

## 9. Stack

- **Frontend:** React 19 + Vite + Tailwind v4 (`@tailwindcss/vite`), React Router, `motion`, `@phosphor-icons/react`, `@fontsource-variable/bricolage-grotesque`, `@fontsource-variable/manrope`. Tests use Vitest and Testing Library.
- **Backend:** a copy of the original FastAPI + SQLite + NumPy engine. It's extended with `restaurants`, `users` and `orders.user_id / restaurant_id` tables, and the engine is called per restaurant. It has its own `meals.db`, so the original project is never touched.
