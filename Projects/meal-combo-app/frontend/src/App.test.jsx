import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App.jsx'
import { SessionProvider } from './lib/session.jsx'

// ---------- A fake FastAPI server ----------

const achieng = { id: 'achieng', name: 'Achieng Otieno', profile: 'Student at UoN, eats on a tight budget' }
const users = [achieng, { id: 'brian', name: 'Brian Kiprono', profile: 'Software engineer in Westlands' }]
const pilau = { id: 'mw-pilau', name: 'Pilau', price: 150, regular_price: 170, rating: 4.8, purchases: 150, image: null }
const githeri = { id: 'mw-githeri', name: 'Githeri', price: 90, regular_price: 90, rating: 3.9, purchases: 60, image: null }
const kachumbari = { id: 'mw-kachumbari', name: 'Kachumbari', price: 30, regular_price: 30, rating: 4.5, purchases: 110, image: null }
const chai = { id: 'mw-chai', name: 'Chai', price: 30, regular_price: 30, rating: 4.4, purchases: 200, image: null }
const menu = { main: [pilau, githeri], side: [kachumbari], drink: [chai] }
const NAME = 'Mama Wanjiku’s Kibanda'
const restaurant = {
  id: 'mama-wanjiku', name: NAME, kind: 'Local kibanda', area: 'Kenyatta Market, Nairobi',
  tagline: 'Home-style food.', quote: 'Nobody leaves hungry.', quote_by: 'Mama Wanjiku, owner',
  hero_image: 'hero.webp', presets: [150, 200, 300], default_budget: 300,
  specials: [{ note: 'Pilau Friday', special_price: 150, item: { ...pilau, price: 170 } }],
}
const restaurants = [
  { id: 'mama-wanjiku', name: NAME, kind: 'Local kibanda', area: 'Nairobi', hero_image: 'hero.webp', min_price: 30, max_price: 150 },
]
const lastOrder = {
  id: 7, created_at: '2026-10-06T13:15:00+00:00', total: 150, payment: 'M-Pesa', items: [githeri, kachumbari, chai],
}
// What /recent-items returns: everything ordered here in the last 24 hours.
const recent = { hours: 24, item_ids: ['mw-chai', 'mw-githeri', 'mw-kachumbari'] }
const combos = [{ items: [pilau, chai], total: 180, avg_rating: 4.6, score: 1.1 }]

function json(body, status = 200) {
  return Promise.resolve(new Response(JSON.stringify(body), { status }))
}

// Answers like the FastAPI server. Tests can override any route by name.
function mockApi(overrides = {}) {
  const fetchMock = vi.fn((url, options) => {
    const route = (name, fallback) => (overrides[name] ? overrides[name](url, options) : fallback())
    if (url === '/api/users') return route('users', () => json(users))
    if (url === '/api/login') return route('login', () => json(achieng))
    if (url === '/api/restaurants') return route('restaurants', () => json(restaurants))
    if (url.includes('/recommend?')) return route('recommend', () => json(combos))
    if (url.endsWith('/menu')) return route('menu', () => json(menu))
    if (url.includes('/recent-items?')) return route('recent', () => json(recent))
    if (url.startsWith('/api/users/')) return route('orders', () => json([lastOrder]))
    if (url === '/api/orders') return route('placeOrder', () => json({ order_id: 8, total: 180 }, 201))
    if (url === '/api/restaurants/mama-wanjiku') return route('restaurant', () => json(restaurant))
    if (url.startsWith('/api/restaurants/')) return json({ detail: 'No restaurant' }, 404)
    throw new Error(`Unexpected request: ${url}`)
  })
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

const calls = (fetchMock, match) => fetchMock.mock.calls.map(([url]) => url).filter((url) => url.includes(match))

function renderAt(path, { user = achieng } = {}) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <SessionProvider initialUser={user}>
        <App />
      </SessionProvider>
    </MemoryRouter>,
  )
}

const topPick = () => screen.findByRole('heading', { name: 'Pilau + Chai' })
const loginHeading = () => screen.findByRole('heading', { name: /Who.s eating\?/ })

