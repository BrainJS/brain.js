const { add, multiply, random, sigmoid } = require('./index');

module.exports = function feedForward(settings, input) {
  const { height } = settings;
  const weights = random({ name: 'weights', height, width: input.height });
  const biases = random({ name: 'biases', height });

  return sigmoid(add(multiply(weights, input), biases));
}
