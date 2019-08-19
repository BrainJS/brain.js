const Matrix = require('./matrix');
const LSTM = require('./lstm');
const RNNTimeStep = require('./rnn-time-step');

class LSTMTimeStep extends RNNTimeStep {
  static getModel(hiddenSize, prevSize) {
    return LSTM.getModel.call(this, hiddenSize, prevSize);
  }

  /**
   *
   * @param {Equation} equation
   * @param {Matrix} inputMatrix
   * @param {Matrix} previousResult
   * @param {Object} hiddenLayer
   * @returns {Matrix}
   */
  static getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
    return LSTM.getEquation.call(
      this,
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer
    );
  }
}

module.exports = LSTMTimeStep;