describe('Login and restaurants', () => {
  beforeEach(() => {
    mockApi()
  })

  it('sends signed-out visitors to the login page', async () => {
    renderAt('/r/mama-wanjiku/recommend', { user: null })
    expect(await loginHeading()).toBeInTheDocument()
    expect(await screen.findByText('Brian Kiprono')).toBeInTheDocument()
  })

  it('picking a profile signs in and shows the restaurants', async () => {
    renderAt('/login', { user: null })
    await userEvent.click(await screen.findByRole('button', { name: /Achieng Otieno/ }))
    expect(await screen.findByRole('heading', { name: 'Where are you eating today?' })).toBeInTheDocument()
    expect(screen.getByText('Habari, Achieng.')).toBeInTheDocument()
    expect(await screen.findByRole('link', { name: new RegExp(NAME) })).toHaveAttribute('href', '/r/mama-wanjiku')
  })

  it('logging out returns to the login page', async () => {
    renderAt('/restaurants')
    await userEvent.click(await screen.findByRole('button', { name: /Achieng/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Log Out' }))
    expect(await loginHeading()).toBeInTheDocument()
  })

  it('shows a helpful message when the server is down', async () => {
    mockApi({ users: () => Promise.reject(new TypeError('Failed to fetch')) })
    renderAt('/login', { user: null })
    expect(await screen.findByText(/Is the FastAPI server running/)).toBeInTheDocument()
  })

  it('says so when a restaurant does not exist', async () => {
    renderAt('/r/nowhere')
    expect(await screen.findByRole('heading', { name: /Restaurant Isn.t Here/ })).toBeInTheDocument()
  })
})

describe('Restaurant pages', () => {
  beforeEach(() => {
    mockApi()
  })

  it('home shows specials with the old price and the house quote', async () => {
    renderAt('/r/mama-wanjiku')
    expect(await screen.findByRole('heading', { level: 1, name: NAME })).toBeInTheDocument()
    expect(screen.getByText(/Was/).parentElement).toHaveTextContent(/Was KES\s170/)
    expect(screen.getByText(/Nobody leaves hungry/)).toBeInTheDocument()
  })

  it('menu lists every section and marks specials', async () => {
    renderAt('/r/mama-wanjiku/menu')
    for (const name of ['Mains', 'Sides', 'Drinks']) {
      expect(await screen.findByRole('heading', { name })).toBeInTheDocument()
    }
    expect(screen.getByText(/special/i, { selector: '.badge' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Order Pilau, KES 150' })).toBeInTheDocument()
  })

  it('orders page groups past orders and offers to order again', async () => {
    renderAt('/r/mama-wanjiku/orders')
    expect(await screen.findByText('Githeri + Kachumbari + Chai')).toBeInTheDocument()
    expect(screen.getByText('Paid with M-Pesa')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Order Again Githeri and Kachumbari and Chai' })).toBeInTheDocument()
  })

  it('orders page has an empty state with a next step', async () => {
    mockApi({ orders: () => json([]) })
    renderAt('/r/mama-wanjiku/orders')
    expect(await screen.findByRole('heading', { name: 'No Orders Here Yet' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Get a Recommendation' })).toBeInTheDocument()
  })
})

describe('Recommendations', () => {
  it('loads the top pick for the default budget, skipping what you had in the last 24 hours', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    expect(await topPick()).toBeInTheDocument()
    const url = calls(fetchMock, '/recommend?').at(-1)
    expect(url).toContain('budget=300')
    expect(url).toContain('history=mw-githeri')
    expect(url).toContain('history=mw-chai')
    expect(screen.getByRole('button', { name: 'Skip Chai' })).toHaveAttribute('aria-pressed', 'true')
  })

  it('asks the database what you had recently, and says where the skip list came from', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    expect(calls(fetchMock, '/recent-items?')).toEqual(['/api/users/achieng/recent-items?restaurant=mama-wanjiku'])
    expect(screen.getByText(/Filled in from what you ordered here in the last 24 hours/)).toBeInTheDocument()
  })

  it('skips nothing when you have not ordered here in the last 24 hours', async () => {
    const fetchMock = mockApi({ recent: () => json({ hours: 24, item_ids: [] }) })
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    expect(calls(fetchMock, '/recommend?').at(-1)).not.toContain('history=')
    expect(screen.getByRole('button', { name: 'Skip Chai' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByText(/Filled in from/)).not.toBeInTheDocument()
  })

  it('still shows picks if the recent dishes fail to load', async () => {
    const fetchMock = mockApi({ recent: () => json({ detail: 'boom' }, 500) })
    renderAt('/r/mama-wanjiku/recommend')
    expect(await topPick()).toBeInTheDocument()
    expect(calls(fetchMock, '/recommend?').at(-1)).not.toContain('history=')
  })

  it('a skip list in the URL wins over the recent dishes', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend?skip=mw-pilau')
    await screen.findByRole('button', { name: 'Skip Pilau' })
    await waitFor(() => expect(calls(fetchMock, '/recommend?').length).toBeGreaterThan(0))
    const url = calls(fetchMock, '/recommend?').at(-1)
    expect(url).toContain('history=mw-pilau')
    expect(url).not.toContain('history=mw-chai')
  })

  it('does not crash on a negative budget, and does not ask the API', async () => {
    // Regression test from v1: this used to blank the whole page.
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    const before = calls(fetchMock, '/recommend?').length

    const input = screen.getByLabelText(/Your budget/)
    await userEvent.clear(input)
    await userEvent.type(input, '-5')

    expect(screen.getByText(/whole number of shillings/)).toBeInTheDocument()
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByText('Fix the budget to see your picks.')).toBeInTheDocument()
    await new Promise((resolve) => setTimeout(resolve, 400)) // longer than the debounce
    expect(calls(fetchMock, '/recommend?')).toHaveLength(before)
  })

  it('waits for typing to pause before asking the API', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    const before = calls(fetchMock, '/recommend?').length

    const input = screen.getByLabelText(/Your budget/)
    await userEvent.clear(input)
    await userEvent.type(input, '250')

    await waitFor(() => expect(calls(fetchMock, '/recommend?').at(-1)).toContain('budget=250'))
    expect(calls(fetchMock, '/recommend?').length - before).toBe(1)
  })

  it('quick budget buttons change the budget', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()

    await userEvent.click(screen.getByRole('button', { name: 'KES 150' }))

    expect(screen.getByLabelText(/Your budget/)).toHaveValue('150')
    expect(screen.getByRole('button', { name: 'KES 150' })).toHaveAttribute('aria-pressed', 'true')
    await waitFor(() => expect(calls(fetchMock, '/recommend?').at(-1)).toContain('budget=150'))
  })

  it('skip chips toggle what is sent as history', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()

    await userEvent.click(screen.getByRole('button', { name: 'Skip Chai' }))
    await userEvent.click(screen.getByRole('button', { name: 'Skip Pilau' }))

    await waitFor(() => {
      const url = calls(fetchMock, '/recommend?').at(-1)
      expect(url).toContain('history=mw-pilau')
      expect(url).not.toContain('history=mw-chai')
    })
    expect(screen.getByRole('button', { name: 'Skip Chai' })).toHaveAttribute('aria-pressed', 'false')
  })

  it('suggests the cheapest budget when nothing fits', async () => {
    mockApi({ recommend: () => json([]) })
    renderAt('/r/mama-wanjiku/recommend?budget=20&skip=')
    expect(await screen.findByRole('heading', { name: /Nothing fits KES\s20/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Use KES\s120/ })).toBeInTheDocument()
  })

  it('shows an error with a retry, and keeps the controls usable', async () => {
    let fail = true
    const fetchMock = mockApi({ recommend: () => (fail ? json({ detail: 'boom' }, 500) : json(combos)) })
    renderAt('/r/mama-wanjiku/recommend')
    expect(await screen.findByText(/Recommendations didn't load/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Your budget/)).toBeEnabled()

    fail = false
    await userEvent.click(screen.getByRole('button', { name: 'Try Again' }))
    expect(await topPick()).toBeInTheDocument()
    expect(calls(fetchMock, '/recommend?').length).toBeGreaterThan(1)
  })

  it('places an order with the user, restaurant and item ids', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()

    await userEvent.click(screen.getByRole('button', { name: 'Order This Combo Pilau and Chai, KES 180' }))

    expect(await screen.findByText(/Ordered Pilau \+ Chai for KES\s180/)).toBeInTheDocument()
    const [, options] = fetchMock.mock.calls.find(([url]) => url === '/api/orders')
    expect(options.method).toBe('POST')
    expect(JSON.parse(options.body)).toEqual({
      user_id: 'achieng', restaurant_id: 'mama-wanjiku', item_ids: ['mw-pilau', 'mw-chai'],
    })
  })

  it('only sends one order on a double click', async () => {
    // Regression test from v1: the button used to stay clickable while the order was sending.
    let finishOrder
    const fetchMock = mockApi({ placeOrder: () => new Promise((resolve) => (finishOrder = resolve)) })
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()

    await userEvent.dblClick(screen.getByRole('button', { name: /Order This Combo/ }))

    expect(screen.getByRole('button', { name: /Ordering Pilau and Chai/ })).toBeDisabled()
    expect(screen.getByText('Ordering…')).toBeInTheDocument()
    expect(calls(fetchMock, '/api/orders')).toHaveLength(1)

    finishOrder(new Response(JSON.stringify({ order_id: 8, total: 180 }), { status: 201 }))
    expect(await screen.findByText(/Ordered Pilau \+ Chai/)).toBeInTheDocument()
  })

  it('says what to do if the order fails, and re-enables the button', async () => {
    mockApi({ placeOrder: () => json({ detail: 'nope' }, 400) })
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    await userEvent.click(screen.getByRole('button', { name: /Order This Combo/ }))

    expect(await screen.findByText(/go through. Check your connection and try again/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Order This Combo/ })).toBeEnabled()
  })

  it('refreshes the picks after an order and links to your orders', async () => {
    const fetchMock = mockApi()
    renderAt('/r/mama-wanjiku/recommend')
    await topPick()
    const before = calls(fetchMock, '/recommend?').length

    await userEvent.click(screen.getByRole('button', { name: /Order This Combo/ }))
    const message = await screen.findByText(/Ordered Pilau/)

    await waitFor(() => expect(calls(fetchMock, '/recommend?').length).toBe(before + 1))
    expect(within(message).getByRole('link', { name: 'View Your Orders' })).toHaveAttribute(
      'href', '/r/mama-wanjiku/orders',
    )
  })
})
