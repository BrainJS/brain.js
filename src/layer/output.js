import { add, multiply, random, target, zeros } from './index';
export default (settings, inputLayer) => {
  const { height } = settings;
  const outputGate = random({ height, width: inputLayer.height });
  const output = zeros({ height });
  const outputGateConnector = multiply(
    outputGate,
    inputLayer
  );
  return target(settings, add(outputGateConnector, output));
}
