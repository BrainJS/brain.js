import { BaseLayer, ILayer, ILayerSettings } from './base-layer';

export interface IFilterSettings extends ILayerSettings {
  filterCount: number;
  filterWidth: number;
  filterHeight: number;
}

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

  get filterCount(): number {
    return this.settings.filterCount as number;
  }

  get filterWidth(): number {
    return this.settings.filterWidth as number;
  }

  get filterHeight(): number {
    return this.settings.filterHeight as number;
  }

  inputLayer: ILayer;
  settings: Partial<IFilterSettings>;
  constructor(inputLayer: ILayer, settings: Partial<IFilterSettings> = {}) {
    super();
    this.settings = settings;
    this.inputLayer = inputLayer;
  }
}
