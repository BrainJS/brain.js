const assert = require('chai').assert;
const Input = require('../../src/layer/input');

describe('Input Layer', () => {
  describe('.predict (forward propagation)', () => {
    it('can handle 1D inputs', () => {
      const input = new Input({ height: 10 });
      assert.equal(input.predict, Input.prototype.predict1D);
    });
    it('can handle 2D inputs', () => {
      const input = new Input({ width: 10, height: 10 });
      assert.equal(input.predict, Input.prototype.predict);
    });
  });
});