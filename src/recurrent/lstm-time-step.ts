import { getHiddenLSTMLayer, getLSTMEquation, ILSTMHiddenLayer } from './lstm';
import { Matrix } from './matrix';
import { Equation } from './matrix/equation';
import { RNNTimeStep } from './rnn-time-step';
import { IRNNHiddenLayer } from './rnn';

export class LSTMTimeStep extends RNNTimeStep {
  equations: Equation[];

  constructor(options: any) {
    super(options);
    this.equations = [];
  }

  getHiddenLayer(hiddenSize: number, prevSize: number): IRNNHiddenLayer {
    return getHiddenLSTMLayer(hiddenSize, prevSize);
  }

  getEquation(
    equation: Equation,
    inputMatrix: Matrix,
    previousResult: Matrix,
    hiddenLayer: IRNNHiddenLayer
  ): Matrix {
    if (!this.equations) {
      this.equations = [];
    }
    return getLSTMEquation(
      equation,
      inputMatrix,
      previousResult,
      hiddenLayer as ILSTMHiddenLayer
    );
  }
}
