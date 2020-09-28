import { add } from './add';
import { multiply } from './multiply';
import { multiplyElement } from './multiply-element';
import { random } from './random';
import { sigmoid } from './sigmoid';
import { tanh } from './tanh';
import { zeros } from './zeros';
import { ILayer, ILayerSettings } from './base-layer';
import { RecurrentZeros } from './recurrent-zeros';

export function lstmCell(
  settings: ILayerSettings,
  input: ILayer,
  recurrentInput: RecurrentZeros
): ILayer {
  const { height } = settings;

  if (typeof height !== 'number') {
    throw new Error('no settings.height given');
  }
  if (recurrentInput.setDimensions) recurrentInput.setDimensions(1, height);

  const inputGateWeights = random({ height, width: input.height, std: 0.08 });
  const inputGatePeepholes = random({ width: height, height, std: 0.08 });
  const inputGateBias = zeros({ height });
  const inputGate = sigmoid(
    add(
      add(
        multiply(inputGateWeights, input),
        multiply(inputGatePeepholes, recurrentInput)
      ),
      inputGateBias
    )
  );

  const forgetGateWeights = random({ height, width: input.height, std: 0.08 });
  const forgetGatePeepholes = random({ width: height, height, std: 0.08 });
  const forgetGateBias = zeros({ height });
  const forgetGate = sigmoid(
    add(
      add(
        multiply(forgetGateWeights, input),
        multiply(forgetGatePeepholes, recurrentInput)
      ),
      forgetGateBias
    )
  );

  const outputGateWeights = random({ height, width: input.height, std: 0.08 });
  const outputGatePeepholes = random({ width: height, height, std: 0.08 });
  const outputGateBias = zeros({ height });
  const outputGate = sigmoid(
    add(
      add(
        multiply(outputGateWeights, input),
        multiply(outputGatePeepholes, recurrentInput)
      ),
      outputGateBias
    )
  );

  const memoryWeights = random({ height, width: input.height, std: 0.08 });
  const memoryPeepholes = random({ width: height, height, std: 0.08 });
  const memoryBias = zeros({ height });
  const memory = tanh(
    add(
      add(
        multiply(memoryWeights, input),
        multiply(memoryPeepholes, recurrentInput)
      ),
      memoryBias
    )
  );

  // compute new cell activation
  const retainCell = multiplyElement(forgetGate, recurrentInput); // what do we keep from cell
  const writeCell = multiplyElement(inputGate, memory); // what do we write to cell
  const cell = add(retainCell, writeCell); // new cell contents

  // compute hidden state as gated, saturated cell activations
  return multiplyElement(outputGate, tanh(cell));
}
