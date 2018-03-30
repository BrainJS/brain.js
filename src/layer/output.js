import { multiply, random, target } from './index';
export default (settings, inputLayer) => {
  const { width, height } = settings;
  const outputGate = random({ width: height, width: height });
  const outputGateConnector = multiply(
    outputGate,
    inputLayer
  );
  return target(settings, outputGateConnector);
}
