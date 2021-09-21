import { INeuralNetworkData, NeuralNetwork } from './neural-network';

export function likely<
  InputType extends INeuralNetworkData,
  OutputType extends INeuralNetworkData
>(
  input: InputType,
  net: NeuralNetwork<InputType, OutputType>
): OutputType | null {
  if (!net) {
    throw new TypeError(
      `Required parameter 'net' is of type ${typeof net}. Must be of type 'brain.NeuralNetwork'`
    );
  }

  const output = net.run(input);
  let maxProp = null;
  let maxValue = -1;

  Object.entries(output).forEach(([key, value]) => {
    if (typeof value !== 'undefined' && value > maxValue) {
      maxProp = key;
      maxValue = value;
    }
  });

  return maxProp;
}
