import { Writable } from 'stream';
import lookup from './lookup';

/**
 *
 * @param opts
 * @returns {TrainStream}
 * @constructor
 */
export default class TrainStream extends Writable {
  constructor(opts) {
    super({
      objectMode: true
    });

    opts = opts || {};

    // require the neuralNetwork
    if (!opts.neuralNetwork) {
      throw new Error('no neural network specified');
    }

    this.neuralNetwork = opts.neuralNetwork;
    this.dataFormatDetermined = false;

    this.inputKeys = [];
    this.outputKeys = []; // keeps track of keys seen
    this.i = 0; // keep track of the for loop i variable that we got rid of
    this.iterations = opts.iterations || 20000;
    this.errorThresh = opts.errorThresh || 0.005;
    this.log = opts.log ? (typeof opts.log === 'function' ? opts.log : console.log) : false;
    this.logPeriod = opts.logPeriod || 10;
    this.callback = opts.callback;
    this.callbackPeriod = opts.callbackPeriod || 10;
    this.floodCallback = opts.floodCallback;
    this.doneTrainingCallback = opts.doneTrainingCallback;

    this.size = 0;
    this.count = 0;

    this.sum = 0;

    this.on('finish', this.finishStreamIteration.bind(this));

    return this;
  }

  /**
   * _write expects data to be in the form of a datum. ie. {input: {a: 1 b: 0}, output: {z: 0}}
   * @param chunk
   * @param enc
   * @param next
   * @returns {*}
   * @private
   */
  _write(chunk, enc, next) {
    if (!chunk) { // check for the end of one iteration of the stream
      this.emit('finish');
      return next();
    }

    if (!this.dataFormatDetermined) {
      this.size++;
      this.inputKeys = uniques(this.inputKeys.slice(0).concat(Object.keys(chunk.input)));
      this.outputKeys = uniques(this.outputKeys.slice(0).concat(Object.keys(chunk.output)));
      this.firstDatum = this.firstDatum || chunk;
      return next();
    }

    this.count++;

    let data = this.neuralNetwork.formatData(chunk);
    this.trainDatum(data[0]);

    // tell the Readable Stream that we are ready for more data
    next();
  }

  /**
   *
   * @param datum
   */
  trainDatum(datum) {
    let err = this.neuralNetwork.trainPattern(datum.input, datum.output);
    this.sum += err;
  }

  /**
   *
   * @returns {*}
   */
  finishStreamIteration() {
    if (this.dataFormatDetermined && this.size !== this.count) {
      this.log('This iteration\'s data length was different from the first.');
    }

    if (!this.dataFormatDetermined) {
      // create the lookup
      this.neuralNetwork.inputLookup = lookup.lookupFromArray(this.inputKeys);
      if(!Array.isArray(this.firstDatum.output)){
        this.neuralNetwork.outputLookup = lookup.lookupFromArray(this.outputKeys);
      }

      let data = this.neuralNetwork.formatData(this.firstDatum);
      let sizes = [];
      let inputSize = data[0].input.length;
      let outputSize = data[0].output.length;
      let hiddenSizes = this.hiddenSizes;
      if (!hiddenSizes) {
        sizes.push(Math.max(3, Math.floor(inputSize / 2)));
      } else {
        hiddenSizes.forEach(size => {
          sizes.push(size);
        });
      }

      sizes.unshift(inputSize);
      sizes.push(outputSize);

      this.dataFormatDetermined = true;
      this.neuralNetwork.initialize(sizes);

      if (typeof this.floodCallback === 'function') {
        this.floodCallback();
      }
      return;
    }

    let error = this.sum / this.size;

    if (this.log && (this.i % this.logPeriod == 0)) {
      this.log('iterations:', this.i, 'training error:', error);
    }
    if (this.callback && (this.i % this.callbackPeriod == 0)) {
      this.callback({
        error: error,
        iterations: this.i
      });
    }

    this.sum = 0;
    this.count = 0;
    // update the iterations
    this.i++;

    // do a check here to see if we need the stream again
    if (this.i < this.iterations && error > this.errorThresh) {
      if (typeof this.floodCallback === 'function') {
        return this.floodCallback();
      }
    } else {
      // done training
      if (typeof this.doneTrainingCallback === 'function') {
        return this.doneTrainingCallback({
          error: error,
          iterations: this.i
        });
      }
    }
  }
}

/**
 *
 * https://gist.github.com/telekosmos/3b62a31a5c43f40849bb
 * @param arr
 * @returns {Array}
 */
function uniques(arr) {
  // Sets cannot contain duplicate elements, which is what we want
  return [...new Set(arr)];
}
