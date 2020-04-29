const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');
const { Input } = require('../../src/layer/input');
const { MultiplyElement, predict } = require('../../src/layer/multiply-element');
const { Random } = require('../../src/layer/random');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('MultiplyElement Layer', () => {
  beforeEach(() => {
    setup(new GPU({
      mode: 'cpu',
      onIstanbulCoverageVariable: injectIstanbulCoverage
    }));
  });
  afterEach(() => {
    teardown();
  });
  describe('.predict (forward propagation)', () => {
    test('can multiply a simple matrix', () => {
      const inputs1 = [[1, 2, 3], [4, 5, 6]];
      const inputs2 = [[7, 8, 9], [10, 11, 12]];
      const results = gpuMock(predict, {
        output: [3, 2]
      })(inputs1, inputs2);

      expect(results).toEqual([
        new Float32Array([7, 16, 27]),
        new Float32Array([40, 55, 72])
      ]);
    });
  });
});
