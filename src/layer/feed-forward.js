import {
  add,
  multiply,
  random,
  sigmoid
} from './index';

export default function feedForward(settings, input) {
  const { width, height } = settings;

  const weights = random({ width, height });
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