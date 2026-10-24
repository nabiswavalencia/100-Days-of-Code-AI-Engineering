import { describe, expect, it } from 'vitest'
import { formatDay, formatKES, joinNames } from './format.js'
import { groupByDay } from '../pages/OrdersPage.jsx'
import { cheapestCombo } from '../pages/RecommendPage.jsx'

describe('formatKES', () => {
  it('adds thousands separators and a non-breaking space', () => {
    expect(formatKES(1400)).toBe('KES 1,400')
    expect(formatKES(30)).toBe('KES 30')
  })
})

describe('formatDay', () => {
  const now = new Date(2026, 9, 7, 12, 0)
  it('says Today and Yesterday', () => {
    expect(formatDay(new Date(2026, 9, 7, 8, 0), now)).toBe('Today')
    expect(formatDay(new Date(2026, 9, 6, 23, 0), now)).toBe('Yesterday')
  })
  it('uses a short date further back', () => {
    expect(formatDay(new Date(2026, 9, 3, 13, 0), now)).toMatch(/3 Oct/)
  })
})

describe('joinNames', () => {
  it('joins item names', () => {
    const items = [{ name: 'Pilau' }, { name: 'Chai' }]
    expect(joinNames(items)).toBe('Pilau + Chai')
    expect(joinNames(items, ' and ')).toBe('Pilau and Chai')
  })
})

describe('groupByDay', () => {
  it('keeps newest-first order and groups orders from the same day', () => {
    const now = new Date(2026, 9, 7, 12, 0)
    const at = (d, h) => ({ id: `${d}-${h}`, created_at: new Date(2026, 9, d, h).toISOString() })
    const groups = groupByDay([at(7, 9), at(6, 19), at(6, 13), at(3, 12)], now)
    expect(groups.map((g) => [g.label, g.orders.length])).toEqual([
      ['Today', 1],
      ['Yesterday', 2],
      [expect.stringMatching(/3 Oct/), 1],
    ])
  })
})

describe('cheapestCombo', () => {
  const menu = {
    main: [{ id: 'a', price: 90 }, { id: 'b', price: 110 }],
    side: [{ id: 's', price: 30 }],
    drink: [{ id: 'd', price: 20 }],
  }
  it('is the cheapest main plus the cheapest side or drink', () => {
    expect(cheapestCombo(menu, [])).toBe(110)
  })
  it('ignores skipped dishes', () => {
    expect(cheapestCombo(menu, ['a', 'd'])).toBe(140)
  })
  it('is null when nothing can be combined', () => {
    expect(cheapestCombo(menu, ['s', 'd'])).toBeNull()
  })
})
