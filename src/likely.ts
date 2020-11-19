import { NeuralNetwork } from './neural-network';

/**
 *
 * @param {*} input
 * @param {brain.NeuralNetwork} net
 * @returns {*}
 */
export function likely<T>(input: number[], net: NeuralNetwork): T | null {
  if (!net) {
    throw new TypeError(
      `Required parameter 'net' is of type ${typeof net}. Must be of type 'brain.NeuralNetwork'`
    );
  }

  const output = net.run(input);
  let maxProp = null;
  let maxValue = -1;

  Object.keys(output).forEach((key) => {
    const value = output[key];
    if (value > maxValue) {
      maxProp = key;
      maxValue = value;
    }
  });

  return maxProp;
}
