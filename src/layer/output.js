const layer = require('.');
const { add, multiply, random, target, zeros } = layer;

module.exports = (settings, inputLayer) => {
  const { height } = settings;
  const outputGate = random({ height, width: inputLayer.height });
  const output = zeros({ height });
  const outputGateConnector = multiply(outputGate, inputLayer);
  return target(settings, add(outputGateConnector, output));
};
