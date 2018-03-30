import { relu, add, multiply, random } from './';

export default (settings, input, recurrentInput) => {
  const { width, height } = settings;

  recurrentInput.setDimensions(height, width);

  //wxh
  const weight = random({ width: height, height: width });
  //whh
  const transition = random({ width, height: width });
  //bhh
  const bias = random({ height: width });

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