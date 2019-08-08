const { add } = require('./add');
const { negative } = require('./negative');
const { multiply } = require('./multiply');
const { multiplyElement } = require('./multiply-element');
const { ones } = require('./ones');
const { sigmoid } = require('./sigmoid');
const { random } = require('./random');
const { tanh } = require('./tanh');
const { zeros } = require('./zeros');

function gru(settings, recurrentInput, input) {
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
      add(ones(updateGate.rows, updateGate.columns), negative(updateGate)),
      cell
    ),
    multiplyElement(recurrentInput, updateGate)
  );
}

module.exports = {
  gru
};
