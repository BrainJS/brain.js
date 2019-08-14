const { Writable } = require('stream');

/**
 *
 * @param opts
 * @returns {TrainStream}
 * @constructor
 */
class TrainStream extends Writable {
  constructor(options) {
    super({
      objectMode: true
    });

    options = options || {};

    // require the neuralNetwork
    if (!options.neuralNetwork) {
      throw new Error('no neural network specified');
    }

    const { neuralNetwork } = options;
    this.neuralNetwork = neuralNetwork;
    this.dataFormatDetermined = false;
    this.i = 0; // keep track of internal iterations
    this.size = 0;
    this.count = 0;
    this.sum = 0;
    this.floodCallback = options.floodCallback;
    this.doneTrainingCallback = options.doneTrainingCallback;

    // inherit trainOpts settings from neuralNetwork
    neuralNetwork.updateTrainingOptions(options);
    const { trainOpts } = neuralNetwork;
    this.iterations = trainOpts.iterations;
    this.errorThresh = trainOpts.errorThresh;
    this.log = trainOpts.log;
    this.logPeriod = trainOpts.logPeriod;
    this.callbackPeriod = trainOpts.callbackPeriod;
    this.callback = trainOpts.callback;

    this.on('finish', this.finishStreamIteration.bind(this));
  }

  endInputs() {
    this.write(false);
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
    if (!chunk) {
      // check for the end of one iteration of the stream
      this.emit('finish');
      return next();
    }

    if (!this.dataFormatDetermined) {
      this.size++;
      this.neuralNetwork.addFormat(chunk);
      this.firstDatum = this.firstDatum || chunk;
      return next();
    }

    this.count++;

    const data = this.neuralNetwork.formatData(chunk);
    this.sum += this.neuralNetwork.trainPattern(data[0], true);

    // tell the Readable Stream that we are ready for more data
    next();
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
      const data = this.neuralNetwork.formatData(this.firstDatum);
      this.neuralNetwork.verifyIsInitialized(data);
      this.dataFormatDetermined = true;

      if (typeof this.floodCallback === 'function') {
        this.floodCallback();
      }
      return;
    }

    const error = this.sum / this.size;

    if (this.log && (this.i % this.logPeriod === 0)) {
      this.log(`iterations: ${ this.i}, training error: ${ error }`);
    }
    if (this.callback && (this.i % this.callbackPeriod === 0)) {
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

module.exports = TrainStream;
