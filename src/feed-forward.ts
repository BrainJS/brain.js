import { IKernelFunctionThis, KernelOutput, Texture } from 'gpu.js';
import { MeanSquaredError } from './estimator/mean-squared-error';
import { ILayer, ILayerJSON } from './layer';
import { Model } from './layer/types';
import { InputOutputValue, INumberArray, INumberHash, lookup } from './lookup';
import * as praxis from './praxis';
import { IPraxis, IPraxisSettings } from './praxis/base-praxis';
import { flattenLayers } from './utilities/flatten-layers';
import { makeKernel, release } from './utilities/kernel';
import { layerFromJSON } from './utilities/layer-from-json';
import { LookupTable } from './utilities/lookup-table';
import { Thaw } from 'thaw.js';

export interface IFeedForwardTrainingData<
  InputType extends InputOutputValue | KernelOutput = number[] | Float32Array,
  OutputType extends InputOutputValue | KernelOutput = number[] | Float32Array
> {
  input: InputType;
  output: OutputType;
}

export interface IFeedForwardNormalizedTrainingData {
  input: Float32Array;
  output: Float32Array;
}

export interface IFeedForwardGPUTrainingData {
  input: KernelOutput;
  output: KernelOutput;
}

export interface ITrainingStatus {
  iterations: number;
  error: number;
}

export type Log = (status: string) => void;
export type FeedForwardCallback = (status: ITrainingStatus) => void;

export interface IFeedForwardTrainingOptions {
  iterations?: number;
  errorThresh?: number;
  log?: boolean | Log;
  logPeriod?: number;
  learningRate?: number;
  callback?: FeedForwardCallback;
  callbackPeriod?: number;
  errorCheckInterval?: number;
  timeout?: number;
}

export interface IFeedForwardOptions {
  learningRate?: number;
  binaryThresh?: number;
  hiddenLayers?: Array<(inputLayer: ILayer, layerIndex: number) => ILayer>;
  inputLayer?: () => ILayer;
  outputLayer?: (inputLayer: ILayer, index: number) => ILayer;
  praxisOpts?: Partial<IPraxisSettings>;
  initPraxis?: (
    layerTemplate: ILayer,
    settings: Partial<IPraxisSettings>
  ) => IPraxis;
  praxis?: IPraxis;

  // JSON
  layers?: ILayer[];
  inputLayerIndex?: number;
  outputLayerIndex?: number;
  sizes?: number[];
}

export interface IFeedForwardPreppedTrainingData {
  status: ITrainingStatus;
  preparedData: IFeedForwardGPUTrainingData[];
  endTime: number;
}

export const defaults: IFeedForwardOptions = {
  learningRate: 0.3,
  binaryThresh: 0.5,
  initPraxis: (
    layerTemplate: ILayer,
    settings: Partial<IPraxisSettings>
  ): IPraxis =>
    praxis.momentumRootMeanSquaredPropagation(
      layerTemplate,
      layerTemplate.settings.praxisOpts ?? settings
    ),
};

export const trainDefaults: IFeedForwardTrainingOptions = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.3,
  callbackPeriod: 10,
  errorCheckInterval: 100,
  timeout: Infinity,
};

export interface IFeedForwardJSON {
  type: string;
  sizes: number[];
  layers: ILayerJSON[];
  inputLayerIndex: number;
  outputLayerIndex: number;
}

export class FeedForward<
  InputType extends InputOutputValue | KernelOutput = number[] | Float32Array,
  OutputType extends InputOutputValue | KernelOutput = number[] | Float32Array
