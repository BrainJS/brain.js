const layer = require('../layer')

export default function layerFromJSON(jsonLayer) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null
  const Layer = layer[jsonLayer.type]
  const realLayer = Reflect.construct(Layer, arguments)
  for (const p in jsonLayer) {
    if (!jsonLayer.hasOwnProperty(p)) continue
    if (p === 'type') continue
    realLayer[p] = jsonLayer[p]
  }
  return realLayer
}
