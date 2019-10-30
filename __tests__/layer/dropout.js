const { GPU } = require('gpu.js');
const { gpuMock } = require('gpu-mock.js');

const { Dropout, trainingPredict, predict } = require('../../src/layer/dropout');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Dropout Layer', () => {
  beforeEach(() => {
    setup(new GPU({
      mode: 'cpu',
      onIstanbulCoverageVariable: injectIstanbulCoverage
    }));
  });
  afterEach(() => {
    teardown();
  });
  describe('.trainingPredict (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

      const results = gpuMock(trainingPredict, {
        output: [3, 3],
        constants: {
          isTraining: true,
          probability: Dropout.defaults.probability,
        },
      })(inputs);

      let hasZero = false;
      let hasNumber = false;

      for (let y = 0; y < results.length; y++) {
        const row = results[y];
        for (let x = 0; x < row.length; x++) {
          const value = row[x];
          if (value === 0) {
            hasZero = true;
          } else if (!Number.isNaN(value)) {
            hasNumber = true;
          }
        }
      }

      expect(hasZero).toBeTruthy();
      expect(hasNumber).toBeTruthy();
    });
  });
  describe('.training (forward propagation)', () => {
    test('can dropout a simple matrix', () => {
      const inputs = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

      const results = gpuMock(predict, {
        output: [3, 3],
        constants: {
          isTraining: true,
          probability: Dropout.defaults.probability,
        },
      })(inputs);

      expect(results).toEqual([
        new Float32Array([0.5, 1, 1.5]),
        new Float32Array([2, 2.5, 3]),
        new Float32Array([3.5, 4, 4.5])
      ]);
    });
  });
});
