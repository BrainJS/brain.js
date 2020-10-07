import { ILayer } from '../layer/base-layer';
const traverseLayersFrom = require('./traverse-layers-from');

module.exports = function flattenLayers(layers: ILayer[]) {
  const result = layers.slice(0);
  for (let i = 0; i < result.length; i++) {
    let offset = 0;
    traverseLayersFrom(result[i], (layer: ILayer) => {
      if (!result.includes(layer)) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  }
  return result;
};
