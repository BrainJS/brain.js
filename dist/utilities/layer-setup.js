'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setStride = setStride;
exports.setPadding = setPadding;
function setStride(layer, settings) {
  var defaults = layer.constructor.defaults;
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

function setPadding(layer, settings) {
  var defaults = layer.constructor.defaults;
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
//# sourceMappingURL=layer-setup.js.map