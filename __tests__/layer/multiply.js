import assert from 'assert'
import gpuMock from 'gpu-mock.js'
import Input from '../../src/layer/input'
import Multiply, {
  predict,
  compareFromX,
  compareFromY,
} from '../../src/layer/multiply'
import Random from '../../src/layer/random'

describe('Multiply Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can multiply a simple matrix', () => {
      const inputs1 = [[1, 2, 3], [4, 5, 6]]
      const inputs2 = [[7, 8], [9, 10], [11, 12]]
      const results = gpuMock(predict, {
        output: [2, 2],
        constants: {
          size: inputs2.length,
        },
      })(inputs1, inputs2)

      assert.deepEqual(results, [[58, 64], [139, 154]])
    })
  })
  describe('.compareFromX (back propagation)', () => {
    it('can multiply a simple matrix', () => {
      const m1 = [[3, 3], [3, 3]]
      const m2 = [[3, 3], [3, 3]]
      const deltas = [[3, 3], [3, 3]]
      const result = gpuMock(compareFromX, {
        output: [2, 2],
        constants: {
          size: 2,
        },
      })(deltas, m1, m2)
      assert.deepEqual(result, [[21, 21], [21, 21]])
    })
    it('can compare a simple matrix', () => {
      const deltas = [[1], [2], [3]]
      const inputDeltas = [[1, 2], [3, 4], [5, 6]]
      const inputWeights = [[1], [2]]
      const result = gpuMock(compareFromX, {
        output: [2, 3],
        constants: {
          size: 1,
        },
      })(deltas, inputDeltas, inputWeights)
      assert.deepEqual(result, [[2, 4], [5, 8], [8, 12]])
    })
  })
  describe('.compareFromY (back propagation)', () => {
    it('can multiply a simple matrix 2x2 * 2x2 = 2x2', () => {
      const m1 = [[3, 3], [3, 3]]
      const m2 = [[3, 3], [3, 3]]
      const deltas = [[3, 3], [3, 3]]
      const result = gpuMock(compareFromY, {
        output: [2, 2],
        constants: {
          size: 2,
        },
      })(deltas, m1, m2)
      assert.deepEqual(result, [[21, 21], [21, 21]])
    })
    it('can compare a simple matrix 3x1 * 2x1 = 3x2', () => {
      const deltas = [[1], [2], [3]]
      const inputDeltas = [[1], [2]]
      const inputWeights = [[1, 2], [3, 4], [5, 6]]
      const result = gpuMock(compareFromY, {
        output: [1, 2],
        constants: {
          size: 3,
        },
      })(deltas, inputDeltas, inputWeights)
      assert.deepEqual(result, [[23], [30]])
    })
    it('can compare a simple matrix 3x1 * 1x3 = 3x1', () => {
      const deltas = [[1, 2, 3]]
      const inputDeltas = [[1], [2], [3]]
      const inputWeights = [[1, 2, 3]]
      const result = gpuMock(compareFromY, {
        output: [1, 3],
        constants: {
          size: 1,
        },
      })(deltas, inputDeltas, inputWeights)
      assert.deepEqual(result, [[2], [4], [6]])
    })
  })
  describe('.validate', () => {
    context('when dimension are incompatible', () => {
      it('throws error', () => {
        assert.throws(() => {
          Multiply.prototype.validate.call({
            inputLayer1: { width: 1, height: 1 },
            inputLayer2: { width: 1, height: 2 },
            height: 1,
            width: 1,
          })
        }, Error)
      })
    })
    context('when dimension are compatible', () => {
      it('validates', () => {
        Multiply.prototype.validate.call({
          inputLayer1: { width: 1, height: 1 },
          inputLayer2: { width: 1, height: 1 },
          height: 1,
          width: 1,
        })
      })
    })
  })
  describe('instance', () => {
    describe('.predict method', () => {
      it('validates, multiplies, and sets .weights', () => {
        const inputLayer1 = {
          width: 3,
          height: 2,
          weights: [[1, 2, 3], [4, 5, 6]],
        }
        const inputLayer2 = {
          width: 2,
          height: 3,
          weights: [[7, 8], [9, 10], [11, 12]],
        }
        const multiplyLayer = new Multiply(inputLayer1, inputLayer2)
        multiplyLayer.validate()
        multiplyLayer.setupKernels()
        multiplyLayer.predict()

        assert.deepEqual(multiplyLayer.weights, [[58, 64], [139, 154]])
      })
    })
    context('when used with Input layer', () => {
      it('is compatible', () => {
        const random = new Random({ height: 3, width: 2 })
        const input = new Input({ height: 2 })
        const multiply = new Multiply(random, input)

        random.validate()
        random.setupKernels()

        input.validate()
        input.setupKernels()

        multiply.validate()
        multiply.setupKernels()

        input.predict([0, 1])
        random.predict()
        multiply.predict()
        assert.equal(multiply.width, 1)
        assert.equal(multiply.height, 3)
      })
    })
  })
})
