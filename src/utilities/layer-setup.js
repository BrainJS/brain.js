export function setStride(layer, settings) {
  const defaults = layer.constructor.defaults;
  if (settings.hasOwnProperty('stride')) {
    layer.strideX = settings.stride;
    layer.strideY = settings.stride;
  } else {
    if (settings.hasOwnProperty('strideX')) {
      layer.strideX = settings.strideX;
    } else {
      layer.strideX = defaults.stride;
    }

    if (settings.hasOwnProperty('strideY')) {
      layer.strideY = settings.strideY;
    } else {
      layer.strideY = defaults.stride;
    }
  }
}

export function setPadding(layer, settings) {
  const defaults = layer.constructor.defaults;
  if (settings.hasOwnProperty('padding')) {
    layer.paddingX = settings.padding;
    layer.paddingY = settings.padding;
  } else {
    if (settings.hasOwnProperty('paddingX')) {
      layer.paddingX = settings.paddingX;
    } else {
      layer.paddingX = defaults.padding;
    }

    if (settings.hasOwnProperty('paddingY')) {
      layer.paddingY = settings.paddingY;
    } else {
      layer.paddingY = defaults.padding;
    }
  }
}
