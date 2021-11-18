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
    id: 'outputGate',
    std: 0.08,
  });
  const output = random({ height, id: 'output', std: 0.08 });
  const outputGateConnector = multiply(outputGate, inputLayer, {
    id: 'outputGateConnected',
  });
  return target(
    { id: 'target', ...settings },
    add(outputGateConnector, output)
  );
}
