var Matrix = require('./matrix');
var RNN = require('./rnn');
var RandomMatrix = require('./matrix/random');

function GRU(options) {
  //call super
  RNN.call(this, options);
}

GRU.prototype = Object.assign({}, RNN.prototype, {
  getModel: function(hiddenSize, prevSize) {
    return {
      // reset Gate
      wrxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wrhh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      br: new Matrix(hiddenSize, 1),

      // update Gate
      wzxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wzhh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      bz: new Matrix(hiddenSize, 1),

      // cell write parameters
      wcxh: new RandomMatrix(hiddenSize, prevSize, 0.08),
      wchh: new RandomMatrix(hiddenSize, hiddenSize, 0.08),
      bc: new Matrix(hiddenSize, 1)
    };
  },

  /**
   * @param {Matrix|EquationState} input
   * @param {Object} modelHiddenLayer
   * @param {Number} size
   * @returns {EquationState}
   */
  getEquation: function(input, modelHiddenLayer, size) {
    // reset gate
    var resetGate = sigmoid(
      add(
        add(
          multiply(
            modelHiddenLayer.wrxh,
            input
          ),
          multiply(
            modelHiddenLayer.wrhh,
            previousHiddenNode
          )
        ),
        model[depth].br
      )
    );

    // update gate
    var updateGate = sigmoid(
      add(
        add(
          multiply(
            modelHiddenLayer.wzxh,
            input
          ),
          multiply(
            modelHiddenLayer.wzhh,
            previousHiddenNode
          )
        ), modelHiddenLayer.bz));

    // cell
    var cell = tanh(
      add(
        add(
          multiply(
            modelHiddenLayer.wcxh,
            inputVector
          ),
          multiply(
            modelHiddenLayer.wchh,
            multiplyElement(
              resetGate,
              previousHiddenNode
            )
          )
        ),
        modelHiddenLayer.bc
      )
    );

    // compute hidden state as gated, saturated cell activations
    allOnes = createMatrixFilledWithOnes(updateGate.rows, updateGate.columns);
    // negate updateGate
    negUpdateGate = createNegatedCloneMatrix(updateGate);
    return add(
      multiplyElement(
        add(
          allOnes,
          negUpdateGate
        ),
        cell
      ),
      multiplyElement(
        previousHiddenNode,
        updateGate
      )
    );
  }
});

module.exports = GRU;