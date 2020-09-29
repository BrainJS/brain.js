import { KernelOutput } from 'gpu.js';
import { BaseLayer, ILayer, ILayerSettings } from '../../src/layer/base-layer';
import { release } from '../../src/utilities/kernel';
import {
  BasePraxis,
  IPraxis,
  IPraxisSettings,
} from '../../src/praxis/base-praxis';

jest.mock('../../src/utilities/kernel');

class MockLayer extends BaseLayer implements ILayer {
  constructor(settings: ILayerSettings) {
    super(settings);
  }
}

interface IMockPraxisSettings extends IPraxisSettings {
  test?: number;
}

class MockPraxis extends BasePraxis implements IPraxis {
  settings: IPraxisSettings;
  constructor(layerTemplate: ILayer, settings: IPraxisSettings = {}) {
    super(layerTemplate);
    this.settings = settings;
  }

  run(layer: ILayer, learningRate: number): KernelOutput {
    return new Float32Array();
  }
}

describe('BaseLayer Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      test('automatically assigns 1 to width, height, and depth', () => {
        const base = new MockLayer({
          initPraxis: (
            layerTemplate: ILayer,
            praxisSettings?: IPraxisSettings
          ): IPraxis => new MockPraxis(layerTemplate, praxisSettings),
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
      const praxisOpts: IMockPraxisSettings = {
        test: 100,
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
        initPraxis(layerTemplate: ILayer, settings?: IMockPraxisSettings) {
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
