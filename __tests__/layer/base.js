const Base = require('../../src/layer/base');

describe('Base Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      test('automatically assigns 1 to width, height, and depth', () => {
        const base = new Base({});

        expect(base.width).toBe(1);
        expect(base.height).toBe(1);
        expect(base.depth).toBe(1);
      });
    });
  });
});
