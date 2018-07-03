import Base from '../../src/layer/base';
import assert from 'assert';
describe('Base Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      it('automatically assigns 1 to width, height, and depth', () => {
        const base = new Base({ });
        assert.equal(base.width, 1);
        assert.equal(base.height, 1);
        assert.equal(base.depth, 1);
      });
    });
  });
});