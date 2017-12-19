import { relu, add, multiply } from './';

export default (settings, recurrentInput, input) => {
  //wxh
  const weight = new Random(hiddenSize, prevSize, 0.08);
  //whh
  const transition = new Random(hiddenSize, hiddenSize, 0.08);
  //bhh
  const bias = new Zeros(hiddenSize, 1);

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