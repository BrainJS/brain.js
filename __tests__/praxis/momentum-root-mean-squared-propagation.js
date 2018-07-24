import assert from 'assert'
import MomentumRootMeanSquaredPropagation from '../../src/praxis/momentum-root-mean-squared-propagation'

describe('MomentumRootMeanSquaredPropagation', () => {
  describe('.run()', () => {
    it('correctly runs values', () => {
      const layer = { weights: [[1]], deltas: [[1]], width: 1, height: 1 }
      const praxis = new MomentumRootMeanSquaredPropagation(layer, {
        decayRate: 0.999,
        clipValue: 5,
        learningRate: 0.01,
        regularizationStrength: 0.000001,
        smoothEps: 1e-8,
      })
      const result = praxis.run()
      assert.equal(result[0][0], 0.6837728151101338)
    })
  })
})
