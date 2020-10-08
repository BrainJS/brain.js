import { LSTM, LSTMModel } from './lstm';
import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import RNNTimeStep from './rnn-time-step';

export class LSTMTimeStep extends RNNTimeStep {
  static getModel(hiddenSize: number, prevSize: number): LSTMModel {
    return LSTM.getModel.call(this, hiddenSize, prevSize);
  }

  static getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: LSTMModel
  ): Matrix {
    return LSTM.getEquation.call(
      this,
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer
    );
  }
}
