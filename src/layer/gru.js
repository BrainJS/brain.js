import {
  add,
  negative,
  multiply,
  multiplyElement,
  ones,
  sigmoid,
  random,
  tanh,
  zeros,
} from '.'

export default (settings, recurrentInput, input) => {
  const { height } = settings
  const updateGateWeights = random({ height, width: input.height })
  const updateGatePeepholes = random({ width: height, height })
  const updateGateBias = zeros({ height })
  const updateGate = sigmoid(
    add(
      add(
        multiply(updateGateWeights, input),
        multiply(updateGatePeepholes, recurrentInput)
      ),
      updateGateBias
    )
  )

  const resetGateWeights = random({ height, width: input.height })
  const resetGatePeepholes = random({ width: height, height })
  const resetGateBias = zeros({ height })
  const resetGate = sigmoid(
    add(
      add(
        multiply(resetGateWeights, input),
        multiply(resetGatePeepholes, recurrentInput)
      ),
      resetGateBias
    )
  )

  const cellWeights = random({ height, width: input.height })
  const cellPeepholes = random({ width: height, height })
  const cellBias = zeros({ height })
  const cell = tanh(
    add(
      add(
        multiply(cellWeights, input),
        multiply(cellPeepholes, multiplyElement(resetGate, recurrentInput))
      ),
      cellBias
    )
  )

  // compute hidden state as gated, saturated cell activations
  // negate updateGate
  return add(
    multiplyElement(
      add(ones(updateGate.rows, updateGate.columns), negative(updateGate)),
      cell
    ),
    multiplyElement(recurrentInput, updateGate)
  )
}
