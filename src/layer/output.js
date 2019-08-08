const { add } = require('./add');
const { multiply } = require('./multiply');
const { random } = require('./random');
const { target } = require('./target');
const { zeros } = require('./zeros');

function output(settings, inputLayer) {
  const { height } = settings;
  const outputGate = random({ height, width: inputLayer.height });
  const output = zeros({ height });
  const outputGateConnector = multiply(outputGate, inputLayer);
  return target(settings, add(outputGateConnector, output));
}

module.exports = {
  output
};
