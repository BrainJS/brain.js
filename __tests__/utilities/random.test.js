import { randomF, randomI, randomN } from '../../src/utilities/random'

describe('random', () => {
  test('randomF', () => {
    const val = randomF(0, 10)

    expect(typeof val).toBe('number')
    expect(val).toBeGreaterThan(0)
    expect(val).toBeLessThan(11)
  })

  test('randomI', () => {
    const val = randomI(0, 10)

    expect(typeof val).toBe('number')
    expect(val).toBeGreaterThanOrEqual(0)
    expect(val).toBeLessThan(11)
  })

  test('randomN', () => {
    const val = randomN(10, 5)

    expect(typeof val).toBe('number')
  })
})
