import { random, Random } from '../../src/layer/random';
import { randos2D } from '../../src/utilities/randos';

describe('Random Layer', () => {
  describe('constructor', () => {
    describe('width and height only', () => {
      it('is instantiates sizes correctly', () => {
        const settings = { width: 5, height: 7 };
        const layer = new Random(settings);
        expect(layer.width).toBe(settings.width);
        expect(layer.height).toBe(settings.height);
        expect(layer.depth).toBe(null);
        expect((layer.weights as number[][]).length).toBe(7);
        expect((layer.weights as number[][])[0].length).toBe(5);
      });
    });
    describe('layer.weights', () => {
      describe('when given from settings', () => {
        it('uses them', () => {
          const width = 2;
          const height = 3;
          const weights = randos2D(width, height);
          const settings = { weights, width, height };
          const layer = new Random(settings);
          expect(layer.weights).toBe(weights);
        });
      });
    });
    describe('layer.deltas', () => {
      describe('when given from settings', () => {
        it('uses them', () => {
          const width = 2;
          const height = 3;
          const deltas = randos2D(width, height);
          const settings = { deltas, width, height };
          const layer = new Random(settings);
          expect(layer.deltas).toBe(deltas);
        });
      });
    });
  });

  describe('random lambda', () => {
    it('passes settings on to Random constructor, and returns it', () => {
      const settings = { width: 5, height: 7 };
      const layer = random(settings);
      expect(layer.settings.width).toBe(settings.width);
      expect(layer.settings.height).toBe(settings.height);
    });
  });
});
