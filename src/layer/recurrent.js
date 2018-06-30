import { relu, add, multiply, random } from './';

export default (settings, input, recurrentInput) => {
  const { height } = settings;

  recurrentInput.setDimensions(1, height);

  //wxh
  const weight = random({ height, width: input.height });
  //whh
  const transition = random({ height, width: height });
  //bhh
  const bias = random({ height });

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