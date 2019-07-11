const gpuMock = require('gpu-mock.js');
const { predict, compare } = require('../../src/layer/relu');

describe('Relu Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const results = gpuMock(predict, { output: [3, 3] })(inputs);
      expect(results).toEqual([[0.1, 0, 0.3], [0, 0.5, 0], [0.7, 0, 0.9]]);
    });
  });

  describe('.compare (back propagation)', () => {
    test('can relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const results = gpuMock(compare, { output: [3, 3] })(inputs, deltas);
      expect(results).toEqual([[1, 0, 1], [0, 1, 0], [1, 0, 1]]);
    });
  });
});
