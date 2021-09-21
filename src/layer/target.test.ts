import { GPU } from 'gpu.js';

import { compare1D, compare2D, Target } from './target';
import { setup, teardown, makeKernel } from '../utilities/kernel';
import { mockLayer } from '../test-utils';

jest.mock('../utilities/kernel', () => {
  return {
    setup: jest.fn(),
    teardown: jest.fn(),
    makeKernel: jest.fn(() => {
      return [[1]];
    }),
    release: jest.fn(),
    clear: jest.fn(),
    clone: jest.fn(),
  };
});

describe('Target Layer', () => {
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
  test('is fully back propagating values to deltas', () => {
    const input = mockLayer({
      width: 1,
      height: 1,
      weights: [[1]],
      deltas: [[0]],
    });
    const target = new Target({ width: 1, height: 1 }, input);
    target.validate();
    target.setupKernels();
    target.predict();
    (target as any).compareKernel = jest.fn(() => [new Float32Array([1])]);
    target.compare([[0]]);
    expect(target.deltas).toEqual([new Float32Array([1])]);
  });

  test('uses compare1D when width = 1', () => {
    const target = new Target(
      { height: 10, width: 1 },
      mockLayer({ height: 10, width: 1 })
    );
    target.setupKernels();
    expect(makeKernel).toHaveBeenCalledWith(compare1D, {
      output: [1, 10],
      immutable: true,
    });
  });

  test('uses compare2D when width > 1', () => {
    const target = new Target(
      { height: 10, width: 10 },
      mockLayer({ height: 10, width: 10 })
    );
    target.setupKernels();
    expect(makeKernel).toHaveBeenCalledWith(compare2D, {
      output: [10, 10],
      immutable: true,
    });
  });
});
