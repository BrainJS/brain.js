import assert from 'assert'
import Target from '../../src/layer/target'
import Input from '../../src/layer/input'

describe('Target Layer', () => {
  it('is fully back propagating values to deltas', () => {
    const input = { width: 1, height: 1, weights: [[1]], deltas: [[0]] }
    const target = new Target({ width: 1, height: 1 }, input)
    target.validate()
    target.setupKernels()
    target.predict()
    target.compare([[0]])
    assert.deepEqual(target.deltas, [[1]])
  })
  it('uses compare1D when width = 1', () => {
    const target = new Target({}, { height: 10, width: 1 })
    target.setupKernels()
    assert(/compare1D/.test(target.compareKernel.fnString))
    assert(!/compare2D/.test(target.compareKernel.fnString))
  })
  it('uses compare2D when width > 1', () => {
    const target = new Target({}, { height: 10, width: 10 })
    target.setupKernels()
    assert(!/compare1D/.test(target.compareKernel.fnString))
    assert(/compare2D/.test(target.compareKernel.fnString))
  })
})
