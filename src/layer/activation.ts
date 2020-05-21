import { Base }  from './base';
import zeros2D from '../utilities/zeros-2d';
import zeros3D from '../utilities/zeros-3d';

export class Activation extends Base {
  public inputLayer: any
  constructor(inputLayer: any, settings: any) {
    super();
    this.inputLayer = inputLayer;

    const { width, height, depth } = inputLayer;
    this.predictKernel = null;
    this.compareKernel = null;
    this.width = width;
    this.height = height;
    this.validate();
    if (depth > 0) {
      this.depth = depth;
      this.weights = zeros3D(width, height, depth);
      this.deltas = zeros3D(width, height, depth);
    } else {
      this.weights = zeros2D(width, height);
      this.deltas = zeros2D(width, height);
    }
    this.setupPraxis(settings);
  }
}
