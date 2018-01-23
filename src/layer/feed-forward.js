import {
  add,
  multiply,
  random,
  sigmoid
} from './index';

export default function feedForward(settings, input) {
  const { width } = settings;

  const weights = random({ width, height: input.width });
  const bias = random({
    width: input.height,
    height: weights.width
  });

  return sigmoid(
    add(
      multiply(
        input,
        weights
      ),
      bias
    )
  );
}