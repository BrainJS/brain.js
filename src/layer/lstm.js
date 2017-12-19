import {
  add,
  multiply,
  multiplyElement,
  random,
  sigmoid,
  tanh
} from './index';

export default (settings, input, recurrentInput) => {
  const inputGateWeights = random();
  const inputGatePeepholes = random();
  const inputGateBias = random();
  const inputGate = sigmoid(
    add(
      add(
        multiply(
          inputGateWeights,
          input
        ),
        multiply(
          inputGatePeepholes,
          recurrentInput
        )
      ),
      inputGateBias
    )
  );

  const forgetGateWeights = random();
  const forgetGatePeepholes = random();
  const forgetGateBias = random();
  const forgetGate = sigmoid(
    add(
      add(
        multiply(
          forgetGateWeights,
          input
        ),
        multiply(
          forgetGatePeepholes,
          recurrentInput
        )
      ),
      forgetGateBias
    )
  );

  const outputGateWeights = random();
  const outputGatePeepholes = random();
  const outputGateBias = random();
  const outputGate = sigmoid(
    add(
      add(
        multiply(
          outputGateWeights,
          input
        ),
        multiply(
          outputGatePeepholes,
          recurrentInput
        )
      ),
      outputGateBias
    )
  );

  const memoryWeights = random();
  const memoryPeepholes = random();
  const memoryBias = random();
  const memory = tanh(
    add(
      add(
        multiply(
          memoryWeights,
          input
        ),
        multiply(
          memoryPeepholes,
          recurrentInput
        )
      ),
      memoryBias
    )
  );

  // compute new cell activation
  const retainCell = multiplyElement(forgetGate, input); // what do we keep from cell
  const writeCell = multiplyElement(inputGate, memory); // what do we write to cell
  const cell = add(retainCell, writeCell); // new cell contents

  // compute hidden state as gated, saturated cell activations
  return multiplyElement(
    outputGate,
    tanh(cell)
  );
}