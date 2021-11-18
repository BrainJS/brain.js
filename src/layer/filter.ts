import { KernelOutput } from 'gpu.js';
import { BaseLayer, ILayer, ILayerSettings } from './base-layer';

export interface IFilterSettings extends ILayerSettings {
  filterCount: number;
  filterWidth: number;
  filterHeight: number;
  filters?: KernelOutput;
  filterDeltas?: KernelOutput;
}

export type FilterType = new (
  settings: Partial<IFilterSettings>,
  inputLayer: ILayer
) => ILayer;

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

  get filters(): KernelOutput {
    return this.settings.filters;
  }

  set filters(filters: KernelOutput) {
    this.settings.filters = filters;
  }

  get filterDeltas(): KernelOutput {
    return this.settings.filterDeltas;
  }

  set filterDeltas(filterDeltas: KernelOutput) {
    this.settings.filterDeltas = filterDeltas;
  }

  settings: Partial<IFilterSettings>;
  inputLayer: ILayer;
  constructor(settings: Partial<IFilterSettings>, inputLayer: ILayer) {
    super();
    this.settings = settings;
    this.inputLayer = inputLayer;
  }
}
