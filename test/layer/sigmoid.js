import assert from 'assert';
import gpuMock from 'gpu-mock.js';
import { predict, compare } from '../../src/layer/sigmoid';

describe('Sigmoid Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can sigmoid a simple matrix', () => {
      const inputs = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
      ];
      const results = gpuMock(predict, { output: [3,3] })(inputs);
      assert.deepEqual(results, [
        [0.52497918747894, 0.549833997312478, 0.574442516811659],
        [0.5986876601124521, 0.6224593312018546, 0.6456563062257954],
        [0.6681877721681662, 0.6899744811276125, 0.7109495026250039]
      ]);
    });
  });

  describe('.compare (back propagation)', () => {
    it('can sigmoid a simple matrix', () => {
      const inputs = [
        [.1, .2, .3],
        [.4, .5, .6],
        [.7, .8, .9]
      ];
      const deltas = [
        [1, 1, 1],
        [1, 1, 1],
        [1, 1, 1]
      ];
      const results = gpuMock(compare, { output: [3,3] })(inputs, deltas);

      assert.deepEqual(results, [
        [ 0.09000000000000001, 0.16000000000000003, 0.21 ],
        [ 0.24, 0.25, 0.24 ],
        [ 0.21000000000000002, 0.15999999999999998, 0.08999999999999998 ]
      ]);
    });
  });
});