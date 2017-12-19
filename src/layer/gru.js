import {
  add,
  cloneNegative,
  multiply,
  multiplyElement,
  ones,
  sigmoid,
  random,
  tanh
} from './';

export default (settings, input, recurrentInput) => {
  const updateGateWeights = random();
  const updateGatePeepholes = random();
  const updateGateBias = random();
  const updateGate = sigmoid(
    add(
      add(
        multiply(
          updateGateWeights,
          input
        ),
        multiply(
          updateGatePeepholes,
          recurrentInput
        )
      ),
      updateGateBias
    )
  );

  const resetGateWeights = random();
  const resetGatePeepholes = random();
  const resetGateBias = random();
  let resetGate = sigmoid(
    add(
      add(
        multiply(
          resetGateWeights,
          input
        ),
        multiply(
          resetGatePeepholes,
          recurrentInput
        )
      ),
      resetGateBias
    )
  );

  const memoryWeights = random();
  const memoryPeepholes = random();
  const memoryBias = random();
  let cell = tanh(
    add(
      add(
        multiply(
          memoryWeights,
          input
        ),
        multiply(
          memoryPeepholes,
          multiplyElement(
            resetGate,
            recurrentInput
          )
        )
      ),
      memoryBias
    )
  );

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return add(
    multiplyElement(
      add(
        ones(updateGate.rows, updateGate.columns),
        cloneNegative(updateGate)
      ),
      cell
    ),
    multiplyElement(
      recurrentInput,
      updateGate
    )
  );
}