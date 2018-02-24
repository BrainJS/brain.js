import traverseLayersFrom from './traverse-layers-from';

export default function flattenLayers(layers) {
  for (let i = 0; i < layers.length; i++) {
    let offset = 0;
    traverseLayersFrom(layers[i], (layer) => {
      if (layers.indexOf(layer) === -1) {
        layers.splice(i + offset, 0, layer);
        offset++;
      }
    });
  }
  return layers;
}