> {
  static _validateTrainingOptions(
    options: Partial<IFeedForwardTrainingOptions>
  ): void {
    const {
      iterations,
      errorThresh,
      log,
      logPeriod,
      learningRate,
      callback,
      callbackPeriod,
      timeout,
    } = options;
    interface IValidation {
      [optionName: string]: () => boolean;
    }
    const validations: IValidation = {
      iterations: () => typeof iterations === 'number' && iterations > 0,
      errorThresh: () =>
        typeof errorThresh === 'number' && errorThresh > 0 && errorThresh < 1,
      log: () => typeof log === 'function' || typeof log === 'boolean',
      logPeriod: () => typeof logPeriod === 'number' && logPeriod > 0,
      learningRate: () =>
        typeof learningRate === 'number' &&
        learningRate > 0 &&
        learningRate < 1,
      callback: () => typeof callback === 'function' || callback === null,
      callbackPeriod: () =>
        typeof callbackPeriod === 'number' && callbackPeriod > 0,
      timeout: () => typeof timeout === 'number' && timeout > 0,
    };
    Object.keys(trainDefaults).forEach((key: string): void => {
      if (validations.hasOwnProperty(key) && !validations[key]()) {
        const val = options[key as keyof IFeedForwardTrainingOptions];
        throw new Error(
          `[${key}, ${(
            val ?? 'undefined'
          ).toString()}] is out of normal training range, your network will probably not train.`
        );
      }
    });
  }

  /**
   * if a method is passed in method is used
   * if false passed in nothing is logged
   */
  _setLogMethod(log: Log | undefined | boolean): void {
    if (typeof log === 'function') {
      this.trainOpts.log = log;
    } else if (log) {
      // eslint-disable-next-line
      this.trainOpts.log = console.log;
    } else {
      this.trainOpts.log = false;
    }
  }

  _updateTrainingOptions(opts: Partial<IFeedForwardTrainingOptions>): void {
    this.trainOpts = { ...trainDefaults, ...this.trainOpts, ...opts };
    FeedForward._validateTrainingOptions(this.trainOpts);
    this._setLogMethod(opts.log ?? this.trainOpts.log);
    const { callback, callbackPeriod, errorCheckInterval } = this.trainOpts;
    if (callback && callbackPeriod !== errorCheckInterval) {
      console.warn(
        `options.callbackPeriod with value of ${(
          callbackPeriod ?? 'undefined'
        ).toString()} does not match options.errorCheckInterval with value of ${(
          errorCheckInterval ?? 'undefined'
        ).toString()}, if logging error, it will repeat.  These values may need to match`
      );
    }
  }

  trainOpts: Partial<IFeedForwardTrainingOptions> = {};
  options: IFeedForwardOptions;
  layers: ILayer[] | null = null;
  _inputLayer: ILayer | null = null;
  _hiddenLayers: ILayer[] | null = null;
  _outputLayer: ILayer | null = null;
  _model: ILayer[] | null = null;
  meanSquaredError: MeanSquaredError | null = null;
  inputLookup: INumberHash | null = null;
  inputLookupLength: number | null = null;
  outputLookup: INumberHash | null = null;
  outputLookupLength: number | null = null;
  constructor(options: IFeedForwardOptions = {}) {
    this.options = { ...defaults, ...options };
    this._updateTrainingOptions({
      ...trainDefaults,
      ...options,
    });
  }

  _connectOptionsLayers(): ILayer[] {
    const { inputLayerIndex, outputLayerIndex, layers } = this.options;
    if (!layers) throw new Error('this.options.layers in unexpected state');
    if (typeof inputLayerIndex !== 'number')
      throw new Error('inputLayerIndex not a number');
    if (typeof outputLayerIndex !== 'number')
      throw new Error('inputLayerIndex not a number');
    const inputLayer = layers[inputLayerIndex];
    if (!inputLayer) {
      throw new Error('inputLayer not found in this.options.layers');
    }
    const outputLayer = layers[outputLayerIndex];
    if (!outputLayer) {
      throw new Error('outputLayer not found in this.options.layers');
    }
    this._inputLayer = inputLayer;
    this._hiddenLayers = layers.slice(
      inputLayerIndex,
      outputLayerIndex - inputLayerIndex
    );
    this._outputLayer = outputLayer;
    return layers;
  }

  _connectNewLayers(): ILayer[] {
    const { inputLayer, outputLayer } = this.options;
    if (!inputLayer) throw new Error('inputLayer not defined');
    const layers: ILayer[] = [];
    this._inputLayer = inputLayer();
    const hiddenLayers = this._connectHiddenLayers(this._inputLayer);

    if (!outputLayer) throw new Error('outputLayer not defined');
    this._outputLayer = outputLayer(
      hiddenLayers[hiddenLayers.length - 1],
      hiddenLayers.length
    );
    layers.push(this._inputLayer);
    layers.push(...hiddenLayers);
    layers.push(this._outputLayer);
    return flattenLayers(layers);
  }

  _connectHiddenLayers(previousLayer: ILayer): ILayer[] {
    this._hiddenLayers = [];
    const result: ILayer[] = [];
    const { hiddenLayers } = this.options;

    if (!hiddenLayers) throw new Error('hiddenLayers not defined');

    for (let i = 0; i < hiddenLayers.length; i++) {
      const hiddenLayer = hiddenLayers[i](previousLayer, i);
      result.push(hiddenLayer);
      this._hiddenLayers.push(hiddenLayer);
      previousLayer = hiddenLayer;
    }

    return result;
  }

  initialize(): void {
    this.layers = this.options.layers
      ? this._connectOptionsLayers()
      : this._connectNewLayers();
    this.initializeLayers(this.layers);
    this._model = this.layers.filter((l) => l instanceof Model);
  }

  initializeLayers(layers: ILayer[]): void {
    for (let i = 0; i < layers.length; i++) {
      const layer = layers[i];
      // TODO: optimize for when training or just running
      layer.setupKernels(true);
      if (
        layer instanceof Model &&
        layer.praxis === null &&
        typeof this.options.initPraxis === 'function'
      ) {
        layer.praxis = this.options.initPraxis(
          layer,
          layer.settings.praxisOpts ?? this.options.praxisOpts ?? {}
        );
        layer.praxis.setupKernels();
      }
    }

    const lastLayer = layers[layers.length - 1];
    this.meanSquaredError = new MeanSquaredError({
      width: lastLayer.width,
      height: lastLayer.height,
    });
  }

  run(input: InputType): OutputType {
    let typeSafeInput: INumberArray | KernelOutput;
    if (Array.isArray(input) || (input as Float32Array).buffer) {
      typeSafeInput = input as INumberArray;
    } else {
      if (this.inputLookup) {
        typeSafeInput = lookup.toArray(
          this.inputLookup,
          input as INumberHash,
          this.inputLookupLength as number
        );
      } else {
        throw new Error('input is incompatible with net');
      }
    }

    let output = this.runInput(typeSafeInput as KernelOutput);
    if (output instanceof Texture) {
      output = output.toArray();
    }

    if (this.outputLookup) {
      return lookup.toObject(
        this.outputLookup,
        output as number[]
      ) as OutputType;
    }
    return output as OutputType;
  }

  runInput(input: KernelOutput): KernelOutput {
    if (!this.layers) throw new Error('not initialized');
    this.layers[0].predict(input);
    for (let i = 1; i < this.layers.length; i++) {
      this.layers[i].predict();
    }
    return this.layers[this.layers.length - 1].weights as KernelOutput;
  }

  train(
    data: Array<IFeedForwardTrainingData<InputType, OutputType>>,
    options: Partial<IFeedForwardTrainingOptions> = {}
  ): ITrainingStatus {
    const { preparedData, status, endTime } = this._prepTraining(data, options);
    let continueTicking = true;
    const calculateError = (): number =>
      this._calculateTrainingError(preparedData);
    const trainPatterns = (): void => this._trainPatterns(preparedData);
    while (continueTicking) {
      continueTicking = this._trainingTick(
        status,
        endTime,
        calculateError,
        trainPatterns
      );
    }
    return status;
  }

  async trainAsync(
    data: Array<IFeedForwardTrainingData<InputType, OutputType>>,
    options: Partial<IFeedForwardTrainingOptions> = {}
  ): Promise<ITrainingStatus> {
    const { preparedData, status, endTime } = this._prepTraining(data, options);

    return await new Promise((resolve, reject) => {
      try {
        const calculateError = (): number =>
          this._calculateTrainingError(preparedData);
        const trainPatterns = (): void => this._trainPatterns(preparedData);
        const thawedTrain: Thaw = new Thaw(
          new Array(this.trainOpts.iterations),
          {
            delay: true,
            each: () =>
              this._trainingTick(
                status,
                endTime,
                calculateError,
                trainPatterns
              ) || thawedTrain.stop(),
            done: () => resolve(status),
          }
        );
        thawedTrain.tick();
      } catch (trainError) {
        reject(trainError);
      }
    });
  }

  _trainingTick(
    status: ITrainingStatus,
    endTime: number,
    calculateError: () => number,
    trainPatterns: () => void
  ): boolean {
    const { trainOpts } = this;
    if (
      status.iterations >= (trainOpts.iterations as number) ||
      status.error <= (trainOpts.errorThresh as number) ||
      Date.now() >= endTime
    ) {
      return false;
    }

    if (
      typeof trainOpts.log === 'function' &&
      status.iterations % (trainOpts.logPeriod as number) === 0
    ) {
      status.error = calculateError();
      trainOpts.log(
        `iterations: ${status.iterations}, training error: ${status.error}`
      );
    } else if (
      status.iterations % (trainOpts.errorCheckInterval as number) ===
      0
    ) {
      status.error = calculateError();
    } else {
      trainPatterns();
    }

    if (
      trainOpts.callback &&
      status.iterations % (trainOpts.callbackPeriod as number) === 0
    ) {
      trainOpts.callback(Object.assign(status));
    }

    status.iterations++;
    return true;
  }

  _prepTraining(
    data: Array<IFeedForwardTrainingData<InputType, OutputType>>,
    options: Partial<IFeedForwardTrainingOptions>
  ): IFeedForwardPreppedTrainingData {
    this._updateTrainingOptions(options);

    const formattedData = this.formatData(data);
    const endTime = this.trainOpts.timeout
      ? Date.now() + this.trainOpts.timeout
      : 0;

    const status = {
      error: 1,
      iterations: 0,
    };

    this.verifyIsInitialized();

    return {
      preparedData: this.transferData(formattedData),
      status,
      endTime,
    };
  }

  verifyIsInitialized(): void {
    if (!this._model) {
      this.initialize();
    }
  }

  _calculateTrainingError(preparedData: IFeedForwardGPUTrainingData[]): number {
    let sum: Float32Array | KernelOutput = new Float32Array([0]);
    const meanSquaredError = this.meanSquaredError as MeanSquaredError;
    for (let i = 0; i < preparedData.length; ++i) {
      const prevSum = sum;
      const error = this._trainPattern(
        preparedData[i].input,
        preparedData[i].output,
        true
      ) as number;
      sum = meanSquaredError.add(sum, error);
      release(error);
      release(prevSum);
    }
    const result = meanSquaredError.divide(preparedData.length, sum);
    release(sum);
    if (result instanceof Texture) {
      const resultArray: number[] = result.toArray() as number[];
      release(result);
      return resultArray[0];
    }
    return (result as number[])[0];
  }

  /**
   * @param data
   * @private
   */
  _trainPatterns(data: IFeedForwardGPUTrainingData[]): void {
    for (let i = 0; i < data.length; ++i) {
      this._trainPattern(data[i].input, data[i].output, false);
    }
  }

  _trainPattern(
    input: KernelOutput,
    target: KernelOutput,
    logErrorRate: boolean
  ): KernelOutput | null {
    // forward propagate
    this.runInput(input);

    // back propagate
    this._calculateDeltas(target);
    this.adjustWeights();

    if (logErrorRate) {
      if (!this._outputLayer?.errors) {
        throw new Error('outputLayer.errors not defined');
      }
      return (this.meanSquaredError as MeanSquaredError).calculate(
        this._outputLayer.errors
      );
    }
    return null;
  }

  _calculateDeltas(target: KernelOutput): void {
    const layers = this.layers as ILayer[];
    for (let i = layers.length - 1; i > -1; i--) {
      layers[i].compare(target);
    }
  }

  /**
   *
   */
  adjustWeights(): void {
    const _model = this._model as ILayer[];
    for (let i = 0; i < _model.length; i++) {
      _model[i].learn(this.trainOpts.learningRate as number);
    }
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(
    data:
      | Array<IFeedForwardTrainingData<InputType, OutputType>>
      | IFeedForwardTrainingData<InputType, OutputType>
  ): IFeedForwardNormalizedTrainingData[] {
    if (!Array.isArray(data)) {
      // turn stream datum into array
      const tmp = [];
      tmp.push(data);
      data = tmp;
    }

    // turn sparse hash input into arrays with 0s as filler
    const inputDatumCheck = data[0].input;
    let formattedData: Array<Partial<IFeedForwardNormalizedTrainingData>>;
    if (
      Array.isArray(data) &&
      !Array.isArray(inputDatumCheck) &&
      !(inputDatumCheck instanceof Float32Array)
    ) {
      if (!this.inputLookup) {
        const lookupTable = new LookupTable(data, 'input');
        this.inputLookup = lookupTable.table;
        this.inputLookupLength = lookupTable.length;
      }
      formattedData = data.map((datumParam): Partial<
        IFeedForwardNormalizedTrainingData
      > => {
        const array = lookup.toArray(
          this.inputLookup as INumberHash,
          datumParam.input as INumberHash,
          this.inputLookupLength as number
        );
        return { input: array };
      }, this);
    } else {
      formattedData = data as typeof formattedData;
    }

    const outputDatumCheck = data[0].output;
    if (
      !Array.isArray(outputDatumCheck) &&
      !(outputDatumCheck instanceof Float32Array)
    ) {
      if (!this.outputLookup) {
        const lookupTable = new LookupTable(data, 'output');
        this.outputLookup = lookupTable.table;
        this.outputLookupLength = lookupTable.length;
      }
      formattedData = data.map(
        (datumParam, index): IFeedForwardNormalizedTrainingData => {
          const array = lookup.toArray(
            this.outputLookup as INumberHash,
            datumParam.output as INumberHash,
            this.inputLookupLength as number
          );
          return {
            input: formattedData[index].input as Float32Array,
            output: array,
          };
        },
        this
      );
    }
    return formattedData as IFeedForwardNormalizedTrainingData[];
  }

  transferData(
    formattedData: IFeedForwardNormalizedTrainingData[]
  ): IFeedForwardGPUTrainingData[] {
    const transferredData = new Array(formattedData.length);
    const transferInput = makeKernel(
      function (value: number[]): number {
        return value[this.thread.x];
      },
      {
        output: [formattedData[0].input.length],
        immutable: true,
      }
    );
    const transferOutput = makeKernel(
      function (this: IKernelFunctionThis, value: number[]): number {
        return value[this.thread.x];
      },
      {
        output: [formattedData[0].output.length],
        immutable: true,
      }
    );

    for (let i = 0; i < formattedData.length; i++) {
      const formattedDatum = formattedData[i];
      transferredData[i] = {
        input: transferInput(formattedDatum.input),
        output: transferOutput(formattedDatum.output),
      };
    }
    return transferredData;
  }

  /**
   *
   * @param data
   * @returns {
   *  {
   *    error: number,
   *    misclasses: Array
   *  }
   * }
   */
  test(): void {
    throw new Error(`${this.constructor.name}-test is not yet implemented`);
  }

  /**
   *
   */
  toJSON(): IFeedForwardJSON {
    if (!this.layers) {
      this.initialize();
    }
    if (
      !this._model ||
      !this.layers ||
      !this._inputLayer ||
      !this._hiddenLayers ||
      !this._outputLayer
    ) {
      throw new Error('network is not initialized');
    }
    const jsonLayers = [];
    for (let i = 0; i < this.layers.length; i++) {
      const layer = this.layers[i];
      const jsonLayer = layer.toJSON();
      if (layer.hasOwnProperty('inputLayer')) {
        jsonLayer.inputLayerIndex = this.layers.indexOf(
          layer.inputLayer as ILayer
        );
      } else if (
        layer.hasOwnProperty('inputLayer1') &&
        layer.hasOwnProperty('inputLayer2')
      ) {
        jsonLayer.inputLayer1Index = this.layers.indexOf(
          layer.inputLayer1 as ILayer
        );
        jsonLayer.inputLayer2Index = this.layers.indexOf(
          layer.inputLayer2 as ILayer
        );
      }
      jsonLayers.push(jsonLayer);
    }

    return {
      type: this.constructor.name,
      sizes:
        this.options.sizes ??
        [this._inputLayer.height]
          .concat(this._hiddenLayers.map((l) => l.height))
          .concat([this._outputLayer.height]),
      outputLayerIndex: this.layers.indexOf(this._outputLayer),
      layers: jsonLayers as ILayerJSON[],
      inputLayerIndex: this.layers.indexOf(this._inputLayer),
    };
  }

  static fromJSON(
    json: IFeedForwardJSON,
    getLayer?: (
      layerJson: ILayerJSON,
      inputLayer1?: ILayer,
      inputLayer2?: ILayer
    ) => ILayer
  ): FeedForward {
    const jsonLayers = json.layers;
    const layers: ILayer[] = [];
    const inputLayer = getLayer
      ? layerFromJSON(jsonLayers[0]) ?? getLayer(jsonLayers[0])
      : layerFromJSON(jsonLayers[0]);

    if (!inputLayer) throw new Error('unable to find layer');

    layers.push(inputLayer);

    for (let i = 1; i < jsonLayers.length; i++) {
      const jsonLayer = jsonLayers[i];
      if (
        typeof jsonLayer.inputLayerIndex === 'undefined' &&
        typeof jsonLayer.inputLayer1Index === 'undefined' &&
        typeof jsonLayer.inputLayer2Index === 'undefined'
      ) {
        const layer = getLayer
          ? layerFromJSON(jsonLayer) ?? getLayer(jsonLayer)
          : layerFromJSON(jsonLayer);
        if (!layer) throw new Error('unable to find layer');
        layers.push(layer);
      } else if (typeof jsonLayer.inputLayerIndex === 'number') {
        const inputLayer = layers[jsonLayer.inputLayerIndex];
        if (!inputLayer) {
          throw new Error('inputLayer1 not found');
        }
        const layer = getLayer
          ? layerFromJSON(jsonLayer, inputLayer) ??
            getLayer(jsonLayer, inputLayer)
          : layerFromJSON(jsonLayer, inputLayer);
        if (!layer) throw new Error('unable to find layer');
        layers.push(layer);
      } else {
        if (typeof jsonLayer.inputLayer1Index !== 'number') {
          throw new Error(
            'Cannot create network from provided JSON. inputLayer1Index not defined.'
          );
        }
        if (typeof jsonLayer.inputLayer2Index !== 'number') {
          throw new Error(
            'Cannot create network from provided JSON. inputLayer2Index not defined.'
          );
        }
        const inputLayer1 = layers[jsonLayer.inputLayer1Index];
        const inputLayer2 = layers[jsonLayer.inputLayer2Index];

        if (inputLayer1 === undefined)
          throw new Error(
            `Cannot create network from provided JSON. layer of index ${jsonLayer.inputLayer1Index} not found.`
          );
        if (inputLayer2 === undefined)
          throw new Error(
            `Cannot create network from provided JSON. layer of index ${jsonLayer.inputLayer2Index} not found.`
          );

        const layer = getLayer
          ? layerFromJSON(jsonLayer, inputLayer1, inputLayer2) ??
            getLayer(jsonLayer, inputLayer1, inputLayer2)
          : layerFromJSON(jsonLayer, inputLayer1, inputLayer2);

        if (!layer) throw new Error('unable to find layer');
        layers.push(layer);
      }
    }

    return new this({ ...json, layers });
  }

  /**
   *
   * @returns {Function}
   */
  toFunction(): void {
    throw new Error(
      `${this.constructor.name}-toFunction is not yet implemented`
    );
  }
}
