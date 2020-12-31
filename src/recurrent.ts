import { RecurrentConnection } from './layer/recurrent-connection';
import { RecurrentInput } from './layer/recurrent-input';
import { RecurrentZeros } from './layer/recurrent-zeros';
import {
  Activation,
  EntryPoint,
  Filter,
  Internal,
  InternalModel,
  Model,
  Modifier,
  Operator,
} from './layer/types';
import { flattenLayers } from './utilities/flatten-layers';
import {
  FeedForward,
  IFeedForwardOptions,
  IFeedForwardTrainingOptions,
  ITrainingStatus,
} from './feed-forward';
import { release, clone } from './utilities/kernel';
import { ILayer, ILayerSettings } from './layer/base-layer';
import { Input, KernelOutput, Texture } from 'gpu.js';

export interface IRecurrentTrainingOptions
  extends IFeedForwardTrainingOptions {}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export interface IRecurrentOptions extends IFeedForwardOptions {
  hiddenLayers: Array<
    (
      inputLayer: ILayer,
      recurrentInput: RecurrentInput | RecurrentZeros,
      index: number
    ) => ILayer
  >;
}

export interface IRecurrentPreppedTrainingData {
  status: ITrainingStatus;
  preparedData: KernelOutput[];
  endTime: number;
}

export class Recurrent extends FeedForward {
  trainOpts: IRecurrentTrainingOptions = {};
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  options: IRecurrentOptions;
  _outputConnection: RecurrentConnection | null = null;
  _layerSets: ILayer[][] = [];
  _hiddenLayerOutputIndices: number[] = [];
  _model: ILayer[] = [];

  _connectLayers(): {
    inputLayer: ILayer;
    hiddenLayers: ILayer[];
    outputLayer: ILayer;
  } {
    if (!this.options.inputLayer) {
      throw new Error('inputLayer not found');
    }
    if (!this.options.outputLayer) {
      throw new Error('outputLayer not found');
    }
    const inputLayer = this.options.inputLayer();
    const hiddenLayers = this._connectHiddenLayers(inputLayer);
    const outputLayer = this.options.outputLayer(
      hiddenLayers[hiddenLayers.length - 1],
      -1
    );
    return {
      inputLayer,
      hiddenLayers,
      outputLayer,
    };
  }

  _connectLayersDeep(): ILayer[] {
    const layers: ILayer[] = [];
    const previousLayers = this._layerSets[this._layerSets.length - 1];
    let usedHiddenLayerOutputIndex = 0;

    function findInputLayer(inputLayer: ILayer) {
      const index = previousLayers.indexOf(inputLayer);
      if (index < 0) throw new Error('unable to find layer');
      return layers[index];
    }

    function layerSettings(layer: ILayer): ILayerSettings {
      return {
        ...layer.settings,
        weights: null,
        deltas: null,
        praxis: null,
      };
    }

    for (let i = 0; i < previousLayers.length; i++) {
      const previousLayer = previousLayers[i];
      let layer: ILayer;

      if (previousLayer instanceof Activation) {
        layer = new (previousLayer.constructor as new (
          inputLayer: ILayer,
          settings?: ILayerSettings
        ) => Activation)(findInputLayer(previousLayer.inputLayer));
      } else if (previousLayer instanceof EntryPoint) {
        layer = new (previousLayer.constructor as new (
          settings: ILayerSettings
        ) => EntryPoint)(layerSettings(previousLayer));
      } else if (previousLayer instanceof Filter) {
        layer = new (previousLayer.constructor as new (
          settings: ILayerSettings,
          inputLayer: ILayer
        ) => Filter)(
          layerSettings(previousLayer.inputLayer),
          findInputLayer(previousLayer.inputLayer)
        );
      } else if (previousLayer instanceof Internal) {
        const previousHiddenLayerOutput =
          previousLayers[
            this._hiddenLayerOutputIndices[usedHiddenLayerOutputIndex++]
          ];
        if (previousLayer instanceof RecurrentConnection) {
          throw new Error('unfinished');
        } else if (previousLayer instanceof RecurrentInput) {
          layer = new RecurrentInput(previousHiddenLayerOutput);
        } else if (previousLayer instanceof RecurrentZeros) {
          layer = new RecurrentInput(previousHiddenLayerOutput);
        } else {
          throw new Error(
            `hidden layer ${previousLayer.constructor.name} extends unknown hidden layer`
          );
        }
      } else if (
        previousLayer instanceof InternalModel ||
        previousLayer instanceof Model
      ) {
        layer = previousLayer;
      } else if (previousLayer instanceof Modifier) {
        layer = new (previousLayer.constructor as new (
          inputLayer: ILayer,
          settings?: ILayerSettings
        ) => Modifier)(
          findInputLayer(previousLayer.inputLayer),
          layerSettings(previousLayer.inputLayer)
        );
      } else if (previousLayer instanceof Operator) {
        layer = new (previousLayer.constructor as new (
          inputLayer1: ILayer,
          inputLayer2: ILayer,
          settings: ILayerSettings
        ) => Operator)(
          findInputLayer(previousLayer.inputLayer1),
          findInputLayer(previousLayer.inputLayer2),
          layerSettings(previousLayer)
        );
      } else {
        throw new Error(
          `hidden layer ${previousLayer.constructor.name} extends unknown hidden layer`
        );
      }
      layers.push(layer);
    }

    return layers;
  }

