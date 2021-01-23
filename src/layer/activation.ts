import { BaseLayer, ILayerSettings, ILayer } from './base-layer';
import { zeros2D } from '../utilities/zeros-2d';
import { zeros3D } from '../utilities/zeros-3d';

export type ActivationType = new (
  inputLayer: ILayer,
  settings: Partial<ILayerSettings>
) => ILayer;

export class Activation extends BaseLayer {
  inputLayer: ILayer;

  get width(): number {
    return this.inputLayer.width;
  }

  get height(): number {
    return this.inputLayer.height;
  }

  get depth(): number {
    return this.inputLayer.depth;
  }

  constructor(inputLayer: ILayer, settings?: Partial<ILayerSettings>) {
    super(settings);
    this.inputLayer = inputLayer;
    const { width, height, depth } = this;
    this.predictKernel = null;
    this.compareKernel = null;
    this.validate();
    if (depth > 0) {
      this.weights = zeros3D(width, height, depth);
      this.deltas = zeros3D(width, height, depth);
    } else if (height > 0) {
      this.weights = zeros2D(width, height);
      this.deltas = zeros2D(width, height);
    }
    this.setupPraxis();
  }
}
