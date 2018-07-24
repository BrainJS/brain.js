import assert from 'assert'
import gpuMock from 'gpu-mock.js'
import { predict, compare } from '../../src/layer/relu'

describe('Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]]
      const results = gpuMock(predict, { output: [3, 3] })(inputs)
      assert.deepEqual(results, [[0.1, 0, 0.3], [0, 0.5, 0], [0.7, 0, 0.9]])
    })
  })

  describe('.compare (back propagation)', () => {
    it('can relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]]
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]
      const results = gpuMock(compare, { output: [3, 3] })(inputs, deltas)
      assert.deepEqual(results, [[1, 0, 1], [0, 1, 0], [1, 0, 1]])
    })
  })
})
