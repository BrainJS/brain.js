const layer = require('../layer');

module.exports = function layerFromJSON(jsonLayer) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;
  const Layer = layer[jsonLayer.type];

  // eslint-disable-next-line
  const realLayer = Reflect.construct(Layer, arguments)

  Object.keys(jsonLayer).forEach((p) => {
    if (p !== 'type') {
      realLayer[p] = jsonLayer[p];
    }
  });

  return realLayer;
};
