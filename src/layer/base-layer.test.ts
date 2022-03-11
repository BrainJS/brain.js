import { ILayer } from './base-layer';
import { IPraxis, IPraxisSettings } from '../praxis/base-praxis';
import { mockLayer, mockPraxis } from '../test-utils';

jest.mock('../utilities/kernel');

describe('BaseLayer Layer', () => {
  describe('dimensions', () => {
    describe('when given undefined for width, height, and depth', () => {
      test('automatically assigns 1 to width, height, and depth', () => {
        const base = mockLayer({
          initPraxis: (
            layerTemplate: ILayer,
            praxisSettings?: IPraxisSettings
          ): IPraxis => mockPraxis(layerTemplate, praxisSettings),
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
      interface IPraxisExtendedSettings extends IPraxisSettings {
        test: number;
      }
      const praxisOpts: IPraxisExtendedSettings = {
        test: 100,
      };
      const base = mockLayer({
        initPraxis,
        praxisOpts,
      });
      expect(initPraxis).toHaveBeenCalledWith(base, praxisOpts);
    });
  });
});
