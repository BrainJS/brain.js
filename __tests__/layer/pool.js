import gpuMock from 'gpu-mock.js'
import Pool, { predict, compare } from '../../src/layer/pool'

describe('Pool Layer', () => {
  describe('constructor', () => {
    test('correctly sets dimensions', () => {
      const layer = new Pool(
        {
          filterWidth: 2,
          filterHeight: 2,
          filterCount: 8,
          stride: 2,
        },
        {
          width: 24,
          height: 24,
        }
      )
      expect(layer.width).toEqual(12)
      expect(layer.height).toEqual(12)
      expect(layer.depth).toEqual(8)
    })
  })
  describe('.predict (forward propagation)', () => {
    test('can pool a simple matrix', () => {
      const inputs = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const results = gpuMock(predict, {
        output: [1, 1, 0],
        constants: {
          strideX: 1,
          strideY: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
          paddingX: 0,
          paddingY: 0,
          filterWidth: 3,
          filterHeight: 3,
          filterCount: 1,
        },
      })(inputs)

      expect(results).toEqual([[9]])
    })
  })

  describe('.compare (back propagation)', () => {
    test('can pool a simple matrix', () => {
      const deltas = [[9]]
      const switchX = [[0]]
      const switchY = [[0]]
      const results = gpuMock(compare, {
        output: [3, 3, 0],
        constants: {
          strideX: 1,
          strideY: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
          outputWidth: 1,
          outputHeight: 1,
          paddingX: 0,
          paddingY: 0,
          filterWidth: 3,
          filterHeight: 3,
          filterCount: 1,
        },
      })(deltas, switchX, switchY)

      expect(results).toEqual([[9, 0, 0], [0, 0, 0], [0, 0, 0]])
    })
  })
})
