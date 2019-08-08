const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const predict = require('../../src/layer/add').predict;
const { setup, teardown } = require('../../src/utilities/kernel');

describe('Add Layer', () => {
  beforeEach(() => {
    setup(new GPU({ mode: 'cpu' }));
  });
  afterEach(() => {
    teardown();
  });
  describe('.predict (forward propagation)', () => {
    test('can add a simple matrix', () => {
      const inputs1 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const inputs2 = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
      const results = gpuMock(predict, {
        output: [3, 3],
      })(inputs1, inputs2);

      expect(results).toEqual([
        new Float32Array([2, 4, 6]),
        new Float32Array([8, 10, 12]),
        new Float32Array([14, 16, 18])
      ]);
    });
  });
});
