import { multiply, random, target } from './index';
export default (settings, inputLayer) => {
  const { height } = settings;
  const outputGate = random({ height, width: inputLayer.height });
  const outputGateConnector = multiply(
    outputGate,
    inputLayer
  );
  return target(settings, outputGateConnector);
}
