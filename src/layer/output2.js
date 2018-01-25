import layer from './index';
const { multiply, output, random } = layer;

export default (inputLayer) => {
  const outputGate = random({ width: inputLayer.height, height: 1 });
  const outputConnector = multiply(
    outputGate,
    inputLayer
  );
  return output(outputConnector);
}