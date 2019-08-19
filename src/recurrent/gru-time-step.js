// import Matrix from './matrix'
const GRU = require('./gru');
const RNNTimeStep = require('./rnn-time-step');

class GRUTimeStep extends RNNTimeStep {
  static getModel(hiddenSize, prevSize) {
    return GRU.getModel(hiddenSize, prevSize);
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
    return GRU.getEquation(
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer
    );
  }
}

module.exports = GRUTimeStep;
