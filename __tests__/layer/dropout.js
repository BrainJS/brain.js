import gpuMock from 'gpu-mock.js'
import Dropout, { trainingPredict, predict } from '../../src/layer/dropout'

describe('Dropout Layer', () => {
  describe('.trainingPredict (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

      const results = gpuMock(trainingPredict, {
        output: [3, 3],
        constants: {
          isTraining: true,
          probability: Dropout.defaults.probability,
        },
      })(inputs)

      let hasZero = false
      let hasNumber = false

      for (let y = 0; y < results.length; y++) {
        const row = results[y]
        for (let x = 0; x < row.length; x++) {
          const value = row[x]
          if (value === 0) {
            hasZero = true
          } else if (!Number.isNaN(value)) {
            hasNumber = true
          }
        }
      }

      expect(hasZero).toBeTruthy()
      expect(hasNumber).toBeTruthy()
    })
  })
  describe('.training (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

      const results = gpuMock(predict, {
        output: [3, 3],
        constants: {
          isTraining: true,
          probability: Dropout.defaults.probability,
        },
      })(inputs)

      expect(results).toEqual([[0.5, 1, 1.5], [2, 2.5, 3], [3.5, 4, 4.5]])
    })
  })
})
