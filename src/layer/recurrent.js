import { relu, add, multiply, random, zeros } from './';

export default (settings, recurrentInput, input) => {
  const { height } = settings;
  //wxh
  const weight = random({ height, width: input.height });
  //whh
  const transition = random({ width: height, height });
  //bhh
  const bias = zeros({ height });

  return relu(
    add(
      add(
        multiply(
          weight,
          input
        ),
        multiply(
          transition,
          recurrentInput
        )
      ),
      bias
    )
  );
}