export interface ILikelyNet<InputType, OutputType> {
  run: (input: InputType) => OutputType;
}

export function likely<
  NetworkType extends ILikelyNet<
    Parameters<NetworkType['run']>[0],
    ReturnType<NetworkType['run']>
  >
>(
  input: Parameters<NetworkType['run']>[0],
  net: NetworkType
): ReturnType<NetworkType['run']> | null {
  if (!net) {
    throw new TypeError(
      `Required parameter 'net' is of type ${typeof net}. Must be of type 'brain.NeuralNetwork'`
    );
  }

  const output = net.run(input);
  let maxProp = null;
  let maxValue = -1;

  Object.entries(output as number[]).forEach(([key, value]) => {
    if (
      typeof value !== 'undefined' &&
      typeof value === 'number' &&
      value > maxValue
    ) {
      maxProp = key;
      maxValue = value;
    }
  });

  return maxProp;
}
