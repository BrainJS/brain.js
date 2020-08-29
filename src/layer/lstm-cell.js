const { add } = require('./add');
const { multiply } = require('./multiply');
const { multiplyElement } = require('./multiply-element');
const { random } = require('./random');
const { sigmoid } = require('./sigmoid');
const { tanh } = require('./tanh');
const { zeros } = require('./zeros');

function lstmCell(settings, input, recurrentInput) {
  const { height } = settings;

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

module.exports = {
  lstmCell,
};
