import { getHiddenLSTMLayer, getLSTMEquation, ILSTMHiddenLayer } from './lstm';
import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RNNTimeStep } from './rnn-time-step';
import { IRNNHiddenLayer } from './rnn';

export class LSTMTimeStep extends RNNTimeStep {
  getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer {
    return getHiddenLSTMLayer(hiddenSize, prevSize);
  }

  getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: IRNNHiddenLayer
  ): Matrix {
    return getLSTMEquation(
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer as ILSTMHiddenLayer
    );
  }
}
