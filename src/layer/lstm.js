import Group from './base';
import { sigmoid, add, multiply, multiplyElement, tanh } from './index';

export default class LSTM extends Group {
  constructor(settings) {
    super(settings);

    this.inputGate = new LSTMGate();
    this.forgetGate = new LSTMGate();
    this.outputGate = new LSTMGate();
    this.memory = new LSTMGate();
  }

  static kernel(settings) {
    return (layer, inputLayer, previousOutputs) => {
      const inputGate = sigmoid(
        add(
          add(
            multiply(
              layer.inputGate.inputWeights,
              inputLayer
            ),
            multiply(
              layer.inputGate.peepholeWeights,
              previousOutputs
            )
          ),
          layer.inputGate.bias
        )
      );

      const forgetGate = sigmoid(
        add(
          add(
            multiply(
              layer.forgetGate.inputWeights,
              inputLayer
            ),
            multiply(
              layer.forgetGate.peepholeWeights,
              previousOutputs
            )
          ),
          layer.forgetGate.bias
        )
      );

      // output gate
      const outputGate = sigmoid(
        add(
          add(
            multiply(
              layer.outputGate.inputWeights,
              inputLayer
            ),
            multiply(
              layer.outputGate.peepholeWeights,
              previousOutputs
            )
          ),
          layer.outputGate.bias
        )
      );

      // write operation on cells
      const memory = tanh(
        add(
          add(
            multiply(
              layer.memory.inputWeights,
              inputLayer
            ),
            multiply(
              layer.memory.peepholeWeights,
              previousOutputs
            )
          ),
          layer.memory.bias
        )
      );

      // compute new cell activation
      const retainCell = multiplyElement(forgetGate, inputLayer); // what do we keep from cell
      const writeCell = multiplyElement(inputGate, memory); // what do we write to cell
      const cell = add(retainCell, writeCell); // new cell contents

      // compute hidden state as gated, saturated cell activations
      return multiplyElement(
        outputGate,
        tanh(cell)
      );
    };
  }
}

class LSTMGate {
  inputWeights = {};
  peepholeWeights = {};
  bias = {};
  constructor() {
    //TODO fill in above
  }
}