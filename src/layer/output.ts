import { add } from './add';
import { multiply } from './multiply';
import { random } from './random';
import { target } from './target';
import { ILayer, ILayerSettings } from './base-layer';

export function output(settings: ILayerSettings, inputLayer: ILayer): ILayer {
  const { height } = settings;
  const outputGate = random({
    height,
    width: inputLayer.height,
    name: 'outputGate',
    std: 0.08,
  });
  const output = random({ height, name: 'output', std: 0.08 });
  const outputGateConnector = multiply(outputGate, inputLayer, {
    name: 'outputGateConnected',
  });
  return target(
    { name: 'target', ...settings },
    add(outputGateConnector, output)
  );
}
