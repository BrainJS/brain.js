import assert from 'assert'
import gpuMock from 'gpu-mock.js'
import {
  predict,
  compareBiases,
  compareFilterDeltas,
  compareInputDeltas,
} from '../../src/layer/fully-connected-3d'

describe('FullyConnected Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can predict a simple matrix', () => {
      const weights = [
        [
          [1,2],
          [3,4],
        ]
      ]
      const filters = [
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12],
        [13,14,15,16],
      ]
      const biases = [0.2,0.2,0.2,0.2]
      const kernel = gpuMock(predict, {
        output: [4, 1],
        constants: {
          inputDepth: 1,
          inputHeight: 2,
          inputWidth: 2,
        },
      })
      assert.deepEqual(kernel(weights, filters, biases), [[30.2, 70.2, 110.2, 150.2]])
    })
    it('can predict a matrix', () => {
      const results = gpuMock(predict, {
        output: [9, 1],
        constants: {
          inputDepth: 1,
          inputHeight: 1,
          inputWidth: 9,
        },
      })(
        [[[0, 1, 2, 3, 4, 5, 6, 7, 8]]],
        [
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
          [0, 1, 2, 3, 4, 5, 6, 7, 8],
        ],
        [0, 1, 2, 3, 4, 5, 6, 7, 8]
      )
      assert.deepEqual(results, [[204, 205, 206, 207, 208, 209, 210, 211, 212]])
    })
  })

  describe('.compareBiases (back propagation)', () => {
    it('can compare a simple matrix', () => {
      const biases = [[0,0,0,0]]
      const deltas = [[1,2,3,4]]
      const kernel = gpuMock(compareBiases, {
        output: [4],
        constants: {
          connectionCount: 4
        },
      })
      assert.deepEqual(kernel(biases, deltas), [1,2,3,4])
    })
    it('can add a simple matrix', () => {
      const biases = [[1,2,3,4]]
      const deltas = [[1,2,3,4]]
      const kernel = gpuMock(compareBiases, {
        output: [4],
        constants: {
          connectionCount: 4
        },
      })
      assert.deepEqual(kernel(biases, deltas), [2,4,6,8])
    })
  })

  describe('.compareFilterDeltas (back propagation)', () => {
    it('can compare a simplge matrix', () => {
      const inputWeights = [
        [
          [1,2],
          [3,4]
        ]
      ]
      const deltas = [[1,2,3,4]]
      const filterDeltas = [
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
        [0,0,0,0],
      ]
      const kernel = gpuMock(compareFilterDeltas, {
        output: [4,4],
        constants: {
          inputWidth: 2,
          inputHeight: 2
        },
      })
      assert.deepEqual(kernel(filterDeltas, inputWeights, deltas), [
        [1,2,3,4],
        [2,4,6,8],
        [3,6,9,12],
        [4,8,12,16]
      ])
    })
    it('can add a simplge matrix', () => {
      const inputWeights = [
        [
          [1,2],
          [3,4]
        ]
      ]
      const deltas = [[1,2,3,4]]
      const filterDeltas = [
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12],
        [13,14,15,16]
      ]
      const kernel = gpuMock(compareFilterDeltas, {
        output: [4,4],
        constants: {
          inputWidth: 2,
          inputHeight: 2
        },
      })
      assert.deepEqual(kernel(filterDeltas, inputWeights, deltas), [
        [2, 4, 6, 8],
        [7, 10, 13, 16],
        [12, 16, 20, 24],
        [17, 22, 27, 32]
      ])
    })
  })

  describe('.compareInputDeltas (back propagation)', () => {
    it('can compare a simple matrix', () => {
      const inputDeltas = [
        [
          [0,0],
          [0,0]
        ]
      ]
      const deltas = [[1,2,3,4]]
      const filters = [
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12],
        [13,14,15,16]
      ]
      const kernel = gpuMock(compareInputDeltas, {
        output: [2,2,1],
        constants: {
          connectionCount: 4
        },
      })
      assert.deepEqual(kernel(inputDeltas, deltas, filters), [[[90, 100], [110, 120]]])
    })
    it('can add a simple matrix', () => {
      const inputDeltas = [
        [
          [1,2],
          [3,4]
        ]
      ]
      const deltas = [[1,2,3,4]]
      const filters = [
        [1,2,3,4],
        [5,6,7,8],
        [9,10,11,12],
        [13,14,15,16]
      ]
      const kernel = gpuMock(compareInputDeltas, {
        output: [2,2,1],
        constants: {
          connectionCount: 4
        },
      })
      assert.deepEqual(kernel(inputDeltas, deltas, filters), [[[91, 102], [113, 124]]])
    })
  })
})
