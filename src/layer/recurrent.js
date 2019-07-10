const { relu, add, multiply, random, zeros } = require('.');

module.exports = (settings, input, recurrentInput) => {
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
};
