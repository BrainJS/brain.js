const { GPU } = require('gpu.js');
const { Input } = require('../../src/layer/input');
const { setup, teardown } = require('../../src/utilities/kernel');
const { injectIstanbulCoverage } = require('../test-utils');

describe('Input Layer', () => {
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
  describe('.predict (forward propagation)', () => {
    test('can handle 1D inputs', () => {
      const input = new Input({ height: 10 });
      input.setupKernels();

      expect(input.predict).toEqual(Input.prototype.predict1D);
    });

    test('can handle 2D inputs', () => {
      const input = new Input({ width: 10, height: 10 });
      input.setupKernels();

      expect(input.predict).toEqual(Input.prototype.predict);
    });
  });
});
