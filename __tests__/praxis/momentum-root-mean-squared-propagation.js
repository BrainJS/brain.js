const { GPU } = require('gpu.js');

const {
  MomentumRootMeanSquaredPropagation,
} = require('../../src/praxis/momentum-root-mean-squared-propagation');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('MomentumRootMeanSquaredPropagation', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
        onIstanbulCoverageVariable: injectIstanbulCoverage,
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.run()', () => {
    test('correctly runs values', () => {
      const layer = { weights: [[1]], deltas: [[1]], width: 1, height: 1 };
      const praxis = new MomentumRootMeanSquaredPropagation(layer, {
        decayRate: 0.999,
        clipValue: 5,
        learningRate: 0.01,
        regularizationStrength: 0.000001,
        smoothEps: 1e-8,
      });
      const result = praxis.run(layer);
      expect(result[0][0].toFixed(5)).toEqual((0.68377).toString());
    });
    test('correctly adjusts decayRate', () => {
      const layer = { weights: [[1]], deltas: [[1]], width: 1, height: 1 };
      const praxis = new MomentumRootMeanSquaredPropagation(layer, {
        decayRate: 0.299,
        clipValue: 5,
        learningRate: 0.01,
        regularizationStrength: 0.000001,
        smoothEps: 1e-8,
      });
      const result = praxis.run(layer);
      expect(result[0][0].toFixed(5)).toEqual((0.98806).toString());
    });
  });
});
