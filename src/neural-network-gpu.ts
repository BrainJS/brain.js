import {
  alias,
  GPU,
  GPUFunction,
  IKernelFunctionThis,
  IKernelMapRunShortcut,
  IKernelRunShortcut,
  IMappedKernelResult,
  KernelOutput,
  Texture,
  utils,
} from 'gpu.js';
import { ITrainingStatus } from './feed-forward';
import { INumberHash, lookup } from './lookup';
import {
  IJSONLayer,
  INeuralNetworkData,
  INeuralNetworkDatum,
  INeuralNetworkJSON,
  INeuralNetworkOptions,
  INeuralNetworkPreppedTrainingData,
  INeuralNetworkTrainOptions,
  NeuralNetwork,
} from './neural-network';
import { release } from './utilities/kernel';
import { LossFunction, NeuralNetworkIO, RAMFunction, NeuralNetworkRAM } from './neural-network';

export interface INeuralNetworkGPUDatumFormatted {
  input: KernelOutput;
  output: KernelOutput;
}

export interface INeuralNetworkGPUPreppedTrainingData
  extends INeuralNetworkPreppedTrainingData<KernelOutput> {
  status: ITrainingStatus;
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

function calcErrorOutput(value: number): number {
  return value;
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
  learningRate: number,
  momentum: number,
  previousChange: number,
  delta: number,
  previousOutput: number
): number {
  return learningRate * delta * previousOutput + momentum * previousChange;
}

function addWeights(change: number, weight: number): number {
  return change + weight;
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
  targets: KernelOutput,
  inputs: NeuralNetworkIO,
  ram: NeuralNetworkRAM
) => { result: KernelOutput; error: KernelOutput };

export type BackPropagateLayer = (
  this: IKernelFunctionThis,
  weights: KernelOutput,
  outputs: KernelOutput,
  deltas: KernelOutput
) => { result: KernelOutput; error: KernelOutput };

export class NeuralNetworkGPU<
  InputType extends INeuralNetworkData,
  OutputType extends INeuralNetworkData
> extends NeuralNetwork<InputType, OutputType> {
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

  changesPropagate: Array<
    ((
      this: IKernelFunctionThis<{
        size: number;
        learningRate: number;
        momentum: number;
      }>,
      previousOutputs: number[],
      deltas: number[],
      weights: number[][],
      previousChanges: number[][]
    ) => IMappedKernelResult) &
      IKernelMapRunShortcut<{ weights: number[][]; changes: number[][] }>
  > = [];

  biasesPropagate: Array<
    (biases: KernelOutput, deltas: KernelOutput) => KernelOutput
  > = [];

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
  changes: KernelOutput[] = [];
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  biases: KernelOutput[] = [];

  _ramKernel?: IKernelRunShortcut;

  constructor(options: Partial<INeuralNetworkGPUOptions> = {}) {
    super(options);
    this.errorCheckInterval = 100;
    this.gpu = new GPU({ mode: options.mode });
    // Compile the accelerated learning functions.
    this.lossFunction = this._lossFunction;
    this.ramFunction = this._ramFunction;
  }

  public get lossFunction(): LossFunction {
    return super.lossFunction;
  }

  public set lossFunction(
    value: LossFunction
  ) {
    this.gpu.addFunction(value);
    super.lossFunction = value;
  }

  public get ramFunction(): RAMFunction | undefined {
    return super.ramFunction;
  }

  public set ramFunction(
    value: RAMFunction | undefined
  ) {
    if (!value) {
      if (this._ramKernel) delete this._ramKernel;
    }
    else {
      const layerCount = this.sizes.length;
      const maxNeuronsPerLayer = this.sizes.reduce(
        (eax, edx) => edx > eax ? edx : eax
      );
      const ramSize = this.ramSize;
      this._ramKernel = this.gpu.createKernel(
        value,
        {
          constants: {
            ramSize
          },
          output: [ layerCount, maxNeuronsPerLayer, ramSize ]
        }
      );
    }
    super.ramFunction = value;
  }

  initialize(): void {
    super.initialize();
    this.buildRunInput();
    this.buildCalculateDeltas();
    this.buildGetChanges();
    this.buildChangeBiases();
    this.buildGetMSE();
  }

  setActivation(): void {}

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
    const updateRAM: IKernelRunShortcut | undefined = this._ramKernel;
    if (updateRAM) {
      const input = this.outputs[0];
      const output = this.outputs[this.outputLayer];
      const loss = this.loss.current.mean;
      const deltaLoss = loss - this.loss.previous.mean;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._ram = updateRAM(this.ram, input, output, this.sizes, loss, deltaLoss);
    }
    return output;
  };

  buildCalculateDeltas(): void {
    let calcDeltas: GPUFunction<[number, number, NeuralNetworkIO, NeuralNetworkRAM]>;
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

    const loss: LossFunction = this.lossFunction;

    calcDeltas = alias(
      utils.getMinifySafeName(() => calcDeltas),
      calcDeltas
    );
    this.gpu.addFunction(calcDeltas);
    this.gpu.addFunction(loss);
    for (let layer = this.outputLayer; layer > 0; layer--) {
      if (layer === this.outputLayer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.backwardPropagate[this.outputLayer] = this.gpu.createKernelMap(
          {
            error: calcErrorOutput
          },
          function (
            this: IKernelFunctionThis,
            outputs: number[],
            targets: number[],
            inputs: NeuralNetworkIO,
            ram: NeuralNetworkRAM
          ): number {
            const output = outputs[this.thread.x];
            const target = targets[this.thread.x];
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            return calcDeltas(calcErrorOutput(loss(output, target, inputs, ram)), output);
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
        // @ts-ignore
        output = this.backwardPropagate[layer](this.outputs[layer], target, this.outputs[0], this.ram);
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
        function (
          this: IKernelFunctionThis<{
            size: number;
            learningRate: number;
            momentum: number;
          }>,
          previousOutputs: number[],
          deltas: number[],
          weights: number[][],
          previousChanges: number[][]
        ) {
          const change = calcChanges(
            this.constants.learningRate,
            this.constants.momentum,
            previousChanges[this.thread.y][this.thread.x],
            deltas[this.thread.y],
            previousOutputs[this.thread.x]
          );
          return addWeights(change, weights[this.thread.y][this.thread.x]);
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

  run(input: InputType): OutputType {
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
      formattedInput = (input as unknown) as Float32Array;
    }
    this.validateInput(formattedInput);
    const outputTextures = this.runInput(formattedInput);
    const output =
      outputTextures instanceof Texture
        ? outputTextures.toArray()
        : outputTextures;

    if (this.outputLookup) {
      return (lookup.toObject(
        this.outputLookup,
        output as Float32Array
      ) as unknown) as OutputType;
    }

    return (output as unknown) as OutputType;
  }

  // @ts-expect-error the underlying network works as normal, but we are working on the GPU
  prepTraining(
    data: Array<INeuralNetworkDatum<InputType, OutputType>>,
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
        output: [preparedData[0].output.length],
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

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  toFunction(): (input: InputType) => OutputType {
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
    const jsonLayerMemory = this.ram?.map((layerMemory, layerIndex) =>
      layerMemory.map(nodeMemory =>
        Array.from(nodeMemory)
      )
    );
    const jsonLayers: IJSONLayer[] = [];
    for (let i = 0; i <= this.outputLayer; i++) {
      const jsonLayer: IJSONLayer = {
        weights: jsonLayerWeights[i] ?? [],
        biases: jsonLayerBiases[i] ?? []
      };
      if (jsonLayerMemory) jsonLayer.ram = jsonLayerMemory[i] ?? [];
      jsonLayers.push(jsonLayer);
    }
    return {
      type: 'NeuralNetworkGPU',
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
