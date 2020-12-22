import { IMatrixJSON, Matrix } from './matrix';
import { RandomMatrix } from './matrix/random-matrix';
import { Equation } from './matrix/equation';
import {
  RNN,
  defaults as rnnDefaults,
  trainDefaults as rnnTrainDefaults,
  IRNNOptions,
  IRNNStatus,
  IRNNTrainingOptions,
  last,
  IRNNHiddenLayerModel,
} from './rnn';
import { zeros } from '../utilities/zeros';
import { softmax } from './matrix/softmax';
import { randomFloat } from '../utilities/random';
import { sampleI } from './matrix/sample-i';
import { maxI } from './matrix/max-i';
import {
  FormattableData,
  InputOutputValue,
  INumberHash,
  INumberObject,
  ITrainingDatum,
  lookup,
} from '../lookup';
import { LookupTable } from '../utilities/lookup-table';
import { ArrayLookupTable } from '../utilities/array-lookup-table';
import {
  arraysToFloat32Arrays,
  arrayToFloat32Arrays,
  objectToFloat32Arrays,
  objectToFloat32Array,
  inputOutputArraysToFloat32Arrays,
  inputOutputObjectToFloat32Arrays,
  inputOutputArrayToFloat32Arrays,
  inputOutputObjectsToFloat32Arrays,
} from '../utilities/cast';

export type ValuesOf<
  T extends InputOutputValue | InputOutputValue[]
> = T[number];

export interface IRNNTimeStepOptions extends IRNNTimeStepJSONOptions {
  inputSize: number;
  inputRange: number;
  hiddenLayers: number[];
  outputSize: number;
  decayRate: number;
  smoothEps: number;
  regc: number;
  clipval: number;
  maxPredictionLength: number;
  json?: IRNNTimeStepJSON;
}

export interface IRNNTimeStepJSONOptions {
  inputSize: number;
  inputRange: number;
  hiddenLayers: number[];
  outputSize: number;
  decayRate: number;
  smoothEps: number;
  regc: number;
  clipval: number;
  maxPredictionLength: number;
}

export interface IRNNTimeStepJSON {
  type: string;
  options: IRNNTimeStepJSONOptions;
  hiddenLayers: Array<{ [index: string]: IMatrixJSON }>;
  outputConnector: IMatrixJSON;
  output: IMatrixJSON;
  inputLookup: INumberHash | null;
  inputLookupLength: number;
  outputLookup: INumberHash | null;
  outputLookupLength: number;
}

export interface IMisclass {
  value: FormattableData;
  actual: FormattableData;
}

export interface ITestResults {
  misclasses: IMisclass[];
  error: number;
  total: number;
}

export interface ILinkedInputOutput<InputT, OutputT> {
  input: InputT;
  output: OutputT;
}

export interface IRNNTimeStepModel {
  isInitialized: boolean;
  hiddenLayers: IRNNHiddenLayerModel[];
  output: Matrix;
  equations: Equation[];
  allMatrices: Matrix[];
  equationConnections: Matrix[][];
  outputConnector: RandomMatrix | Matrix;
}

export const defaults: IRNNOptions = {
  ...rnnDefaults,
  inputSize: 1,
  hiddenLayers: [20],
  outputSize: 1,
  inputRange: 0,
};

