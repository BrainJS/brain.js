const { Base } = require('../../src/layer/base');

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

  describe('.praxisOpts', () => {
    test('are inherited to .praxis() call', () => {
      const praxis = jest.fn();
      const praxisOpts = {
        value: 100
      };
      const base = new Base({
        praxis,
        praxisOpts
      });
      expect(praxis).toHaveBeenCalledWith(base, praxisOpts);
    });
  });
});
