import {
  add,
  weigh,
  random,
  sigmoid
} from './';

export default function feedForward(settings, input) {
  const { width } = settings;

  const weights = random({ width, height: input.width + 0 });
  const bias = random({ width });

  return sigmoid(
    add(
      weigh(
        input,
        weights
      ),
      bias
    )
  );
}