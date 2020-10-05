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
    title: 'outputGate',
    std: 0.08,
  });
  const output = random({ height, title: 'output', std: 0.08 });
  const outputGateConnector = multiply(outputGate, inputLayer, {
    title: 'outputGateConnected',
  });
  return target(
    { title: 'target', ...settings },
    add(outputGateConnector, output)
  );
}