  _connectHiddenLayers(previousLayer: ILayer): ILayer[] {
    const hiddenLayers = [];

    if (!this.options.hiddenLayers) throw new Error('hiddenLayers not defined');

    for (let i = 0; i < this.options.hiddenLayers.length; i++) {
      const recurrentInput = new RecurrentZeros();
      const hiddenLayer = this.options.hiddenLayers[i](
        previousLayer,
        recurrentInput,
        i
      );
      previousLayer = hiddenLayer;
      hiddenLayers.push(hiddenLayer);
    }

    return hiddenLayers;
  }

  initialize(): void {
    this._outputConnection = new RecurrentConnection();
    const { inputLayer, hiddenLayers, outputLayer } = this._connectLayers();
    const layerSet = flattenLayers([inputLayer, ...hiddenLayers, outputLayer]);
    this._hiddenLayerOutputIndices = hiddenLayers.map((l) =>
      layerSet.indexOf(l)
    );
    this._layerSets = [layerSet];
    this._model = layerSet.filter(
      (l) => l instanceof Model || l instanceof InternalModel
    );
    this.initializeLayers(layerSet);
  }

  initializeDeep(): void {
    const layers = this._connectLayersDeep();
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      layer.setupKernels(true);
      // TODO: enable this?
      // layer.reuseKernels(this._layerSets[0][i]);
    }
    this._layerSets.push(layers);
  }

  run(input: number[]): number[] {
    while (this._layerSets.length <= input.length) {
      this.initializeDeep();
    }
    return super.run(input) as number[];
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  runInput(input: Float32Array): KernelOutput | Input {
    while (this._layerSets.length < input.length) {
      this.initializeDeep();
    }
    const max = input.length - 1; // last output will be compared with last index
    for (let x = 0; x <= max; x++) {
      const layerSet = this._layerSets[x];
      layerSet[0].predict([new Float32Array([input[x]])]);
      for (let i = 1; i < layerSet.length; i++) {
        layerSet[i].predict();
      }
    }
    const lastLayerUsed = this._layerSets[max];
    const result = lastLayerUsed[lastLayerUsed.length - 1].weights;
    this.end();
    return result;
  }

  end(): void {
    const x = this._layerSets.length - 1;
    const lastLayerSet = this._layerSets[x];
    lastLayerSet[0].predict([new Float32Array([0])]);
    for (let i = 1; i < lastLayerSet.length; i++) {
      lastLayerSet[i].predict();
    }
  }

  transferData<T>(formattedData: T): T {
    return formattedData;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  _prepTraining(
    data: Float32Array[],
    options: Partial<IRecurrentTrainingOptions>
  ): IRecurrentPreppedTrainingData {
    this._updateTrainingOptions(options);
    const endTime = this.trainOpts.timeout
      ? Date.now() + this.trainOpts.timeout
      : 0;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized();

    return {
      preparedData: this.transferData(data),
      status,
      endTime,
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  _calculateTrainingError(data: Float32Array[]): number {
    if (!this.meanSquaredError) {
      throw new Error('this.meanSquaredError not setup');
    }
    let sum: KernelOutput = new Float32Array(1);
    for (let i = 0; i < data.length; ++i) {
      const prevSum = sum;
      const error = this._trainPattern(data[i], true) as KernelOutput;
      sum = this.meanSquaredError.add(sum, error);
      release(error);
      release(prevSum);
    }
    const result = this.meanSquaredError.divide(data.length, sum);
    release(sum);
    if (result instanceof Texture) {
      const resultArray = result.toArray() as number[];
      return resultArray[0];
    }
    return (result as number[])[0];
  }

  // TODO: more types
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  formatData(data: Float32Array): Float32Array {
    return data;
  }

  _calculateDeltas(target: Float32Array): void {
    const lastLayerSet = this._layerSets[this._layerSets.length - 1];
    // Iterate from the second to last layer backwards, propagating 0's
    for (let i = lastLayerSet.length - 2; i >= 0; i--) {
      lastLayerSet[i].compare();
    }

    for (let x = target.length - 2; x >= 0; x--) {
      const layerSet = this._layerSets[x];
      layerSet[layerSet.length - 1].compare(new Float32Array([target[x + 1]]));
      for (let i = layerSet.length - 2; i >= 0; i--) {
        layerSet[i].compare();
      }
    }
  }

  adjustWeights(): void {
    const { _model } = this;
    for (let i = 0; i < _model.length; i++) {
      _model[i].learn(this.options.learningRate ?? 0);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  _trainPatterns(data: Float32Array[]): void {
    for (let i = 0; i < data.length; ++i) {
      this._trainPattern(data[i], false);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  _trainPattern(
    input: Float32Array,
    logErrorRate: boolean
  ): KernelOutput | null {
    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(input);
    this.adjustWeights();

    if (logErrorRate) {
      if (!this.meanSquaredError) {
        throw new Error('this.meanSquaredError not setup');
      }
      let error: KernelOutput = new Float32Array(1);
      for (let i = 0, max = input.length - 1; i < max; i++) {
        const layerSet = this._layerSets[i];
        const lastLayer = layerSet[layerSet.length - 1];
        const prevError: KernelOutput = error;
        error = this.meanSquaredError.addAbsolute(
          prevError,
          lastLayer.errors as KernelOutput
        );
        release(prevError);
      }
      return clone(this.meanSquaredError.divide(input.length, error));
    }
    return null;
  }
}
