const traverseLayersFrom = require('./traverse-layers-from');

module.exports = function flattenLayers(layers) {
  const result = layers.slice(0);
  for (let i = 0; i < result.length; i++) {
    let offset = 0;
    traverseLayersFrom(result[i], (layer) => {
      if (result.indexOf(layer) === -1) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  }
  return result;
};
