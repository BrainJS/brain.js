import { INumberHash } from './lookup';
import { NeuralNetwork } from './neural-network';

/**
 *
 * @param {*} input
 * @param {brain.NeuralNetwork} net
 * @returns {*}
 */
export function likely<T extends number[] | Float32Array | INumberHash>(
  input: T,
  net: NeuralNetwork
): T | null {
  if (!net) {
    throw new TypeError(
      `Required parameter 'net' is of type ${typeof net}. Must be of type 'brain.NeuralNetwork'`
    );
  }

  const output = net.run<T>(input);
  let maxProp = null;
  let maxValue = -1;

  Object.entries(output).forEach(([key, value]) => {
    if (value > maxValue) {
      maxProp = key;
      maxValue = value;
    }
  });

  return maxProp;
}
