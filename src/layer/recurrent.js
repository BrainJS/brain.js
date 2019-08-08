const { relu } = require('./relu');
const { add } = require('./add');
const { multiply } = require('./multiply');
const { random } = require('./random');
const { zeros } = require('./zeros');

function recurrent(settings, input, recurrentInput) {
  const { height } = settings;

  recurrentInput.setDimensions(1, height);

  // wxh
  const weight = random({ name: 'weight', height, width: input.height });
  // whh
  const transition = random({ name: 'transition', height, width: height });
  // bhh
  const bias = zeros({ name: 'bias', height });

  return relu(
    add(
      add(multiply(weight, input), multiply(transition, recurrentInput)),
      bias
    )
  );
}

module.exports = {
  recurrent
};
