'use strict';

export function setStride(layer, settings) {
  const defaults = layer.constructor.defaults;
  if (settings.hasOwnProperty('stride')) {
    this.strideX = settings.stride;
    this.strideY = settings.stride;
  } else {
    if (settings.hasOwnProperty('strideX')) {
      this.strideX = settings.strideX;
    } else {
      this.strideX = defaults.stride;
    }

    if (settings.hasOwnProperty('strideY')) {
      this.strideY = settings.strideY;
    } else {
      this.strideY = defaults.stride;
    }
  }
}

export function setPadding(layer, settings) {
  const defaults = layer.constructor.defaults;
  if (settings.hasOwnProperty('padding')) {
    this.paddingX = settings.padding;
    this.paddingY = settings.padding;
  } else {
    if (settings.hasOwnProperty('paddingX')) {
      this.paddingX = settings.paddingX;
    } else {
      this.paddingX = defaults.padding;
    }

    if (settings.hasOwnProperty('paddingY')) {
      this.paddingY = settings.paddingY;
    } else {
      this.paddingY = defaults.padding;
    }
  }
}
