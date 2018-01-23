import {
  add,
  multiply,
  random,
  sigmoid
} from './index';

export default function feedForward(settings, input) {
  const { width } = settings;
  const weights = random({ height: width, width: input.height });
  const bias = random({
    height: width
  });

  return sigmoid(
    add(
      multiply(
        weights,
        input
      ),
      bias
    )
  );
}