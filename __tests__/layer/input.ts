import { GPU } from 'gpu.js';
import { Input } from '../../src/layer/input';
import { setup, teardown } from '../../src/utilities/kernel';

describe('Input Layer', () => {
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
