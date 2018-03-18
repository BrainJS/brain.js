import traverseLayersExcludingFrom from './traverse-layers-excluding-from';

export default function flattenLayersExcluding(layers, inputLayer, recurrentLayer) {
  const result = layers.slice(0);
  for (let i = 0; i < result.length; i++) {
    let offset = 0;
    traverseLayersExcludingFrom(result[i], inputLayer, recurrentLayer, (layer) => {
      if (result.indexOf(layer) === -1) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  }
  return result;
}