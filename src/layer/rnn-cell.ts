import { add } from './add';
import { ILayer, ILayerSettings } from './base-layer';
import { multiply } from './multiply';
import { random } from './random';
import { relu } from './relu';
import { zeros } from './zeros';
import { IRecurrentInput } from './recurrent-input';

export function rnnCell(
  settings: ILayerSettings,
  input: ILayer,
  recurrentInput: IRecurrentInput
): ILayer {
  const { height } = settings;

  if (typeof height !== 'number') throw new Error('height not set');
  if (recurrentInput.setDimensions) {
    recurrentInput.setDimensions(1, height);
  }

  // wxh
  const weight = random({
    id: 'weight',
    height,
    width: input.height,
    std: 0.08,
  });
  // whh
  const transition = random({
    id: 'transition',
    height,
    width: height,
    std: 0.08,
  });
  // bhh
  const bias = zeros({ id: 'bias', height });

  return relu(
    add(
      add(multiply(weight, input), multiply(transition, recurrentInput)),
      bias
    )
  );
}
