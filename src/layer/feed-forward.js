const { random } = require('./random');
const { add } = require('./add');
const { multiply } = require('./multiply');
const { sigmoid } = require('./sigmoid');

function feedForward(settings, input) {
  const { height } = settings;
  const weights = random({ name: 'weights', height, width: input.height });
  const biases = random({ name: 'biases', height });
  return sigmoid(add(multiply(weights, input), biases));
}

module.exports = {
  feedForward
};
