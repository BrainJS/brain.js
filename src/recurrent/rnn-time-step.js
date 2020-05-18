const Matrix = require('./matrix');
const RandomMatrix = require('./matrix/random-matrix');
const Equation = require('./matrix/equation');
const RNN = require('./rnn');
const zeros = require('../utilities/zeros');
const softmax = require('./matrix/softmax');
const { randomFloat } = require('../utilities/random');
const sampleI = require('./matrix/sample-i');
const maxI = require('./matrix/max-i');
const lookup = require('../lookup');
const LookupTable = require('../utilities/lookup-table');
const ArrayLookupTable = require('../utilities/array-lookup-table');
const {
  arraysToFloat32Arrays,
  arrayToFloat32Arrays,
  objectsToFloat32Arrays,
  objectToFloat32Arrays,
  objectToFloat32Array,
} = require('../utilities/cast');

class RNNTimeStep extends RNN {
  // eslint-disable-next-line
  constructor(options) {
    super(options);
  }

  createInputMatrix() {}

  createOutputMatrix() {
    const { model } = this;
    const { outputSize } = this;
    const lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1];

    // whd
    model.outputConnector = new RandomMatrix(outputSize, lastHiddenSize, 0.08);
    // bd
    model.output = new RandomMatrix(outputSize, 1, 0.08);
  }

  bindEquation() {
    const { model } = this;
    const { hiddenLayers } = this;
    const layers = model.hiddenLayers;
    const equation = new Equation();
    const outputs = [];
    const equationConnection =
      model.equationConnections.length > 0
        ? model.equationConnections[model.equationConnections.length - 1]
        : this.initialLayerInputs;
    // 0 index
    let output = this.constructor.getEquation(
      equation,
      equation.input(new Matrix(this.inputSize, 1)),
      equationConnection[0],
      layers[0]
    );
    outputs.push(output);
    // 1+ indices
    for (let i = 1, max = hiddenLayers.length; i < max; i++) {
      output = this.constructor.getEquation(
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

  mapModel() {
    const { model } = this;
    const { hiddenLayers } = model;
    const { allMatrices } = model;
    this.initialLayerInputs = this.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );

    this.createHiddenLayers();
    if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');
    for (let i = 0, max = hiddenLayers.length; i < max; i++) {
      const hiddenMatrix = hiddenLayers[i];
      for (const property in hiddenMatrix) {
        if (!hiddenMatrix.hasOwnProperty(property)) continue;
        allMatrices.push(hiddenMatrix[property]);
      }
    }

    this.createOutputMatrix();
    if (!model.outputConnector)
      throw new Error('net.model.outputConnector not set');
    if (!model.output) throw new Error('net.model.output not set');

    allMatrices.push(model.outputConnector);
    allMatrices.push(model.output);
  }

  backpropagate() {
    for (let i = this.model.equations.length - 1; i > -1; i--) {
      this.model.equations[i].backpropagate();
    }
  }

  /**
   *
   * @param {number[]|number[][]|object|object[][]} [rawInput]
   * @returns {number[]|number|object|object[]|object[][]}
   */
  run(rawInput) {
    if (this.inputSize === 1) {
      if (this.outputLookup) {
        this.run = this.runObject;
        return this.runObject(rawInput);
      }
      this.run = this.runNumbers;
      return this.runNumbers(rawInput);
    }
    if (this.outputLookup) {
      this.run = this.runObjects;
      return this.runObjects(rawInput);
    }
    this.run = this.runArrays;
    return this.runArrays(rawInput);
  }

  forecast(input, count) {
    if (this.inputSize === 1) {
      if (this.outputLookup) {
        this.forecast = this.runObject;
        return this.runObject(input);
      }
      this.forecast = this.forecastNumbers;
      return this.forecastNumbers(input, count);
    }
    if (this.outputLookup) {
      this.forecast = this.forecastObjects;
      return this.forecastObjects(input, count);
    }
    this.forecast = this.forecastArrays;
    return this.forecastArrays(input, count);
  }

  /**
   *
   * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
   * @param {Object} [options]
   * @returns {{error: number, iterations: number}}
   */
  train(data, options = {}) {
    this.trainOpts = options = {
      ...this.constructor.trainDefaults,
      ...options,
    };
    const { iterations } = options;
    const { errorThresh } = options;
    const log = options.log === true ? console.log : options.log;
    const { logPeriod } = options;
    const { callback } = options;
    const { callbackPeriod } = options;

    if (this.inputSize === 1 || !this.inputSize) {
      this.setSize(data);
    }

    data = this.formatData(data);
    let error = Infinity;
    let i;

    this.verifyIsInitialized(data);

    for (i = 0; i < iterations && error > errorThresh; i++) {
      let sum = 0;
      for (let j = 0; j < data.length; j++) {
        const err = this.trainPattern(data[j], true);
        sum += err;
      }
      error = sum / data.length;

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

  /**
   *
   * @param data
   * Verifies network sizes are initialized
   * If they are not it will initialize them based off the data set.
   */
  verifyIsInitialized(data) {
    if (data[0].input) {
      this.trainInput = this.trainInputOutput;
    } else if (data[0].length > 0) {
      if (data[0][0].length > 0) {
        this.trainInput = this.trainArrays;
      } else if (this.inputSize > 1) {
        this.trainInput = this.trainArrays;
      } else {
        this.trainInput = this.trainNumbers;
      }
    }

    if (!this.model) {
      this.initialize();
    }
  }

  setSize(data) {
    const dataShape = lookup.dataShape(data).join(',');
    switch (dataShape) {
      case 'array,array,number':
      case 'array,object,number':
      case 'array,datum,array,number':
      case 'array,datum,object,number':
        // probably 1
        break;
      case 'array,array,array,number':
        this.inputSize = this.outputSize = data[0][0].length;
        break;
      case 'array,array,object,number':
        this.inputSize = this.outputSize = Object.keys(
          lookup.toTable2D(data)
        ).length;
        break;
      case 'array,datum,array,array,number':
        this.inputSize = this.outputSize = data[0].input[0].length;
        break;
      case 'array,datum,array,object,number':
        this.inputSize = Object.keys(lookup.toInputTable2D(data)).length;
        this.outputSize = Object.keys(lookup.toOutputTable2D(data)).length;
        break;
      default:
        throw new Error('unknown data shape or configuration');
    }
  }

  trainNumbers(input) {
    const { model } = this;
    const { equations } = model;
    while (equations.length < input.length) {
      this.bindEquation();
    }
    let errorSum = 0;
    for (let i = 0, max = input.length - 1; i < max; i++) {
      errorSum += equations[i].predictTarget([input[i]], [input[i + 1]]);
    }
    this.end();
    return errorSum / input.length;
  }

  runNumbers(input) {
    if (!this.isRunnable) return null;
    const { model } = this;
    const { equations } = model;
    if (this.inputLookup) {
      input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
    }
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[i].runInput(new Float32Array([input[i]]));
    }
    this.end();
    return lastOutput.weights[0];
  }

  forecastNumbers(input, count) {
    if (!this.isRunnable) return null;
    const { model } = this;
    const { equations } = model;
    const length = input.length + count;
    while (equations.length <= length) {
      this.bindEquation();
    }
    let lastOutput;
    let equationIndex = 0;
    for (let i = 0; i < input.length; i++) {
      lastOutput = equations[equationIndex++].runInput([input[i]]);
    }
    const result = [lastOutput.weights[0]];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(lastOutput.weights[0]);
    }
    this.end();
    return result;
  }

  runObject(input) {
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

  runObjects(input) {
    input = input.map((value) =>
      lookup.toArray(this.inputLookup, value, this.inputLookupLength)
    );
    return this.forecastArrays(input, 1).map((value) =>
      lookup.toObject(this.outputLookup, value)
    )[0];
  }

  forecastObjects(input, count) {
    input = input.map((value) =>
      lookup.toArray(this.inputLookup, value, this.inputLookupLength)
    );
    return this.forecastArrays(input, count).map((value) =>
      lookup.toObject(this.outputLookup, value)
    );
  }

  trainInputOutput(object) {
    const { model } = this;
    const { input } = object;
    const { output } = object;
    const totalSize = input.length + output.length;
    const { equations } = model;
    while (equations.length < totalSize) {
      this.bindEquation();
    }
    let errorSum = 0;
    let equationIndex = 0;
    for (
      let inputIndex = 0, max = input.length - 1;
      inputIndex < max;
      inputIndex++
    ) {
      errorSum += equations[equationIndex++].predictTarget(
        input[inputIndex],
        input[inputIndex + 1]
      );
    }
    errorSum += equations[equationIndex++].predictTarget(
      input[input.length - 1],
      output[0]
    );
    for (
      let outputIndex = 0, max = output.length - 1;
      outputIndex < max;
      outputIndex++
    ) {
      errorSum += equations[equationIndex++].predictTarget(
        output[outputIndex],
        output[outputIndex + 1]
      );
    }
    this.end();
    return errorSum / totalSize;
  }

  trainArrays(input) {
    const { model } = this;
    const { equations } = model;
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

  runArrays(input) {
    if (!this.isRunnable) return null;
    const { model } = this;
    const { equations } = model;
    while (equations.length <= input.length) {
      this.bindEquation();
    }
    if (this.inputLookup) {
      input = lookup.toArrays(this.inputLookup, input, this.inputLookupLength);
    }
    let lastOutput;
    for (let i = 0; i < input.length; i++) {
      const outputMatrix = equations[i].runInput(input[i]);
      lastOutput = outputMatrix.weights;
    }
    this.end();
    if (this.outputLookup) {
      return lookup.toObject(this.outputLookup, lastOutput);
    }
    return lastOutput;
  }

  forecastArrays(input, count) {
    if (!this.isRunnable) return null;
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
    const result = [lastOutput.weights];
    for (let i = 0, max = count - 1; i < max; i++) {
      lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
      result.push(lastOutput.weights.slice(0));
    }
    this.end();
    return result;
  }

  end() {
    this.model.equations[this.model.equations.length - 1].runInput(
      new Float32Array(this.outputSize)
    );
  }

  /**
   *
   * @param data
   * @returns {*}
   */
  formatData(data) {
    const dataShape = lookup.dataShape(data).join(',');
    const result = [];
    switch (dataShape) {
      case 'array,number': {
        if (this.inputSize !== 1) {
          throw new Error('inputSize must be 1 for this data size');
        }
        if (this.outputSize !== 1) {
          throw new Error('outputSize must be 1 for this data size');
        }
        for (let i = 0; i < data.length; i++) {
          result.push(Float32Array.from([data[i]]));
        }
        return [result];
      }
      case 'array,array,number': {
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
      case 'array,object,number': {
        if (this.inputSize !== 1) {
          throw new Error('inputSize must be 1 for this data size');
        }
        if (this.outputSize !== 1) {
          throw new Error('outputSize must be 1 for this data size');
        }
        if (!this.inputLookup) {
          const lookupTable = new LookupTable(data);
          this.inputLookup = this.outputLookup = lookupTable.table;
          this.inputLookupLength = this.outputLookupLength = lookupTable.length;
        }
        for (let i = 0; i < data.length; i++) {
          result.push(objectToFloat32Arrays(data[i]));
        }
        return result;
      }
      case 'array,datum,array,number': {
        if (this.inputSize !== 1) {
          throw new Error('inputSize must be 1 for this data size');
        }
        if (this.outputSize !== 1) {
          throw new Error('outputSize must be 1 for this data size');
        }
        for (let i = 0; i < data.length; i++) {
          const datum = data[i];
          result.push({
            input: arrayToFloat32Arrays(datum.input),
            output: arrayToFloat32Arrays(datum.output),
          });
        }
        return result;
      }
      case 'array,datum,object,number': {
        if (this.inputSize !== 1) {
          throw new Error('inputSize must be 1 for this data size');
        }
        if (this.outputSize !== 1) {
          throw new Error('outputSize must be 1 for this data size');
        }
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
        for (let i = 0; i < data.length; i++) {
          const datum = data[i];
          result.push({
            input: objectToFloat32Arrays(datum.input),
            output: objectToFloat32Arrays(datum.output),
          });
        }
        return result;
      }
      case 'array,array,array,number': {
        for (let i = 0; i < data.length; i++) {
          result.push(arraysToFloat32Arrays(data[i]));
        }
        return result;
      }
      case 'array,array,object,number': {
        if (!this.inputLookup) {
          const lookupTable = new LookupTable(data);
          this.inputLookup = this.outputLookup = lookupTable.table;
          this.inputLookupLength = this.outputLookupLength = lookupTable.length;
        }
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
      case 'array,datum,array,array,number': {
        if (this.inputSize === 1 && this.outputSize === 1) {
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            result.push({
              input: Float32Array.from(datum.input),
              output: Float32Array.from(datum.output),
            });
          }
        } else {
          if (this.inputSize !== data[0].input[0].length) {
            throw new Error('inputSize must match data input size');
          }
          if (this.outputSize !== data[0].output[0].length) {
            throw new Error('outputSize must match data output size');
          }
          for (let i = 0; i < data.length; i++) {
            const datum = data[i];
            result.push({
              input: arraysToFloat32Arrays(datum.input),
              output: arraysToFloat32Arrays(datum.output),
            });
          }
        }
        return result;
      }
      case 'array,datum,array,object,number': {
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
        for (let i = 0; i < data.length; i++) {
          const datum = data[i];
          result.push({
            input: objectsToFloat32Arrays(
              datum.input,
              this.inputLookup,
              this.inputLookupLength
            ),
            output: objectsToFloat32Arrays(
              datum.output,
              this.outputLookup,
              this.outputLookupLength
            ),
          });
        }
        return result;
      }
      default:
        throw new Error('unknown data shape or configuration');
    }
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
  test(data) {
    const formattedData = this.formatData(data);
    // for classification problems
    const misclasses = [];
    // run each pattern through the trained network and collect
    // error and misclassification statistics
    let errorSum = 0;
    const dataShape = lookup.dataShape(data).join(',');
    switch (dataShape) {
      case 'array,array,number': {
        if (this.inputSize === 1) {
          for (let i = 0; i < formattedData.length; i++) {
            const input = formattedData[i];
            const output = this.run(input.splice(0, input.length - 1));
            const target = input[input.length - 1][0];
            const error = target - output;
            const errorMSE = error * error;
            errorSum += errorMSE;
            const errorsAbs = Math.abs(errorMSE);
            if (errorsAbs > this.trainOpts.errorThresh) {
              const misclass = data[i];
              Object.assign(misclass, {
                value: input,
                actual: output,
              });
              misclasses.push(misclass);
            }
          }
          break;
        }
        throw new Error('unknown data shape or configuration');
      }
      case 'array,array,array,number': {
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
            const misclass = data[i];
            misclasses.push({
              value: misclass,
              actual: output,
            });
          }
        }
        break;
      }
      case 'array,object,number': {
        for (let i = 0; i < formattedData.length; i++) {
          const input = formattedData[i];
          const output = this.run(
            lookup.toObjectPartial(
              this.outputLookup,
              input,
              0,
              input.length - 1
            )
          );
          const target = input[input.length - 1];
          let errors = 0;
          let p;
          // for (p in output) {
          // }
          const error = target[i] - output[p];
          // mse
          errors += error * error;
          errorSum += errors;
          const errorsAbs = Math.abs(errors);
          if (errorsAbs > this.trainOpts.errorThresh) {
            const misclass = data[i];
            misclasses.push({
              value: misclass,
              actual: output,
            });
          }
        }
        break;
      }
      case 'array,array,object,number': {
        for (let i = 0; i < formattedData.length; i++) {
          const input = formattedData[i];
          const output = this.run(input.slice(0, input.length - 1));
          const target = data[i][input.length - 1];
          let errors = 0;
          let errorCount = 0;
          for (const p in output) {
            const error = target[p] - output[p];
            // mse
            errors += error * error;
            errorCount++;
          }
          errorSum += errors / errorCount;
          const errorsAbs = Math.abs(errors);
          if (errorsAbs > this.trainOpts.errorThresh) {
            const misclass = data[i];
            misclasses.push({
              value: misclass,
              actual: output,
            });
          }
        }
        break;
      }
      case 'array,datum,array,number':
      case 'array,datum,object,number': {
        for (let i = 0; i < formattedData.length; i++) {
          const datum = formattedData[i];
          const output = this.forecast(datum.input, datum.output.length);
          let errors = 0;
          let errorCount = 0;
          for (let j = 0; j < output.length; j++) {
            const error = datum.output[j][0] - output[j];
            errors += error * error;
            errorCount++;
          }

          errorSum += errors / errorCount;
          const errorsAbs = Math.abs(errors);
          if (errorsAbs > this.trainOpts.errorThresh) {
            const misclass = data[i];
            Object.assign(misclass, {
              actual: this.outputLookup
                ? lookup.toObject(this.outputLookup, output)
                : output,
            });
            misclasses.push(misclass);
          }
        }
        break;
      }
      case 'array,datum,array,array,number': {
        for (let i = 0; i < formattedData.length; i++) {
          const datum = formattedData[i];
          const output = this.forecast(datum.input, datum.output.length);
          let errors = 0;
          for (let j = 0; j < output.length; j++) {
            for (let k = 0; k < output[j].length; k++) {
              const error = datum.output[j][k] - output[j][k];
              errors += error * error;
            }
          }

          errorSum += errors;
          const errorsAbs = Math.abs(errors);
          if (errorsAbs > this.trainOpts.errorThresh) {
            const misclass = data[i];
            misclasses.push({
              input: misclass.input,
              output: misclass.output,
              actual: output,
            });
          }
        }
        break;
      }
      case 'array,datum,array,object,number': {
        for (let i = 0; i < formattedData.length; i++) {
          const datum = formattedData[i];
          const output = this.forecast(datum.input, datum.output.length);
          let errors = 0;
          for (let j = 0; j < output.length; j++) {
            for (const p in output[j]) {
              const error = data[i].output[j][p] - output[j][p];
              errors += error * error;
            }
          }

          errorSum += errors;
          const errorsAbs = Math.abs(errors);
          if (errorsAbs > this.trainOpts.errorThresh) {
            const misclass = data[i];
            misclasses.push({
              input: misclass.input,
              output: misclass.output,
              actual: output,
            });
          }
        }
        break;
      }
      default:
        throw new Error('unknown data shape or configuration');
    }

    return {
      error: errorSum / formattedData.length,
      misclasses,
      total: formattedData.length,
    };
  }

  addFormat(value) {
    const dataShape = lookup.dataShape(value).join(',');
    switch (dataShape) {
      case 'array,array,number':
      case 'datum,array,array,number':
      case 'array,number':
      case 'datum,array,number':
        return;
      case 'datum,object,number': {
        this.inputLookup = lookup.addKeys(value.input, this.inputLookup);
        if (this.inputLookup) {
          this.inputLookupLength = Object.keys(this.inputLookup).length;
        }
        this.outputLookup = lookup.addKeys(value.output, this.outputLookup);
        if (this.outputLookup) {
          this.outputLookupLength = Object.keys(this.outputLookup).length;
        }
        break;
      }
      case 'object,number': {
        this.inputLookup = this.outputLookup = lookup.addKeys(
          value,
          this.inputLookup
        );
        if (this.inputLookup) {
          this.inputLookupLength = this.outputLookupLength = Object.keys(
            this.inputLookup
          ).length;
        }
        break;
      }
      case 'array,object,number': {
        for (let i = 0; i < value.length; i++) {
          this.inputLookup = this.outputLookup = lookup.addKeys(
            value[i],
            this.inputLookup
          );
          if (this.inputLookup) {
            this.inputLookupLength = this.outputLookupLength = Object.keys(
              this.inputLookup
            ).length;
          }
        }
        break;
      }
      case 'datum,array,object,number': {
        for (let i = 0; i < value.input.length; i++) {
          this.inputLookup = lookup.addKeys(value.input[i], this.inputLookup);
          if (this.inputLookup) {
            this.inputLookupLength = Object.keys(this.inputLookup).length;
          }
        }
        for (let i = 0; i < value.output.length; i++) {
          this.outputLookup = lookup.addKeys(
            value.output[i],
            this.outputLookup
          );
          if (this.outputLookup) {
            this.outputLookupLength = Object.keys(this.outputLookup).length;
          }
        }
        break;
      }

      default:
        throw new Error('unknown data shape or configuration');
    }
  }

  /**
   *
   * @returns {Object}
   */
  toJSON() {
    const { defaults } = this.constructor;
    if (!this.model) {
      this.initialize();
    }
    const { model } = this;
    const options = {};
    for (const p in defaults) {
      if (defaults.hasOwnProperty(p)) {
        options[p] = this[p];
      }
    }

    return {
      type: this.constructor.name,
      options,
      hiddenLayers: model.hiddenLayers.map((hiddenLayer) => {
        const layers = {};
        for (const p in hiddenLayer) {
          layers[p] = hiddenLayer[p].toJSON();
        }
        return layers;
      }),
      outputConnector: this.model.outputConnector.toJSON(),
      output: this.model.output.toJSON(),
      inputLookup: this.inputLookup,
      inputLookupLength: this.inputLookupLength,
      outputLookup: this.outputLookup,
      outputLookupLength: this.outputLookupLength,
    };
  }

  fromJSON(json) {
    const { defaults } = this.constructor;
    const { options } = json;
    this.model = null;
    this.hiddenLayers = null;
    const allMatrices = [];
    const hiddenLayers = [];

    // backward compatibility for hiddenSizes
    (json.hiddenLayers || json.hiddenSizes).forEach((hiddenLayer) => {
      const layers = {};
      for (const p in hiddenLayer) {
        layers[p] = Matrix.fromJSON(hiddenLayer[p]);
        allMatrices.push(layers[p]);
      }
      hiddenLayers.push(layers);
    });

    const outputConnector = Matrix.fromJSON(json.outputConnector);
    allMatrices.push(outputConnector);
    const output = Matrix.fromJSON(json.output);
    allMatrices.push(output);

    Object.assign(this, defaults, options);

    // backward compatibility
    if (options.hiddenSizes) {
      this.hiddenLayers = options.hiddenSizes;
    }

    this.inputLookup = json.inputLookup;
    this.inputLookupLength = json.inputLookupLength;
    this.outputLookup = json.outputLookup;
    this.outputLookupLength = json.outputLookupLength;

    this.model = {
      hiddenLayers,
      output,
      allMatrices,
      outputConnector,
      equations: [],
      equationConnections: [],
    };
    this.initialLayerInputs = this.hiddenLayers.map(
      (size) => new Matrix(size, 1)
    );
    this.bindEquation();
  }

  /**
   * @param {Function} [cb]
   * @returns {Function}
   */
  toFunction(cb) {
    const { model } = this;
    const { equations } = this.model;
    const { inputSize } = this;
    const { inputLookup } = this;
    const { inputLookupLength } = this;
    const { outputLookup } = this;
    const { outputLookupLength } = this;
    const equation = equations[1];
    const { states } = equation;
    const jsonString = JSON.stringify(this.toJSON());

    function previousConnectionIndex(m) {
      const connection = model.equationConnections[0];
      const { states } = equations[0];
      for (let i = 0, max = states.length; i < max; i++) {
        if (states[i].product === m) {
          return i;
        }
      }
      return connection.indexOf(m);
    }

    function matrixOrigin(m, stateIndex) {
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
    }

    function matrixToString(m, stateIndex) {
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

    function toInner(fnString) {
      // crude, but should be sufficient for now
      // function() { body }
      fnString = fnString.toString().split('{');
      fnString.shift();
      // body }
      fnString = fnString.join('{');
      fnString = fnString.split('}');
      fnString.pop();
      // body

      return fnString
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

    function fileName(fnName) {
      return `src/recurrent/matrix/${fnName.replace(/[A-Z]/g, function (value) {
        return `-${value.toLowerCase()}`;
      })}.js`;
    }

    const statesRaw = [];
    const usedFunctionNames = {};
    const innerFunctionsSwitch = [];
    for (let i = 0, max = states.length; i < max; i++) {
      const state = states[i];
      statesRaw.push(`states[${i}] = {
      name: '${state.forwardFn.name}',
      left: ${matrixToString(state.left, i)},
      right: ${matrixToString(state.right, i)},
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
    // eslint-disable-next-line no-new-func
    return new Function('rawInput', cb ? cb(src) : src);
  }
}

RNNTimeStep.defaults = {
  inputSize: 1,
  hiddenLayers: [20],
  outputSize: 1,
  learningRate: RNN.defaults.learningRate,
  decayRate: RNN.defaults.decayRate,
  smoothEps: RNN.defaults.smoothEps,
  regc: RNN.defaults.regc,
  clipval: RNN.defaults.clipval,
};

RNNTimeStep.trainDefaults = RNN.trainDefaults;

module.exports = RNNTimeStep;
