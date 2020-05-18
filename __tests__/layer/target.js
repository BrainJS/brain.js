const { GPU } = require('gpu.js');

const { Target } = require('../../src/layer/target');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Target Layer', () => {
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
  test('is fully back propagating values to deltas', () => {
    const input = { width: 1, height: 1, weights: [[1]], deltas: [[0]] };
    const target = new Target({ width: 1, height: 1 }, input);
    target.validate();
    target.setupKernels();
    target.predict();
    target.compare([[0]]);
    expect(target.deltas).toEqual([new Float32Array([1])]);
  });

  test('uses compare1D when width = 1', () => {
    const target = new Target({}, { height: 10, width: 1 });
    target.setupKernels();
    expect(/compare1D/.test(target.compareKernel.source)).toBeTruthy();
    expect(!/compare2D/.test(target.compareKernel.source)).toBeTruthy();
  });

  test('uses compare2D when width > 1', () => {
    const target = new Target({}, { height: 10, width: 10 });
    target.setupKernels();
    expect(!/compare1D/.test(target.compareKernel.source)).toBeTruthy();
    expect(/compare2D/.test(target.compareKernel.source)).toBeTruthy();
  });
});
