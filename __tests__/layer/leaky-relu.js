const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const { predict, compare } = require('../../src/layer/leaky-relu');
const { setup, teardown } = require('../../src/utilities/kernel');

describe('Leaky Relu Layer', () => {
  beforeEach(() => {
    setup(new GPU({ mode: 'cpu' }));
  });
  afterEach(() => {
    teardown();
  });
  describe('.predict (forward propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const results = gpuMock(predict, {
        output: [3, 3],
      })(inputs);

      expect(results).toEqual([
        new Float32Array([0.1, -0.002, 0.3]),
        new Float32Array([-0.004, 0.5, -0.006]),
        new Float32Array([0.7, -0.008, 0.9]),
      ]);
    });
  });

  describe('.compare (back propagation)', () => {
    test('can leaky relu a simple matrix', () => {
      const inputs = [[0.1, -0.2, 0.3], [-0.4, 0.5, -0.6], [0.7, -0.8, 0.9]];
      const deltas = [[1, 1, 1], [1, 1, 1], [1, 1, 1]];
      const results = gpuMock(compare, {
        output: [3, 3],
      })(inputs, deltas);

      expect(results).toEqual([
        new Float32Array([1, 0.01, 1]),
        new Float32Array([0.01, 1, 0.01]),
        new Float32Array([1, 0.01, 1])
      ]);
    });
  });
});
