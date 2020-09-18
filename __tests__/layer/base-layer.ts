import { KernelOutput } from 'gpu.js';
import { BaseLayer } from '../../src/layer/base-layer';
import { release } from '../../src/utilities/kernel';
import { BasePraxis } from '../../src/praxis/base-praxis';

jest.mock('../../src/utilities/kernel');

class MockLayer extends BaseLayer {}

interface IMockPraxisSettings {
  test?: number;
}

class MockPraxis extends BasePraxis<IMockPraxisSettings> {
  constructor(layerTemplate: BaseLayer, settings = {}) {
    super(layerTemplate, settings);
  }

  run(layer: BaseLayer, learningRate: number): KernelOutput {
    return new Float32Array();
  }
}

describe('BaseLayer Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      test('automatically assigns 1 to width, height, and depth', () => {
        const base = new MockLayer({
          initPraxis: (layerTemplate) => new MockPraxis(layerTemplate),
          praxisOpts: {},
        });

        expect(base.width).toBe(1);
        expect(base.height).toBe(1);
        expect(base.depth).toBe(null);
      });
    });
  });

  describe('.praxisOpts', () => {
    test('are inherited to .praxis() call', () => {
      const initPraxis = jest.fn();
      const praxisOpts = {
        value: 100,
      };
      const base = new MockLayer({
        initPraxis,
        praxisOpts,
      });
      expect(initPraxis).toHaveBeenCalledWith(base, praxisOpts);
    });
  });

  describe('.learn', () => {
    it('releases both this.weights and this.deltas', () => {
      const base = new MockLayer({
        praxisOpts: {},
        initPraxis(layerTemplate: BaseLayer, settings?: IMockPraxisSettings) {
          return new MockPraxis(layerTemplate, settings);
        },
      });
      const mockWeights = (base.settings.weights = new Float32Array());
      const mockDeltas = (base.settings.deltas = new Float32Array());
      base.learn(0);
      expect(release).toHaveBeenCalledWith(mockWeights);
      expect(release).toHaveBeenCalledWith(mockDeltas);
    });
  });
});