export class RNNTimeStep extends RNN {
  inputSize = 1;
  outputSize = 1;
  inputLookupLength = 0;
  inputLookup: INumberHash | null = null;
  outputLookup: INumberHash | null = null;
  outputLookupLength = 0;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  model: IRNNTimeStepModel = Object.seal({
    isInitialized: false,
    hiddenLayers: [],
    output: new Matrix(0, 0),
    equations: [],
    allMatrices: [],
    equationConnections: [],
    outputConnector: new RandomMatrix(0, 0, 0.08),
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  options: IRNNTimeStepOptions = { ...defaults };
  constructor(options: Partial<IRNNTimeStepOptions> = {}) {
    super();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.options = { ...defaults, ...options };
    this.updateTrainingOptions({
      ...trainDefaults,
      ...options,
    });

    if (options.json) {
      this.fromJSON(options.json);
    }
  }

  createInputMatrix(): RandomMatrix {
    throw new Error('Input Matrices do not exist on RNNTimeStep');
  }

  createOutputMatrices(): { outputConnector: RandomMatrix; output: Matrix } {
    const { outputSize } = this.options;
    const lastHiddenSize = last(this.options.hiddenLayers);

    // whd
    const outputConnector = new RandomMatrix(outputSize, lastHiddenSize, 0.08);
    // bd
    const output = new RandomMatrix(outputSize, 1, 0.08);
    return { output, outputConnector };
  }

  bindEquation(): void {
    const { model, options } = this;
    const { hiddenLayers, inputSize } = options;
    const layers = model.hiddenLayers;
    const equation = new Equation();
    const outputs = [];
    const equationConnection =
      model.equationConnections.length > 0
        ? model.equationConnections[model.equationConnections.length - 1]
        : this.initialLayerInputs;
    // 0 index
    let output = this.getEquation(
      equation,
      equation.input(new Matrix(inputSize, 1)),
      equationConnection[0],
      layers[0]
    );
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenLayers.length; i < max; i++) {
      output = this.getEquation(
        equation,
        output,
        equationConnection[i],
        layers[i]
      );
      outputs.push(output);
    }

    model.equationConnections.push(outputs);
    equation.add(
      equation.multiply(model.outputConnector, output),
      model.output
    );
    model.equations.push(equation);
  }

  initialize(): void {
    this.model = this.mapModel();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  mapModel(): IRNNTimeStepModel {
    const allMatrices: Matrix[] = [];
    this.initialLayerInputs = this.options.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );

    const hiddenLayers = this.createHiddenLayers();
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      const hiddenMatrix = hiddenLayers[i];
      for (const property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    const { outputConnector, output } = this.createOutputMatrices();

    allMatrices.push(outputConnector);
    allMatrices.push(output);
    return Object.seal({
      isInitialized: true,
      hiddenLayers,
      output,
      equations: [],
      allMatrices,
      equationConnections: [],
      outputConnector,
    });
  }

  backpropagate(): void {
    for (let i = this.model.equations.length - 1; i > -1; i--) {
      this.model.equations[i].backpropagate();
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  run<InputType extends InputOutputValue | InputOutputValue[]>(
    rawInput: InputType
  ): ValuesOf<InputType> {
    const shape = lookup.dataShape(rawInput).join(',');
    switch (shape) {
      case 'array,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.runArray(rawInput as Float32Array);
      case 'object,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.runObject(rawInput as INumberHash);
      case 'array,array,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.runArrayOfArray(rawInput as Float32Array[]);
      case 'array,object,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.runArrayOfObject(rawInput as INumberHash[]);
      default:
        throw new Error(`Unrecognized data shape ${shape}`);
    }
  }

  forecast<InputType extends InputOutputValue | InputOutputValue[]>(
    rawInput: InputType,
    count = 1
  ): InputType {
    const shape = lookup.dataShape(rawInput).join(',');
    switch (shape) {
      case 'array,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.forecastNumbers(rawInput as Float32Array, count);
      case 'array,array,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.forecastArrays(rawInput as Float32Array[], count);
      case 'array,object,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.forecastObjects(rawInput as INumberHash[], count);
      case 'object,number':
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return this.runObject(rawInput as INumberHash);
      default:
        throw new Error(`Unrecognized data shape ${shape}`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  train(
    data: FormattableData,
    trainOpts: Partial<IRNNTrainingOptions> = {}
  ): IRNNStatus {
    this.trainOpts = trainOpts = {
      ...rnnTrainDefaults,
      ...trainOpts,
    };
    const {
      iterations,
      errorThresh,
      logPeriod,
      callback,
      callbackPeriod,
    } = this.trainOpts;
    const log = trainOpts.log === true ? console.log : trainOpts.log;

    if (this.inputSize === 1 || !this.inputSize) {
      this.setSize(data);
    }

    const formattedData = this.formatData(data);
    let error = Infinity;
    let i;

    this.verifyIsInitialized();

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < formattedData.length; j++) {
        const err = trainPattern(this, formattedData[j], true);
        sum += err;
      }
      error = sum / formattedData.length;

      if (isNaN(error))
        throw new Error(
          'Network error rate is unexpected NaN, check network configurations and try again. Most probably input format is not correct or training data is not enough. '
        );
      if (log && i % logPeriod === 0) {
        log(`iterations: ${i}, training error: ${error}`);
      }
      if (callback && i % callbackPeriod === 0) {
        callback({ error, iterations: i });
      }
    }

    return {
      error,
      iterations: i,
    };
  }

  setSize(data: FormattableData): void {
    const dataShape = lookup.dataShape(data).join(',');
    switch (dataShape) {
      case 'array,array,number':
      case 'array,object,number':
      case 'array,datum,array,number':
      case 'array,datum,object,number':
        this.inputSize = this.outputSize = 1;
        // probably 1
        break;
      case 'array,array,array,number':
        this.inputSize = this.outputSize = (data as number[][][])[0][0].length;
        break;
      case 'array,array,object,number':
        this.inputSize = this.outputSize = Object.keys(
          lookup.toTable2D(data as INumberHash[][])
        ).length;
        break;
      case 'array,datum,array,array,number':
        this.inputSize = this.outputSize = ((data as unknown) as Array<{
          [key: string]: number[][];
        }>)[0].input[0].length;
        break;
      case 'array,datum,array,object,number':
        this.inputSize = Object.keys(
          lookup.toInputTable2D(
            data as Array<{ input: Array<{ [key: string]: number }> }>
          )
        ).length;
        this.outputSize = Object.keys(
          lookup.toOutputTable2D(
            data as Array<{ output: Array<{ [key: string]: number }> }>
          )
        ).length;
        break;
      default:
        throw new Error('unknown data shape or configuration');
    }
  }

  // trainNumbers(input: Float32Array): number {
  //   const { model } = this;
  //   const { equations } = model;
  //   while (equations.length < input.length) {
  //     this.bindEquation();
  //   }
  //   let errorSum = 0;
  //   for (let i = 0, max = input.length - 1; i < max; i++) {
  //     errorSum += equations[i].predictTarget(
  //       Float32Array.from([input[i]]),
  //       Float32Array.from([input[i + 1]])
  //     );
  //   }
  //   this.end();
  //   return errorSum / input.length;
  // }

  runNumbersObject(input: INumberObject): number {
    if (!this.inputLookup) {
      throw new Error('this.inputLookup not set');
    }
    return this.runArray(
      lookup.toArray(this.inputLookup, input, this.inputLookupLength)
    );
  }

  runArray(input: Float32Array): number {
    this.checkRunnable();
    const { equations } = this.model;
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[i].runInput(new Float32Array([input[i]]));
    }
    this.end();
    return (lastOutput as Matrix).weights[0];
  }

  forecastNumbers(input: Float32Array, count = 1): Float32Array {
    this.checkRunnable();
    const { model } = this;
    const { equations } = model;
    const length = input.length + count;
    while (equations.length <= length) {
      this.bindEquation();
    }
    let lastOutput;
    let equationIndex = 0;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[equationIndex++].runInput(
        Float32Array.from([input[i]])
      );
    }
    if (!lastOutput) {
      throw new Error('lastOutput not set');
    }
    const result = [lastOutput.weights[0]];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(lastOutput.weights[0]);
    }
    this.end();
    return Float32Array.from(result);
  }

  runObject(input: INumberObject): INumberObject {
    if (!this.inputLookup) {
      throw new Error('this.inputLookup not set');
    }
    if (!this.outputLookup) {
      throw new Error('this.outputLookup not set');
    }
    if (!this.outputLookupLength) {
      throw new Error('this.outputLookupLength not set');
    }
    if (this.inputLookup === this.outputLookup) {
      const inputArray = lookup.toArrayShort(this.inputLookup, input);
      return lookup.toObjectPartial(
        this.outputLookup,
        this.forecastNumbers(
          inputArray,
          this.outputLookupLength - inputArray.length
        ),
        inputArray.length
      );
    }
    return lookup.toObject(
      this.outputLookup,
      this.forecastNumbers(
        lookup.toArray(this.inputLookup, input, this.inputLookupLength),
        this.outputLookupLength
      )
    );
  }

  runArrayOfObject(input: INumberObject[]): INumberObject {
    if (this.inputLookup === null) {
      throw new Error('this.inputLookup not set');
    }
    if (this.outputLookup === null) {
      throw new Error('this.outputLookup not set');
    }
    const formattedInput = input.map((value) =>
      lookup.toArray(
        this.inputLookup as INumberHash,
        value,
        this.inputLookupLength
      )
    );
    return this.forecastArrays(formattedInput, 1).map((value) =>
      lookup.toObject(this.outputLookup as INumberHash, value)
    )[0];
  }

  forecastObjects(input: INumberHash[], count = 1): INumberHash[] {
    if (!this.inputLookup) {
      throw new Error('this.inputLookup not set');
    }
    if (!this.outputLookup) {
      throw new Error('this.outputLookup not set');
    }
    const formattedData = input.map((value) =>
      lookup.toArray(
        this.inputLookup as INumberHash,
        value,
        this.inputLookupLength
      )
    );
    return this.forecastArrays(formattedData, count).map((value) =>
      lookup.toObject(this.outputLookup as INumberHash, value)
    );
  }

  // trainInputOutput(object: {
  //   input: Float32Array[];
  //   output: Float32Array[];
  // }): number {
  //   const { model } = this;
  //   const { input } = object;
  //   const { output } = object;
  //   const totalSize = input.length + output.length;
  //   const { equations } = model;
  //   while (equations.length < totalSize) {
  //     this.bindEquation();
  //   }
  //   let errorSum = 0;
  //   let equationIndex = 0;
  //   for (
  //     let inputIndex = 0, max = input.length - 1;
  //     inputIndex < max;
  //     inputIndex++
  //   ) {
  //     errorSum += equations[equationIndex++].predictTarget(
  //       input[inputIndex],
  //       input[inputIndex + 1]
  //     );
  //   }
  //   errorSum += equations[equationIndex++].predictTarget(
  //     input[input.length - 1],
  //     output[0]
  //   );
  //   for (
  //     let outputIndex = 0, max = output.length - 1;
  //     outputIndex < max;
  //     outputIndex++
  //   ) {
  //     errorSum += equations[equationIndex++].predictTarget(
  //       output[outputIndex],
  //       output[outputIndex + 1]
  //     );
  //   }
  //   this.end();
  //   return errorSum / totalSize;
  // }

  trainArrays(input: Float32Array[]): number {
    const { equations } = this.model;
    while (equations.length < input.length) {
      this.bindEquation();
    }
    let errorSum = 0;
    for (let i = 0, max = input.length - 1; i < max; i++) {
      errorSum += equations[i].predictTarget(input[i], input[i + 1]);
    }
    this.end();
    return errorSum / input.length;
  }

  runArrayOfObjects(input: INumberHash[]): INumberHash {
    if (!this.inputLookup) {
      throw new Error('this.inputLookup not set');
    }
    if (!this.outputLookup) {
      throw new Error('this.outputLookup not set');
    }
    return lookup.toObject(
      this.outputLookup,
      this.runArrayOfArray(
        lookup.toArrays(this.inputLookup, input, this.inputLookupLength)
      )
    );
  }

  runArrayOfArray(input: Float32Array[]): Float32Array {
    if (!this.isRunnable) {
      throw new Error('Network not runnable');
    }
    const { model } = this;
    const { equations } = model;
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      const outputMatrix = equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights;
    }
    this.end();
    return lastOutput ?? Float32Array.from([]);
  }

  forecastArrays(input: Float32Array[], count = 1): Float32Array[] {
    this.checkRunnable();
    const { model } = this;
    const { equations } = model;
    const length = input.length + count;
    while (equations.length <= length) {
      this.bindEquation();
    }
    let lastOutput;
    let equationIndex = 0;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[equationIndex++].runInput(input[i]);
    }
    if (!lastOutput) {
      throw new Error('lastOutput not set');
    }
    const result = [Float32Array.from(lastOutput.weights)];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(Float32Array.from(lastOutput.weights.slice(0)));
    }
    this.end();
    return result;
  }

  end(): void {
    this.model.equations[this.model.equations.length - 1].runInput(
      new Float32Array(this.outputSize)
    );
  }

  requireInputOutputOfOne(): void {
    if (this.inputSize !== 1) {
      throw new Error('inputSize must be 1 for this data size');
    }
    if (this.outputSize !== 1) {
      throw new Error('outputSize must be 1 for this data size');
    }
  }

  // Handles data shape of 'array,number'
  formatArray(data: number[]): Float32Array[][] {
    const result = [];
    this.requireInputOutputOfOne();
    for (let i = 0; i < data.length; i++) {
      result.push(Float32Array.from([data[i]]));
    }
    return [result];
  }

  // Handles data shape of 'array,array,number'
  formatArrayOfArray(data: number[][]): Float32Array[][] {
    const result = [];
    if (this.inputSize === 1 && this.outputSize === 1) {
      for (let i = 0; i < data.length; i++) {
        result.push(arrayToFloat32Arrays(data[i]));
      }
      return result;
    }
    if (this.inputSize !== data[0].length) {
      throw new Error('inputSize must match data input size');
    }
    if (this.outputSize !== data[0].length) {
      throw new Error('outputSize must match data input size');
    }
    for (let i = 0; i < data.length; i++) {
      result.push(Float32Array.from(data[i]));
    }
    return [result];
  }

  // Handles data shape of 'array,object,number'
  formatArrayOfObject(data: INumberObject[]): Float32Array[][] {
    this.requireInputOutputOfOne();
    if (!this.inputLookup) {
      const lookupTable = new LookupTable(data);
      this.inputLookup = this.outputLookup = lookupTable.table;
      this.inputLookupLength = this.outputLookupLength = lookupTable.length;
    }
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(objectToFloat32Arrays(data[i]));
    }
    return result;
  }

  // Handles data shape of 'array,datum,array,number'
  formatArrayOfDatumOfArray(data: ITrainingDatum[]): Float32Array[][] {
    const result = [];
    this.requireInputOutputOfOne();
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      result.push(
        inputOutputArrayToFloat32Arrays(
          datum.input as number[],
          datum.output as number[]
        )
      );
    }
    return result;
  }

  // Handles data shape of 'array,datum,object,number'
  formatArrayOfDatumOfObject(data: ITrainingDatum[]): Float32Array[][] {
    this.requireInputOutputOfOne();
    if (!this.inputLookup) {
      const inputLookup = new LookupTable(data, 'input');
      this.inputLookup = inputLookup.table;
      this.inputLookupLength = inputLookup.length;
    }
    if (!this.outputLookup) {
      const outputLookup = new LookupTable(data, 'output');
      this.outputLookup = outputLookup.table;
      this.outputLookupLength = outputLookup.length;
    }
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      result.push(
        inputOutputObjectToFloat32Arrays(
          datum.input as INumberObject,
          datum.output as INumberObject
        )
      );
    }
    return result;
  }

  // Handles data shape of 'array,array,array,number'
  formatArrayOfArrayOfArray(data: number[][][]): Float32Array[][] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      result.push(arraysToFloat32Arrays(data[i]));
    }
    return result;
  }

  // Handles data shape of 'array,array,object,number'
  formatArrayOfArrayOfObject(data: INumberObject[][]): Float32Array[][] {
    if (!this.inputLookup) {
      const lookupTable = new LookupTable(data);
      this.inputLookup = this.outputLookup = lookupTable.table;
      this.inputLookupLength = this.outputLookupLength = lookupTable.length;
    }
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const array = [];
      for (let j = 0; j < data[i].length; j++) {
        array.push(
          objectToFloat32Array(
            data[i][j],
            this.inputLookup,
            this.inputLookupLength
          )
        );
      }
      result.push(array);
    }
    return result;
  }

  // Handles data shape of 'array,datum,array,array,number'
  formatArrayOfDatumOfArrayOfArray(data: ITrainingDatum[]): Float32Array[][] {
    const result = [];
    if (this.inputSize === 1 && this.outputSize === 1) {
      for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        result.push(
          inputOutputArrayToFloat32Arrays(
            datum.input as number[],
            datum.output as number[]
          )
        );
      }
    } else {
      if (this.inputSize !== (data[0].input as InputOutputValue[])[0].length) {
        throw new Error('inputSize must match data input size');
      }
      if (
        this.outputSize !== (data[0].output as InputOutputValue[])[0].length
      ) {
        throw new Error('outputSize must match data output size');
      }
      const result = [];
      for (let i = 0; i < data.length; i++) {
        const datum = data[i];
        result.push(
          inputOutputArraysToFloat32Arrays(
            datum.input as number[][],
            datum.output as number[][]
          )
        );
      }
    }
    return result;
  }

  // 'Handles data shape of array,datum,array,object,number'
  formatArrayOfDatumOfArrayOfObject(
    data: Array<{
      input: Array<Record<string, number>>;
      output: Array<Record<string, number>>;
    }>
  ): Float32Array[][] {
    if (!this.inputLookup) {
      const inputLookup = new ArrayLookupTable(data, 'input');
      this.inputLookup = inputLookup.table;
      this.inputLookupLength = inputLookup.length;
    }
    if (!this.outputLookup) {
      const outputLookup = new ArrayLookupTable(data, 'output');
      this.outputLookup = outputLookup.table;
      this.outputLookupLength = outputLookup.length;
    }
    if (!this.outputLookupLength) {
      throw new Error('this.outputLookupLength not set to usable number');
    }
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      result.push(
        inputOutputObjectsToFloat32Arrays(
          datum.input,
          datum.output,
          this.inputLookup,
          this.outputLookup,
          this.inputLookupLength,
          this.outputLookupLength
        )
      );
    }
    return result;
  }

  formatData(data: FormattableData): Float32Array[][] {
    const dataShape = lookup.dataShape(data).join(',');
    switch (dataShape) {
      case 'array,number':
        return this.formatArray(data as number[]);
      case 'array,array,number':
        return this.formatArrayOfArray(data as number[][]);
      case 'array,object,number':
        return this.formatArrayOfObject(data as INumberObject[]);
      case 'array,datum,array,number':
        return this.formatArrayOfDatumOfArray(data as ITrainingDatum[]);
      case 'array,datum,object,number':
        return this.formatArrayOfDatumOfObject(data as ITrainingDatum[]);
      case 'array,array,array,number':
        return this.formatArrayOfArrayOfArray(data as number[][][]);
      case 'array,array,object,number':
        return this.formatArrayOfArrayOfObject(data as INumberObject[][]);
      case 'array,datum,array,array,number':
        return this.formatArrayOfDatumOfArrayOfArray(data as ITrainingDatum[]);
      case 'array,datum,array,object,number':
        return this.formatArrayOfDatumOfArrayOfObject(
          data as Array<{
            input: Array<Record<string, number>>;
            output: Array<Record<string, number>>;
          }>
        );
      default:
        throw new Error('unknown data shape or configuration');
    }
  }

  // For handling 'array,array,number'
  // testArrayOfArray(data: number[][]): ITestResults {
  //   if (this.inputSize !== 1) {
  //     throw new Error('unknown data shape or configuration');
  //   }
  //   const misclasses = [];
  //   let errorSum = 0;
  //   const formattedData = this.formatArrayOfArray(data);
  //   for (let i = 0; i < formattedData.length; i++) {
  //     const input = formattedData[i];
  //     const output = this.runArrayOfArray(input.splice(0, input.length - 1))[0];
  //     const target = input[input.length - 1][0];
  //     const error = target - output;
  //     const errorMSE = error * error;
  //     errorSum += errorMSE;
  //     const errorsAbs = Math.abs(errorMSE);
  //     if (errorsAbs > this.trainOpts.errorThresh) {
  //       const misclass = data[i];
  //       Object.assign(misclass, {
  //         value: input,
  //         actual: output,
  //       });
  //       misclasses.push(misclass);
  //     }
  //   }
  //   return {
  //     error: errorSum / formattedData.length,
  //     misclasses,
  //     total: formattedData.length,
  //   };
  // }

  // For handling 'array,array,array,number'
  // testArrayOfArrayOfArray(data: number[][][]): ITestResults {
  //   const misclasses = [];
  //   let errorSum = 0;
  //   const formattedData = this.formatArrayOfArrayOfArray(data);
  //   for (let i = 0; i < formattedData.length; i++) {
  //     const input = formattedData[i];
  //     const output = this.run(input.splice(0, input.length - 1));
  //     const target = input[input.length - 1];
  //     let errors = 0;
  //     let errorCount = 0;
  //     for (let j = 0; j < output.length; j++) {
  //       errorCount++;
  //       const error = target[j] - output[j];
  //       // mse
  //       errors += error * error;
  //     }
  //     errorSum += errors / errorCount;
  //     const errorsAbs = Math.abs(errors);
  //     if (errorsAbs > this.trainOpts.errorThresh) {
  //       const misclass = data[i];
  //       misclasses.push({
  //         value: misclass,
  //         actual: output,
  //       });
  //     }
  //   }
  //   return {
  //     error: errorSum / formattedData.length,
  //     misclasses,
  //     total: formattedData.length,
  //   };
  // }

  test(data: FormattableData): ITestResults {
    // for classification problems
    const misclasses = [];
    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let errorSum = 0;
    const formattedData = this.formatData(data);
    for (let i = 0; i < formattedData.length; i++) {
      const input = formattedData[i];
      const output = this.run(input.splice(0, input.length - 1));
      const target = input[input.length - 1];
      let errors = 0;
      let errorCount = 0;
      for (let j = 0; j < output.length; j++) {
        errorCount++;
        const error = target[j] - output[j];
        // mse
        errors += error * error;
      }
      errorSum += errors / errorCount;
      const errorsAbs = Math.abs(errors);
      if (errorsAbs > this.trainOpts.errorThresh) {
        const misclass = (data as number[][][])[i];
        misclasses.push({
          value: misclass,
          actual: output,
        });
      }
    }
    return {
      error: errorSum / formattedData.length,
      misclasses,
      total: formattedData.length,
    };
  }

  // addFormat(value) {
  //   const dataShape = lookup.dataShape(value).join(',');
  //   switch (dataShape) {
  //     case 'array,array,number':
  //     case 'datum,array,array,number':
  //     case 'array,number':
  //     case 'datum,array,number':
  //       return;
  //     case 'datum,object,number': {
  //       this.inputLookup = lookup.addKeys(value.input, this.inputLookup);
  //       if (this.inputLookup) {
  //         this.inputLookupLength = Object.keys(this.inputLookup).length;
  //       }
  //       this.outputLookup = lookup.addKeys(value.output, this.outputLookup);
  //       if (this.outputLookup) {
  //         this.outputLookupLength = Object.keys(this.outputLookup).length;
  //       }
  //       break;
  //     }
  //     case 'object,number': {
  //       if (!this.inputLookup) {
  //         throw new Error('this.inputLookup not set');
  //       }
  //       this.inputLookup = this.outputLookup = lookup.addKeys(
  //         value,
  //         this.inputLookup
  //       );
  //       if (this.inputLookup) {
  //         this.inputLookupLength = this.outputLookupLength = Object.keys(
  //           this.inputLookup
  //         ).length;
  //       }
  //       break;
  //     }
  //     case 'array,object,number': {
  //       for (let i = 0; i < value.length; i++) {
  //         this.inputLookup = this.outputLookup = lookup.addKeys(
  //           value[i],
  //           this.inputLookup
  //         );
  //         if (this.inputLookup) {
  //           this.inputLookupLength = this.outputLookupLength = Object.keys(
  //             this.inputLookup
  //           ).length;
  //         }
  //       }
  //       break;
  //     }
  //     case 'datum,array,object,number': {
  //       for (let i = 0; i < value.input.length; i++) {
  //         this.inputLookup = lookup.addKeys(value.input[i], this.inputLookup);
  //         if (this.inputLookup) {
  //           this.inputLookupLength = Object.keys(this.inputLookup).length;
  //         }
  //       }
  //       for (let i = 0; i < value.output.length; i++) {
  //         this.outputLookup = lookup.addKeys(
  //           value.output[i],
  //           this.outputLookup
  //         );
  //         if (this.outputLookup) {
  //           this.outputLookupLength = Object.keys(this.outputLookup).length;
  //         }
  //       }
  //       break;
  //     }
  //
  //     default:
  //       throw new Error('unknown data shape or configuration');
  //   }
  // }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  toJSON(): IRNNTimeStepJSON {
    if (!this.model) {
      this.initialize();
    }
    const { model } = this;
    const options = { ...this.options, ...rnnDefaults };

    return {
      type: this.constructor.name,
      options,
      hiddenLayers: model.hiddenLayers.map((hiddenLayer) => {
        const layers: { [index: string]: IMatrixJSON } = {};
        for (const p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: model.outputConnector.toJSON(),
      output: model.output.toJSON(),
      inputLookup: this.inputLookup,
      inputLookupLength: this.inputLookupLength,
      outputLookup: this.outputLookup,
      outputLookupLength: this.outputLookupLength,
    };
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  fromJSON(json: IRNNTimeStepJSON): void {
    const { options } = json;
    const allMatrices = [];
    const hiddenLayers: IRNNHiddenLayerModel[] = [];

    // backward compatibility for hiddenSizes
    json.hiddenLayers.forEach((hiddenLayer) => {
      const layers: { [index: string]: Matrix } = {};
      for (const p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      hiddenLayers.push(layers as IRNNHiddenLayerModel);
    });

    const outputConnector = Matrix.fromJSON(json.outputConnector);
    allMatrices.push(outputConnector);
    const output = Matrix.fromJSON(json.output);
    allMatrices.push(output);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    this.options = { ...defaults, ...options };
    this.inputLookup = json.inputLookup;
    this.inputLookupLength = json.inputLookupLength;
    this.outputLookup = json.outputLookup;
    this.outputLookupLength = json.outputLookupLength;

    this.model = Object.seal({
      isInitialized: true,
      hiddenLayers,
      output,
      allMatrices,
      outputConnector,
      equations: [],
      equationConnections: [],
    });
    this.initialLayerInputs = options.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );
    this.bindEquation();
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  toFunction(cb?: (src: string) => string): RNNTimeStepFunction {
    const {
      model,
      inputSize,
      inputLookup,
      inputLookupLength,
      outputLookup,
      outputLookupLength,
    } = this;
    const { equations } = model;
    const equation = equations[1];
    const { states } = equation;
    const jsonString = JSON.stringify(this.toJSON());

    function previousConnectionIndex(m: Matrix) {
      const connection = model.equationConnections[0];
      const { states } = equations[0];
      for (let i = 0, max = states.length; i < max; i++) {
        if (states[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixOrigin(m: Matrix, stateIndex: number): string {
      for (let i = 0, max = states.length; i < max; i++) {
        const state = states[i];

        if (i === stateIndex) {
          const j = previousConnectionIndex(m);
          switch (m) {
            case state.left:
              if (j > -1) {
                return `typeof prevStates[${j}] === 'object' ? prevStates[${j}].product : new Matrix(${m.rows}, ${m.columns})`;
              }
            // eslint-disable-next-line no-fallthrough
            case state.right:
              if (j > -1) {
                return `typeof prevStates[${j}] === 'object' ? prevStates[${j}].product : new Matrix(${m.rows}, ${m.columns})`;
              }
            // eslint-disable-next-line no-fallthrough
            case state.product:
              return `new Matrix(${m.rows}, ${m.columns})`;
            default:
              throw Error('unknown state');
          }
        }

        if (m === state.product) return `states[${i}].product`;
        if (m === state.right) return `states[${i}].right`;
        if (m === state.left) return `states[${i}].left`;
      }
      return '';
    }

    function matrixToString(m: Matrix, stateIndex: number): string {
      if (!m || !m.rows || !m.columns) return 'null';
      if (m === model.outputConnector) return `json.outputConnector`;
      if (m === model.output) return `json.output`;

      for (let i = 0, max = model.hiddenLayers.length; i < max; i++) {
        const hiddenLayer = model.hiddenLayers[i];
        for (const p in hiddenLayer) {
          if (!hiddenLayer.hasOwnProperty(p)) continue;
          if (hiddenLayer[p] !== m) continue;
          return `json.hiddenLayers[${i}].${p}`;
        }
      }

      return matrixOrigin(m, stateIndex);
    }

    function formatInputData() {
      if (!inputLookup) return '';
      if (inputSize === 1) {
        if (inputLookup === outputLookup) {
          return `function lookupInput(input) {
            var table = ${JSON.stringify(inputLookup)};
            var result = [];
            for (var p in table) {
              if (!input.hasOwnProperty(p)) break;
              result.push(Float32Array.from([input[p]]));
            }
            return result;
          }`;
        }
        return `function lookupInput(input) {
          var table = ${JSON.stringify(inputLookup)};
          var result = [];
          for (var p in table) {
            result.push(Float32Array.from([input[p]]));
          }
          return result;
        }`;
      }
      return `function lookupInput(rawInputs) {
        var table = ${JSON.stringify(inputLookup)};
        var result = [];
        for (var i = 0; i < rawInputs.length; i++) {
          var rawInput = rawInputs[i];
          var input = new Float32Array(${inputLookupLength});
          for (var p in table) {
            input[table[p]] = rawInput.hasOwnProperty(p) ? rawInput[p] : 0;
          }
          result.push(input);
        }
        return result;
      }`;
    }

    function formatOutputData() {
      if (!outputLookup) return '';
      if (inputSize === 1) {
        if (inputLookup === outputLookup) {
          return `function lookupOutputPartial(output, input) {
            var table = ${JSON.stringify(outputLookup)};
            var offset = input.length;
            var result = {};
            var i = 0;
            for (var p in table) {
              if (i++ < offset) continue;
              result[p] = output[table[p] - offset][0];
            }
            return result;
          }`;
        }
        return `function lookupOutput(output) {
          var table = ${JSON.stringify(outputLookup)};
          var result = {};
          for (var p in table) {
            result[p] = output[table[p]][0];
          }
          return result;
        }`;
      }
      return `function lookupOutput(output) {
        var table = ${JSON.stringify(outputLookup)};
        var result = {};
        for (var p in table) {
          result[p] = output[table[p]];
        }
        return result;
      }`;
    }

    function toInner(fnString: string) {
      // crude, but should be sufficient for now
      // function() { body }
      // crude, but should be sufficient for now
      // function() { body }
      const fnParts = fnString.toString().split('{');
      fnParts.shift();
      // body }
      const fnBodyString = fnParts.join('{');
      const fnBodyParts = fnBodyString.split('}');
      fnBodyParts.pop();
      // body
      return fnBodyParts
        .join('}')
        .split('\n')
        .join('\n        ')
        .replace(
          'product.weights = input.weights = this.inputValue;',
          inputLookup && inputSize === 1
            ? 'product.weights = _i < input.length ? input[_i]: prevStates[prevStates.length - 1].product.weights;'
            : inputSize === 1
            ? 'product.weights = [input[_i]];'
            : 'product.weights = input[_i];'
        )
        .replace('product.deltas[i] = 0;', '')
        .replace('product.deltas[column] = 0;', '')
        .replace('left.deltas[leftIndex] = 0;', '')
        .replace('right.deltas[rightIndex] = 0;', '')
        .replace('product.deltas = left.deltas.slice(0);', '');
    }

    function fileName(fnName: string) {
      return `src/recurrent/matrix/${fnName.replace(/[A-Z]/g, function (value) {
        return `-${value.toLowerCase()}`;
      })}.js`;
    }

    const statesRaw = [];
    const usedFunctionNames: { [methodName: string]: boolean } = {};
    const innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      const state = states[i];
      statesRaw.push(`states[${i}] = {
      name: '${state.forwardFn.name}',
      left: ${state.left ? matrixToString(state.left, i) : 'undefined'},
      right: ${state.right ? matrixToString(state.right, i) : 'undefined'},
      product: ${matrixToString(state.product, i)}
    }`);

      const fnName = state.forwardFn.name;
      if (!usedFunctionNames[fnName]) {
        usedFunctionNames[fnName] = true;
        innerFunctionsSwitch.push(
          `        case '${fnName}':${
            fnName !== 'forwardFn' ? ` //compiled from ${fileName(fnName)}` : ''
          }
          ${toInner(state.forwardFn.toString())}
          break;`
        );
      }
    }

    const forceForecast = this.inputSize === 1 && this.outputLookup;
    const src = `
  var input = ${this.inputLookup ? 'lookupInput(rawInput)' : 'rawInput'};
  var json = ${jsonString};
  var output = [];
  var states = [];
  var prevStates;
  var state;
  var max = ${
    forceForecast
      ? inputLookup === outputLookup
        ? inputLookupLength
        : `input.length + ${outputLookupLength - 1}`
      : 'input.length'
  };
  for (var _i = 0; _i < max; _i++) {
    prevStates = states;
    states = [];
    ${statesRaw.join(';\n    ')};
    for (var stateIndex = 0, stateMax = ${
      statesRaw.length
    }; stateIndex < stateMax; stateIndex++) {
      state = states[stateIndex];
      var product = state.product;
      var left = state.left;
      var right = state.right;

      switch (state.name) {
${innerFunctionsSwitch.join('\n')}
      }
    }
    ${
      inputSize === 1 && inputLookup
        ? 'if (_i >= input.length - 1) { output.push(state.product.weights); }'
        : 'output = state.product.weights;'
    }
  }
  ${
    outputLookup
      ? outputLookup === inputLookup
        ? 'return lookupOutputPartial(output, input)'
        : 'return lookupOutput(output)'
      : inputSize === 1
      ? 'return output[0]'
      : 'return output'
  };
  ${formatInputData()}
  ${formatOutputData()}

  function Matrix(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros(rows * columns);
  }
  ${zeros.toString()}
  ${softmax.toString().replace('_2.default', 'Matrix')}
  ${randomFloat.toString()}
  ${sampleI.toString()}
  ${maxI.toString()}`;
    // eslint-disable-next-line
    return new Function('rawInput', cb ? cb(src) : src) as RNNTimeStepFunction;
  }
}

export function trainPattern(
  net: RNNTimeStep,
  input: Float32Array[],
  logErrorRate?: boolean
): number {
  const error = net.trainArrays(input);
  net.backpropagate();
  net.adjustWeights();

  if (logErrorRate) {
    return error;
  }
  return 0;
}

export type RNNTimeStepFunction = <
  InputType extends InputOutputValue | InputOutputValue[]
>(
  rawInput?: InputType,
  isSampleI?: boolean,
  temperature?: number
) => ValuesOf<InputType>;

export const trainDefaults = { ...rnnTrainDefaults };
