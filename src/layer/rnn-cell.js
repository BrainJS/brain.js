const { relu } = require('./relu');
const { add } = require('./add');
const { multiply } = require('./multiply');
const { random } = require('./random');
const { zeros } = require('./zeros');

function rnnCell(settings, input, recurrentInput) {
  const { height } = settings;

  if (recurrentInput.setDimensions) recurrentInput.setDimensions(1, height);

  // wxh
  const weight = random({
    name: 'weight',
    height,
    width: input.height,
    std: 0.08,
  });
  // whh
  const transition = random({
    name: 'transition',
    height,
    width: height,
    std: 0.08,
  });
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
  rnnCell,
};
