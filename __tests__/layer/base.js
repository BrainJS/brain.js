const { Base } = require('../../src/layer/base');
const { release } = require('../../src/utilities/kernel');

jest.mock('../../src/utilities/kernel');
describe('Base Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      test('automatically assigns 1 to width, height, and depth', () => {
        const base = new Base({});

        expect(base.width).toBe(1);
        expect(base.height).toBe(1);
        expect(base.depth).toBe(null);
      });
    });
  });

  describe('.praxisOpts', () => {
    test('are inherited to .praxis() call', () => {
      const praxis = jest.fn();
      const praxisOpts = {
        value: 100,
      };
      const base = new Base({
        praxis,
        praxisOpts,
      });
      expect(praxis).toHaveBeenCalledWith(base, praxisOpts);
    });
  });

  describe('.learn', () => {
    it('releases both this.weights and this.deltas', () => {
      const base = new Base();
      base.praxis = {
        run: () => {},
      };
      const mockWeights = (base.weights = {});
      const mockDeltas = (base.deltas = {});
      base.learn();
      expect(release).toHaveBeenCalledWith(mockWeights);
      expect(release).toHaveBeenCalledWith(mockDeltas);
    });
  });
});
