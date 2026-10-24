# Audit of the original meal-combo-app UI

Checked against the Vercel Web Interface Guidelines (web-design-guidelines skill), 2026-10-07.
Paths are relative to the v1 `frontend/` (Git tag `v1`). Each item is something the rebuild must not repeat.

## Accessibility

- [ ] `src/index.css:115` – eaten card uses `opacity: 0.5` on the whole card: meta text drops to 2.2:1, Undo button to 3.2:1, and Undo looks disabled
- [ ] `src/index.css:142` – "Top pick" tag: accent on accent-soft is 4.45:1 at 12px (fails AA 4.5:1)
- [ ] `src/components/RecommendationPanel.jsx:39` – three identical "Order" buttons with no accessible context (which combo?)
- [ ] `src/components/RecommendationPanel.jsx:50` – `aria-live` on the whole panel re-announces every combo on every budget keystroke; scope it to a status line
- [ ] `src/components/MenuItemCard.jsx:10` – `★` and `·` read aloud by screen readers; wrap decorative glyphs in `aria-hidden`
- [ ] `src/App.jsx:126` – no skip link; no landmark navigation (only one `<main>`)
- [ ] `src/index.css:83-96` – buttons and chips ~30px tall; below the 44px touch target on mobile
- [ ] `src/index.css:94` – hover only; no `:active` state; hover fills the button (no contrast step between rest/hover/active)
- [ ] `src/index.css:96` – disabled = `opacity: 0.5` only; no other cue

## Layout

- [ ] `src/index.css:48-52` – single 800px breakpoint; on phones the whole menu sits below the picks panel (~1,000px of scroll before any dish)
- [ ] `src/index.css:51` – sticky sidebar has no max-height; on short laptop screens the lower combos are unreachable while the menu scrolls
- [ ] `src/index.css:56,105,121` – cards inside cards (panel → item-card → border): nested borders everywhere, low hierarchy
- [ ] `src/index.css:1-12` – border vs page background is 1.23:1, so panels barely separate; every surface looks the same
- [ ] `src/App.jsx:110-119` – menu error/loading replaces the entire page with one line of text; no retry action
- [ ] Desktop: large empty area under the sidebar; menu column is a long single list with no grouping or imagery
- [ ] No navigation, no pages; all features on one screen (fine for v1, but the rebuild adds multi-page nav)

## Typography

- [ ] `src/components/RecommendationPanel.jsx:12,39`, `src/App.jsx:116` – `"..."` → `"…"` (Finding the best combos…, Ordering…, Loading menu…)
- [ ] `src/index.css:13` – system-ui only; no display face, no defined type scale (2rem / 1.1rem / 1rem / .875rem / .75rem chosen ad hoc)
- [ ] `src/index.css:62` – section headings (1.1rem) barely larger than body; "Top picks" has the same weight as "Drinks"
- [ ] `src/index.css:118` – prices not `font-variant-numeric: tabular-nums`, so KES columns don't align
- [ ] `src/components/*:KES {…}` – hardcoded `KES 180` formatting; use `Intl.NumberFormat` (and a non-breaking space between KES and the amount)
- [ ] No `text-wrap: balance` on headings; no explicit `line-height`
- [ ] `src/App.jsx:94` – emoji in the success message as the only visual cue

## Performance

- [ ] `src/App.jsx:66-83` – `/api/recommend` fires on every keystroke (typing "300" = 3 requests); debounce input
- [ ] `src/App.jsx:56-63` – full menu refetched after every order just to update purchase counts
- [ ] `src/components/BudgetForm.jsx:13` – input missing `name` and `autocomplete="off"`
- [ ] `index.html` – no `<meta name="theme-color">`; no font preload strategy (needed once a web font is added)
- [ ] `src/index.css:132` – the only transition has no `prefers-reduced-motion` handling (low impact, but new animations must honour it)

---

# Audit of the v2 code (Stage 5)

Same guidelines, run on `frontend/src` (then in `meal-combo-p2`) on 2026-10-07. Every finding below was fixed; tests (36 frontend, 72 backend) and lint pass afterwards.

| Area | Finding | Fix |
|---|---|---|
| Focus | Sticky header, menu jump bar and mobile tab bar could cover a focused element | `scroll-padding-top/bottom` on `html`, larger `scroll-margin-top` on menu sections |
| Accessibility | Budget error appeared but wasn't announced | Persistent `aria-live="polite"` error line |
| Locale | `toFixed(1)` for ratings | `formatRating()` with `Intl.NumberFormat` |
| Copy | Buttons and noun headings not in Title Case | "Order This Combo", "Order Again", "Try Again", "Log Out", "Today's Specials", "Your Orders"… |
| Copy | First person in UI messages ("We couldn't load…", "we'll pick…") | Rewritten in second person / neutral ("The menu didn't load. Check your connection and try again.") |
| i18n | Brand, restaurant and Swahili dish names could be auto-translated | `translate="no"` on them |
| Safe areas | `viewport-fit=cover` without insets on headers and page sides | `env(safe-area-inset-*)` padding |
| Touch | Scrolling controls panel chained scroll to the page | `overscroll-behavior: contain` |
| Images | Restaurant tiles 2-4 below the fold on mobile but loaded eagerly | `loading="lazy"` |
| Performance | Critical fonts not preloaded | Latin subsets self-hosted in `public/fonts`, `<link rel="preload">` in `index.html`, `font-display: swap` |

Deliberately kept: sentence case for question headings ("Where are you eating today?", "Who's eating?") as the app's voice; `outline-none` only on `<main tabIndex=-1>` (a skip-link target, not interactive).

## v1 findings, resolved

Every item in the v1 list above is handled in v2: contrast (no opacity-faded cards; all pairs ≥ 4.5:1), Order buttons named per combo/dish, one `role="status"` line instead of a live panel, decorative glyphs hidden, skip link, 44px targets, hover/active/disabled states, mobile layout (Top pick above the fold, bottom tab bar), bounded sticky panel, no nested cards, inline errors with Try Again, real ellipsis, type scale, tabular `Intl` prices, debounced requests, refetch only what the current page shows, `name`/`autocomplete` on the input, `theme-color`, reduced motion.
