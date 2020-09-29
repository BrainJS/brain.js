import { add } from './add';
import { negative } from './negative';
import { multiply } from './multiply';
import { multiplyElement } from './multiply-element';
import { ones } from './ones';
import { sigmoid } from './sigmoid';
import { random } from './random';
import { tanh } from './tanh';
import { zeros } from './zeros';
import { ILayer, ILayerSettings } from './base-layer';
import { RecurrentInput } from './recurrent-input';

export function gru(
  settings: ILayerSettings,
  recurrentInput: RecurrentInput,
  input: ILayer
): ILayer {
  const { height } = settings;
  const updateGateWeights = random({ height, width: input.height });
  const updateGatePeepholes = random({ width: height, height });
  const updateGateBias = zeros({ height });
  const updateGate = sigmoid(
    add(
      add(
        multiply(updateGateWeights, input),
        multiply(updateGatePeepholes, recurrentInput)
      ),
      updateGateBias
    )
  );

  const resetGateWeights = random({ height, width: input.height });
  const resetGatePeepholes = random({ width: height, height });
  const resetGateBias = zeros({ height });
  const resetGate = sigmoid(
    add(
      add(
        multiply(resetGateWeights, input),
        multiply(resetGatePeepholes, recurrentInput)
      ),
      resetGateBias
    )
  );

  const cellWeights = random({ height, width: input.height });
  const cellPeepholes = random({ width: height, height });
  const cellBias = zeros({ height });
  const cell = tanh(
    add(
      add(
        multiply(cellWeights, input),
        multiply(cellPeepholes, multiplyElement(resetGate, recurrentInput))
      ),
      cellBias
    )
  );

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return add(
    multiplyElement(
      add(
        ones({ width: updateGate.width, height: updateGate.height }),
        negative(updateGate)
      ),
      cell
    ),
    multiplyElement(recurrentInput, updateGate)
  );
}
