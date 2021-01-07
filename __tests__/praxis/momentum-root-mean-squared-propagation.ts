import { GPU } from 'gpu.js';

import { MomentumRootMeanSquaredPropagation } from '../../src/praxis/momentum-root-mean-squared-propagation';
import { setup, teardown } from '../../src/utilities/kernel';
import { injectIstanbulCoverage, mockLayer } from '../test-utils';

describe('MomentumRootMeanSquaredPropagation', () => {
  beforeEach(() => {
    setup(
      new GPU({
        mode: 'cpu',
      })
    );
  });
  afterEach(() => {
    teardown();
  });
  describe('.run()', () => {
    test('correctly runs values', () => {
      const layer = mockLayer({
        weights: [[1]],
        deltas: [[1]],
        width: 1,
        height: 1,
      });
      const praxis = new MomentumRootMeanSquaredPropagation(layer, {
        decayRate: 0.999,
        clipValue: 5,
        learningRate: 0.01,
        regularizationStrength: 0.000001,
        smoothEps: 1e-8,
      });
      praxis.setupKernels();
      const result = praxis.run(layer);
      expect((result as number[][])[0][0].toFixed(5)).toEqual(
        (0.68377).toString()
      );
    });
    test('correctly adjusts decayRate', () => {
      const layer = mockLayer({
        weights: [[1]],
        deltas: [[1]],
        width: 1,
        height: 1,
      });
      const praxis = new MomentumRootMeanSquaredPropagation(layer, {
        decayRate: 0.299,
        clipValue: 5,
        learningRate: 0.01,
        regularizationStrength: 0.000001,
        smoothEps: 1e-8,
      });
      praxis.setupKernels();
      const result = praxis.run(layer);
      expect((result as number[][])[0][0].toFixed(5)).toEqual(
        (0.98806).toString()
      );
    });
  });
});
