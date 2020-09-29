import { IConvolutionSettingsBase } from '../layer/convolution';

export interface IStride {
  strideX: number;
  strideY: number;
}

export function getStride(
  settings: IConvolutionSettingsBase,
  defaults: IConvolutionSettingsBase
): IStride {
  if (typeof settings.stride === 'number') {
    return { strideX: settings.stride, strideY: settings.stride };
  } else {
    let strideX: number = defaults.stride as number;
    let strideY: number = defaults.stride as number;
    if (typeof settings.strideX === 'number') {
      strideX = settings.strideX;
    }
    if (typeof settings.strideY === 'number') {
      strideY = settings.strideY;
    }
    return { strideX, strideY };
  }
}

export interface IPadding {
  paddingX: number;
  paddingY: number;
}

export function getPadding(
  settings: IConvolutionSettingsBase,
  defaults: IConvolutionSettingsBase
): IPadding {
  if (typeof settings.padding === 'number') {
    return { paddingX: settings.padding, paddingY: settings.padding };
  } else {
    let paddingX: number = defaults.padding as number;
    let paddingY: number = defaults.padding as number;
    if (typeof settings.paddingX === 'number') {
      paddingX = settings.paddingX;
    }
    if (typeof settings.paddingY === 'number') {
      paddingY = settings.paddingY;
    }
    return { paddingX, paddingY };
  }
}
