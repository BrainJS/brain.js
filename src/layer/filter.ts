import { BaseLayer, ILayer, ILayerSettings } from './base-layer';

export class Filter extends BaseLayer {
  get width(): number {
    return this.inputLayer.width;
  }

  get height(): number {
    return this.inputLayer.height;
  }

  get depth(): number {
    return this.inputLayer.depth;
  }

  inputLayer: ILayer;

  constructor(inputLayer: ILayer, settings?: Partial<ILayerSettings>) {
    super(settings);
    this.inputLayer = inputLayer;
  }
}
