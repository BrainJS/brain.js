import { multiply, random, target } from './index';
export default (settings, inputLayer) => {
  const outputGate = random({ width: inputLayer.height, height: 1 });
  const outputGateConnector = multiply(
    outputGate,
    inputLayer
  );
  return target(settings, outputGateConnector);
}
