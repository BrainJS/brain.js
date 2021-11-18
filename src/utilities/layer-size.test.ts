import { BaseLayer, ILayer } from '../layer';
import { checkSameSize } from './layer-size';

let layer: ILayer;
let layerToCompare: ILayer;

describe('LayerSize', () => {
  describe('checkSameSize', () => {
    describe('if layer1.width !== layer2.width', () => {
      it('throws', () => {
        layer = new BaseLayer({ width: 10 });
        layerToCompare = new BaseLayer({ width: 10.1 });
        expect(() => {
          checkSameSize(layer, layerToCompare);
        }).toThrow();
      });
    });
    describe('if layer1.width === layer2.width', () => {
      it('throws', () => {
        expect(() => {
          layer = new BaseLayer({ width: 10 });
          layerToCompare = new BaseLayer({ width: 10 });
          checkSameSize(layer, layerToCompare);
        }).not.toThrow();
      });
    });
    describe('if layer1.height !== layer2.height', () => {
      it('throws', () => {
        expect(() => {
          layer = new BaseLayer({ height: 10 });
          layerToCompare = new BaseLayer({ height: 10.1 });
          checkSameSize(layer, layerToCompare);
        }).toThrow();
      });
    });
    describe('if layer1.height === layer2.height', () => {
      it('throws', () => {
        expect(() => {
          layer = new BaseLayer({ height: 10 });
          layerToCompare = new BaseLayer({ height: 10 });
          checkSameSize(layer, layerToCompare);
        }).not.toThrow();
      });
    });
  });
});
