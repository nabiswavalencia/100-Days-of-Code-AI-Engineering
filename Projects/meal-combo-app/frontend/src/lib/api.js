// fetch() only rejects on network failure. A 404 or 500 still "succeeds",
// so check response.ok ourselves before trusting the JSON.
export async function getJson(url, options) {
  const response = await fetch(url, options)
  if (!response.ok) throw new Error(`Request failed: ${response.status}`)
  return response.json()
}

function post(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

export const api = {
  users: () => getJson('/api/users'),
  login: (userId) => getJson('/api/login', post({ user_id: userId })),
  restaurants: () => getJson('/api/restaurants'),
  restaurant: (slug) => getJson(`/api/restaurants/${slug}`),
  menu: (slug) => getJson(`/api/restaurants/${slug}/menu`),
  recommend: (slug, budget, skip) => {
    const params = new URLSearchParams({ budget: String(budget) })
    skip.forEach((id) => params.append('history', id))
    return getJson(`/api/restaurants/${slug}/recommend?${params}`)
  },
  orders: (userId, slug) => getJson(`/api/users/${userId}/orders?restaurant=${slug}`),
  // Dishes this user ordered here in the last 24 hours: { hours, item_ids }
  recentItems: (userId, slug) => getJson(`/api/users/${userId}/recent-items?restaurant=${slug}`),
  placeOrder: (userId, slug, itemIds) =>
    getJson('/api/orders', post({ user_id: userId, restaurant_id: slug, item_ids: itemIds })),
}
