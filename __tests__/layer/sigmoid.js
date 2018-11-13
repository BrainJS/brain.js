import gpuMock from 'gpu-mock.js';
import { predict, compare } from '../../src/layer/sigmoid';

describe('Sigmoid Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can sigmoid a simple matrix', () => {
      const inputs = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
      const results = gpuMock(predict, { output: [3, 3] })(inputs);

      expect(results).toEqual([
        [0.52497918747894, 0.549833997312478, 0.574442516811659],
        [0.598687660112452, 0.6224593312018546, 0.6456563062257954],
        [0.6681877721681662, 0.6899744811276125, 0.7109495026250039],
      ]);
    });
  });

  describe('.compare (back propagation)', () => {
    test('can sigmoid a simple matrix', () => {
      const inputs = [[0.1, 0.2, 0.3], [0.4, 0.5, 0.6], [0.7, 0.8, 0.9]];
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const results = gpuMock(compare, { output: [3, 3] })(inputs, deltas);

      expect(results).toEqual([
        [0.09000000000000001, 0.16000000000000003, 0.21],
        [0.24, 0.25, 0.24],
        [0.21000000000000002, 0.15999999999999998, 0.08999999999999998],
      ]);
    });
  });
});
