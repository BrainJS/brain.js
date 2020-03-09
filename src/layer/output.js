const { add } = require('./add');
const { multiply } = require('./multiply');
const { random } = require('./random');
const { target } = require('./target');

function output(settings, inputLayer) {
  const { height } = settings;
  const outputGate = random({ height, width: inputLayer.height, name: 'outputGate' });
  const output = random({ height, name: 'output' });
  const outputGateConnector = multiply(outputGate, inputLayer, { name: 'outputGateConnected' });
  return target({ name: 'target', ...settings }, add(outputGateConnector, output));
}

module.exports = {
  output
};
