const { add } = require('./add');
const { multiply } = require('./multiply');
const { random } = require('./random');
const { target } = require('./target');

function output(settings, inputLayer) {
  const { height } = settings;
  const outputGate = random({
    height,
    width: inputLayer.height,
    name: 'outputGate',
    std: 0.08,
  });
  const output = random({ height, name: 'output', std: 0.08 });
  const outputGateConnector = multiply(outputGate, inputLayer, {
    name: 'outputGateConnected',
  });
  return target(
    { name: 'target', ...settings },
    add(outputGateConnector, output)
  );
}

module.exports = {
  output,
};
