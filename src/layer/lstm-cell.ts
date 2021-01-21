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

  const inputGateWeights = random({
    height,
    width: input.height,
    std: 0.08,
    id: 'inputGateWeights',
  });
  const inputGatePeepholes = random({
    width: height,
    height,
    std: 0.08,
    id: 'inputGatePeepholes',
  });
  const inputGateBias = zeros({ height, id: 'inputGateBias' });
  const inputGate = sigmoid(
    add(
      add(
        multiply(inputGateWeights, input),
        multiply(inputGatePeepholes, recurrentInput)
      ),
      inputGateBias
    ),
    { id: 'inputGate' }
  );

  const forgetGateWeights = random({
    height,
    width: input.height,
    std: 0.08,
    id: 'forgetGateWeights',
  });
  const forgetGatePeepholes = random({
    width: height,
    height,
    std: 0.08,
    id: 'forgetGatePeepholes',
  });
  const forgetGateBias = zeros({ height, id: 'forgetGateBias' });
  const forgetGate = sigmoid(
    add(
      add(
        multiply(forgetGateWeights, input),
        multiply(forgetGatePeepholes, recurrentInput)
      ),
      forgetGateBias
    ),
    { id: 'forgetGate' }
  );

  const outputGateWeights = random({
    height,
    width: input.height,
    std: 0.08,
    id: 'outputGateWeights',
  });
  const outputGatePeepholes = random({
    width: height,
    height,
    std: 0.08,
    id: 'outputGatePeepholes',
  });
  const outputGateBias = zeros({ height });
  const outputGate = sigmoid(
    add(
      add(
        multiply(outputGateWeights, input),
        multiply(outputGatePeepholes, recurrentInput)
      ),
      outputGateBias
    ),
    { id: 'outputGate' }
  );

  const memoryWeights = random({
    height,
    width: input.height,
    std: 0.08,
    id: 'memoryWeights',
  });
  const memoryPeepholes = random({
    width: height,
    height,
    std: 0.08,
    id: 'memoryPeepholes',
  });
  const memoryBias = zeros({ height, id: 'memoryBias' });
  const memory = tanh(
    add(
      add(
        multiply(memoryWeights, input),
        multiply(memoryPeepholes, recurrentInput)
      ),
      memoryBias
    ),
    { id: 'memory' }
  );

  // compute new cell activation
  const retainCell = multiplyElement(forgetGate, recurrentInput, {
    id: 'retainCell',
  }); // what do we keep from cell
  const writeCell = multiplyElement(inputGate, memory, { id: 'writeCell' }); // what do we write to cell
  const cell = add(retainCell, writeCell, { id: 'cell' }); // new cell contents

  // compute hidden state as gated, saturated cell activations
  return multiplyElement(outputGate, tanh(cell), { id: 'activations' });
}
