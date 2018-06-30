import brain from '../src/index'

describe('index', () => {
  test('brain', () => {
    expect(brain).toBeInstanceOf(Object)
  })
})
