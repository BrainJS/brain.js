import assert from 'assert';
import Target from '../../src/layer/target';

describe('Target Layer', () => {
  it('is fully back propagating values to deltas', () => {
    const input = { width: 1, height: 1, weights: [[1]], deltas: [[0]] };
    const target = new Target({}, input);
    target.validate();
    target.setupKernels();
    target.compare([[0]]);
    assert.deepEqual(target.deltas, [[1]]);
  });
});