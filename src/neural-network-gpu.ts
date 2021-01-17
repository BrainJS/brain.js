import {
  alias,
  GPU,
  GPUFunction,
  IKernelFunctionThis,
  KernelOutput,
  Texture,
  utils,
} from 'gpu.js';
import { ITrainingStatus } from './feed-forward';
import { InputOutputValue, INumberHash, lookup } from './lookup';
import {
  IJSONLayer,
  INeuralNetworkDatum,
  INeuralNetworkJSON,
  INeuralNetworkOptions,
  INeuralNetworkPreppedTrainingData,
  INeuralNetworkTrainOptions,
  NeuralNetwork,
} from './neural-network';
import { release } from './utilities/kernel';

export interface INeuralNetworkGPUDatumFormatted {
  input: KernelOutput;
  output: KernelOutput;
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export interface INeuralNetworkGPUPreppedTrainingData
  extends INeuralNetworkPreppedTrainingData {
  status: ITrainingStatus;
  preparedData: INeuralNetworkGPUDatumFormatted[];
  endTime: number;
}

interface ISizedKernelThis extends IKernelFunctionThis {
  constants: {
    size: number;
  };
}

function weightedSumSigmoid(
  this: ISizedKernelThis,
  weights: number[][],
  biases: number[],
  inputs: number[]
): number {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  // sigmoid
  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(
  this: ISizedKernelThis,
  weights: number[][],
  biases: number[],
  inputs: number[]
): number {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  // relu
  return sum < 0 ? 0 : sum;
}

function weightedSumLeakyRelu(
  this: ISizedKernelThis,
  weights: number[][],
  biases: number[],
  inputs: number[]
): number {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  // leaky relu
  return sum < 0 ? 0 : 0.01 * sum;
}

function weightedSumTanh(
  this: ISizedKernelThis,
  weights: number[][],
  biases: number[],
  inputs: number[]
): number {
  let sum = biases[this.thread.x];
  for (let k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  }
  // tanh
  return Math.tanh(sum);
}

function calcErrorOutput(output: number, target: number): number {
  return target - output;
}

function calcDeltasSigmoid(error: number, output: number): number {
  // sigmoid derivative
  return error * output * (1 - output);
}

function calcDeltasRelu(error: number, output: number): number {
  // relu derivative
  return output > 0 ? error : 0;
}

function calcDeltasLeakyRelu(error: number, output: number): number {
  // leaky relu derivative
  return output > 0 ? error : 0.01 * error;
}

function calcDeltasTanh(error: number, output: number): number {
  // tanh derivative
  return (1 - output * output) * error;
}

function calcError(
  x: number,
  size: number,
  nextWeights: number[][],
  nextDeltas: number[]
): number {
  let error = 0;
  for (let k = 0; k < size; k++) {
    error += nextDeltas[k] * nextWeights[k][x];
  }
  return error;
}

interface ILearningKernelThis extends IKernelFunctionThis {
  constants: {
    momentum: number;
    learningRate: number;
  };
}

function calcChanges(
  this: ILearningKernelThis,
  previousChanges: number[][],
  deltas: number[],
  previousOutputs: number[]
): number {
  return (
    this.constants.learningRate *
      deltas[this.thread.y] *
      previousOutputs[this.thread.x] +
    this.constants.momentum * previousChanges[this.thread.y][this.thread.x]
  );
}

function addWeights(
  this: IKernelFunctionThis,
  change: number,
  weights: number[][]
): number {
  return change + weights[this.thread.y][this.thread.x];
}

function addBiases(
  this: ILearningKernelThis,
  biases: number[],
  deltas: number[]
): number {
  return (
    biases[this.thread.x] + deltas[this.thread.x] * this.constants.learningRate
  );
}

// mean squared error, reimplemented for GPU
function mse(this: ISizedKernelThis, errors: number[]): number {
  let sum = 0;
  for (let i = 0; i < this.constants.size; i++) {
    sum += errors[i] ** 2;
  }
  return sum / this.constants.size;
}

export interface INeuralNetworkGPUOptions extends INeuralNetworkOptions {
  mode?: 'cpu' | 'gpu';
}

export type BackPropagateOutput = (
  this: IKernelFunctionThis,
  outputs: KernelOutput,
  targets: KernelOutput
) => { result: KernelOutput; error: KernelOutput };

export type BackPropagateLayer = (
  this: IKernelFunctionThis,
  weights: KernelOutput,
  outputs: KernelOutput,
  deltas: KernelOutput
) => { result: KernelOutput; error: KernelOutput };

export class NeuralNetworkGPU extends NeuralNetwork {
  gpu: GPU;

  texturizeInputData: (value: KernelOutput) => KernelOutput = () => {
    throw new Error('not yet setup');
  };

  forwardPropagate: Array<
    (
      weights: KernelOutput,
      biases: KernelOutput,
      inputs: KernelOutput
    ) => KernelOutput
  > = [];

  backwardPropagate: Array<BackPropagateOutput | BackPropagateLayer> = [];

  changesPropagate = [];
  biasesPropagate = [];

  getMSE: (error: KernelOutput) => KernelOutput = () => {
    throw new Error('not yet setup');
  };

  _addMSE: (sum: KernelOutput, error: KernelOutput) => KernelOutput = () => {
    throw new Error('not yet setup');
  };

  _divideMSESum: (length: number, sum: KernelOutput) => KernelOutput = () => {
    throw new Error('not yet setup');
  };

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  outputs: KernelOutput[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  deltas: KernelOutput[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  errors: KernelOutput[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  weights: KernelOutput[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  biases: KernelOutput[] = [];

  constructor(options: Partial<INeuralNetworkGPUOptions> = {}) {
    super(options);
    this.errorCheckInterval = 100;
    this.gpu = new GPU({ mode: options.mode });
  }

  initialize(): void {
    super.initialize();
    this.buildRunInput();
    this.buildCalculateDeltas();
    this.buildGetChanges();
    this.buildChangeBiases();
    this.buildGetMSE();
  }

  setActivation() {}

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  trainPattern(
    value: INeuralNetworkGPUDatumFormatted,
    logErrorRate?: boolean
  ): KernelOutput | null {
    // forward propagate
    this.runInput(value.input);

    // back propagate
    this.calculateDeltas(value.output);
    this.adjustWeights();

    if (logErrorRate) {
      return this.getMSE(this.errors[this.outputLayer]);
    }
    return null;
  }

  calculateTrainingError(data: INeuralNetworkGPUDatumFormatted[]): number {
    let sum = new Float32Array([0]) as KernelOutput;
    for (let i = 0; i < data.length; ++i) {
      const prevSum = sum;
      const error = this.trainPattern(data[i], true) as KernelOutput;
      sum = this._addMSE(sum, error);
      release(error);
      release(prevSum);
    }
    const result = this._divideMSESum(data.length, sum);
    release(sum);
    return (result instanceof Texture
      ? (result.toArray() as number[])
      : (result as number[]))[0];
  }

  adjustWeights(): void {
    this.getChanges();
    this.changeBiases();
  }

  buildRunInput(): void {
    let weightedSum = null;

    switch (this.trainOpts.activation) {
      case 'sigmoid':
        weightedSum = weightedSumSigmoid;
        break;
      case 'relu':
        weightedSum = weightedSumRelu;
        break;
      case 'leaky-relu':
        weightedSum = weightedSumLeakyRelu;
        break;
      case 'tanh':
        weightedSum = weightedSumTanh;
        break;
      default:
        throw new Error(
          `Unknown activation ${this.trainOpts.activation}. Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'`
        );
    }

    for (let layer = 1; layer <= this.outputLayer; layer++) {
      this.forwardPropagate[layer] = this.gpu.createKernel(weightedSum, {
        output: [this.sizes[layer]],
        pipeline: true,
        constants: {
          size: this.sizes[layer - 1],
        },
        immutable: true,
      });
    }

    this.texturizeInputData = this.gpu.createKernel(
      function (value: number[]): number {
        return value[this.thread.x];
      },
      {
        output: [this.sizes[1]],
        pipeline: true,
        immutable: true,
      }
    );
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  runInput = (input: KernelOutput): KernelOutput => {
    let output;
    this.outputs[0] = input;
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      release(this.outputs[layer]);
      this.outputs[layer] = this.forwardPropagate[layer](
        this.weights[layer],
        this.biases[layer],
        input
      );
      output = input = this.outputs[layer];
    }
    return output;
  };

  buildCalculateDeltas(): void {
    let calcDeltas: GPUFunction<[number, number]>;
    switch (this.trainOpts.activation) {
      case 'sigmoid':
        calcDeltas = calcDeltasSigmoid;
        break;
      case 'relu':
        calcDeltas = calcDeltasRelu;
        break;
      case 'leaky-relu':
        calcDeltas = calcDeltasLeakyRelu;
        break;
      case 'tanh':
        calcDeltas = calcDeltasTanh;
        break;
      default:
        throw new Error(
          `Unknown activation ${this.trainOpts.activation}. Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'`
        );
    }

    calcDeltas = alias(
      utils.getMinifySafeName(() => calcDeltas),
      calcDeltas
    );
    this.gpu.addFunction(calcDeltas);
    for (let layer = this.outputLayer; layer > 0; layer--) {
      if (layer === this.outputLayer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.backwardPropagate[this.outputLayer] = this.gpu.createKernelMap(
          {
            error: calcErrorOutput,
          },
          function (
            this: IKernelFunctionThis,
            outputs: number[],
            targets: number[]
          ): number {
            const output = outputs[this.thread.x];
            const target = targets[this.thread.x];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return calcDeltas(calcErrorOutput(output, target), output);
          },
          {
            output: [this.sizes[this.outputLayer]],
            pipeline: true,
            immutable: true,
          }
        );
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.backwardPropagate[layer] = this.gpu.createKernelMap(
          {
            error: calcError,
          },
          function (
            this: ISizedKernelThis,
            nextWeights: number[][],
            outputs: number[],
            nextDeltas: number[]
          ): number {
            const output = outputs[this.thread.x];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return calcDeltas(
              calcError(
                this.thread.x,
                this.constants.size,
                nextWeights,
                nextDeltas
              ),
              output
            );
          },
          {
            output: [this.sizes[layer]],
            pipeline: true,
            constants: {
              size: this.sizes[layer + 1],
            },
            immutable: true,
          }
        );
      }
    }
  }

  calculateDeltas = (target: KernelOutput): void => {
    for (let layer = this.outputLayer; layer > 0; layer--) {
      release(this.deltas[layer]);
      release(this.errors[layer]);

      let output;
      if (layer === this.outputLayer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        output = this.backwardPropagate[layer](this.outputs[layer], target);
      } else {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        output = this.backwardPropagate[layer](
          this.weights[layer + 1],
          this.outputs[layer],
          this.deltas[layer + 1]
        );
      }
      this.deltas[layer] = output.result;
      this.errors[layer] = output.error;
    }
  };

  buildGetChanges(): void {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.changesPropagate[layer] = this.gpu.createKernelMap(
        {
          weights: addWeights,
          changes: calcChanges,
        },
        function (previousOutputs, deltas, weights, changes) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          const change = calcChanges(changes, deltas, previousOutputs);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-expect-error
          return addWeights(change, weights);
        },
        {
          output: [this.sizes[layer - 1], this.sizes[layer]],
          pipeline: true,
          constants: {
            size: this.sizes[layer - 1],
            learningRate: this.trainOpts.learningRate,
            momentum: this.trainOpts.momentum,
          },
          immutable: true,
        }
      );
    }
  }

  getChanges(): void {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const weights = this.weights[layer];
      const changes = this.changes[layer];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const output = this.changesPropagate[layer](
        this.outputs[layer - 1],
        this.deltas[layer],
        weights,
        changes
      );
      release(weights);
      release(changes);
      this.weights[layer] = output.weights;
      this.changes[layer] = output.changes;
      release(output.result);
    }
  }

  buildChangeBiases(): void {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.biasesPropagate[layer] = this.gpu.createKernel(addBiases, {
        output: [this.sizes[layer]],
        pipeline: true,
        constants: {
          learningRate: this.trainOpts.learningRate,
        },
        immutable: true,
      });
    }
  }

  changeBiases(): void {
    for (let layer = 1; layer <= this.outputLayer; layer++) {
      const biases = this.biases[layer];
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      this.biases[layer] = this.biasesPropagate[layer](
        biases,
        this.deltas[layer]
      );
      release(biases);
    }
  }

  buildGetMSE(): void {
    this.getMSE = this.gpu.createKernel(mse, {
      output: [1],
      constants: {
        size: this.sizes[this.outputLayer],
      },
      pipeline: true,
      immutable: true,
    });
    this._addMSE = this.gpu.createKernel(
      function (value1: number[], value2: number[]): number {
        return value1[0] + value2[0];
      },
      {
        output: [1],
        pipeline: true,
        immutable: true,
      }
    );
    this._divideMSESum = this.gpu.createKernel(
      function (length: number, mseSum: number[]): number {
        const value = mseSum[0];
        if (value > 0) {
          return value / length;
        }
        return 0;
      },
      {
        output: [1],
      }
    );
  }

  run<T extends InputOutputValue | InputOutputValue[] | KernelOutput>(
    input: T
  ): T {
    if (!this.isRunnable) {
      throw new Error('network not runnable');
    }
    let formattedInput: Float32Array;
    if (this.inputLookup) {
      formattedInput = lookup.toArray(
        this.inputLookup,
        (input as unknown) as INumberHash,
        this.inputLookupLength
      );
    } else {
      formattedInput = input as Float32Array;
    }
    const outputTextures = this.runInput(formattedInput);
    const output =
      outputTextures instanceof Texture
        ? outputTextures.toArray()
        : outputTextures;

    if (this.outputLookup) {
      return lookup.toObject(this.outputLookup, output as Float32Array) as T;
    }

    return output as T;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  prepTraining(
    data: INeuralNetworkDatum[],
    options: Partial<INeuralNetworkTrainOptions> = {}
  ): INeuralNetworkGPUPreppedTrainingData {
    this.updateTrainingOptions(options);
    const preparedData = this.formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized(preparedData);

    const texturizeOutputData = this.gpu.createKernel(
      function (value: number[]): number {
        return value[this.thread.x];
      },
      {
        output: [data[0].output.length],
        pipeline: true,
        immutable: true,
      }
    );

    return {
      preparedData: preparedData.map((set) => ({
        input: this.texturizeInputData(set.input),
        output: texturizeOutputData(set.output),
      })),
      status,
      endTime,
    };
  }

  toFunction(): <T extends number[] | Float32Array | INumberHash>(
    input: T
  ) => T {
    throw new Error(
      `${this.constructor.name}-toFunction is not yet implemented`
    );
  }

  toJSON(): INeuralNetworkJSON {
    if (this.sizes === null) {
      this.initialize();
    }
    // use Array.from, keeping json small
    const jsonLayerWeights = this.weights.map((layerWeights) => {
      return (layerWeights instanceof Texture
        ? (layerWeights.toArray() as Float32Array[])
        : (layerWeights as Float32Array[])
      ).map((layerWeights) => Array.from(layerWeights));
    });
    const jsonLayerBiases = this.biases.map((layerBiases) =>
      Array.from(
        layerBiases instanceof Texture
          ? (layerBiases.toArray() as Float32Array)
          : (layerBiases as Float32Array)
      )
    );
    const jsonLayers: IJSONLayer[] = [];
    for (let i = 0; i <= this.outputLayer; i++) {
      jsonLayers.push({
        weights: jsonLayerWeights[i] ?? [],
        biases: jsonLayerBiases[i] ?? [],
      });
    }
    return {
      sizes: [...this.sizes],
      layers: jsonLayers,
      inputLookup: this.inputLookup ? { ...this.inputLookup } : null,
      inputLookupLength: this.inputLookupLength,
      outputLookup: this.outputLookup ? { ...this.outputLookup } : null,
      outputLookupLength: this.outputLookupLength,
      options: { ...this.options },
      trainOpts: this.getTrainOptsJSON(),
    };
  }
}
