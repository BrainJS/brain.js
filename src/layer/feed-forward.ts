import { random } from './random';
import { add } from './add';
import { multiply } from './multiply';
import { sigmoid } from './sigmoid';
import { ILayer, ILayerSettings } from './base-layer';

export function feedForward(settings: ILayerSettings, input: ILayer): ILayer {
  const { height, praxisOpts = null } = settings;
  const weights = random({
    id: 'weights',
    height,
    width: input.height,
    praxisOpts,
  });
  const biases = random({ id: 'biases', height, praxisOpts });
  return sigmoid(
    add(multiply(weights, input, { praxisOpts }), biases, { praxisOpts }),
    { praxisOpts }
  );
}
