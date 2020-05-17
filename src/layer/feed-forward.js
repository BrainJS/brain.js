const { random } = require('./random');
const { add } = require('./add');
const { multiply } = require('./multiply');
const { sigmoid } = require('./sigmoid');

function feedForward(settings, input) {
  const { height, praxisOpts } = settings;
  const weights = random({
    name: 'weights',
    height,
    width: input.height,
    praxisOpts,
  });
  const biases = random({ name: 'biases', height, praxisOpts });
  return sigmoid(
    add(multiply(weights, input, { praxisOpts }), biases, { praxisOpts }),
    { praxisOpts }
  );
}

module.exports = {
  feedForward,
};
