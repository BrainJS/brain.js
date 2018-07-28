import Input from '../../src/layer/input'

describe('Input Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can handle 1D inputs', () => {
      const input = new Input({ height: 10 })

      expect(input.predict).toEqual(Input.prototype.predict1D)
    })

    it('can handle 2D inputs', () => {
      const input = new Input({ width: 10, height: 10 })

      expect(input.predict).toEqual(Input.prototype.predict)
    })
  })
})
