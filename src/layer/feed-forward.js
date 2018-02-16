import {
  add,
  multiply,
  random,
  sigmoid
} from './index';

export default function feedForward(settings, input) {
  const { width } = settings;
  const weights = random({ name: 'weights', height: width, width: input.height });
  const biases = random({ name: 'biases', height: width });

  return sigmoid(
    add(
      multiply(
        weights,
        input
      ),
      biases
    )
  );
}