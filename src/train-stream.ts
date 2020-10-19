import { Writable } from 'stream';

interface ITrainStreamOptions {
  neuralNetwork: any;
  floodCallback?: () => void;
  doneTrainingCallback?: (stats: { error: number; iterations: number }) => void;
}

/**
 *
 * @param opts
 * @returns {TrainStream}
 * @constructor
 */
export class TrainStream extends Writable {
  // TODO: Once neural network classes are typed, change this `any`
  neuralNetwork: any;
  dataFormatDetermined: boolean;
  i: number;
  size: number;
  count: number;
  sum: number;
  floodCallback?: () => void;
  doneTrainingCallback?: (stats: { error: number; iterations: number }) => void;
  iterations: number;
  errorThresh: number;
  log: (message: string) => void;
  logPeriod: number;
  callbackPeriod: number;
  callback: (stats: { error: number; iterations: number }) => void;
  firstDatum: any;

  constructor(options: ITrainStreamOptions) {
    super({
      objectMode: true,
    });

    options = options || {};

    // require the neuralNetwork
    if (!options.neuralNetwork) {
      throw new Error(
        'No neural network specified. Please see list of available network types: https://github.com/BrainJS/brain.js#neural-network-types'
      );
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

  endInputs(): void {
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
  _write(
    chunk: any,
    enc: BufferEncoding,
    next: (error?: Error | null) => void
  ): void {
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
    // TODO: Remove this typecast once neural network classes are typed
    this.sum += this.neuralNetwork.trainPattern(data[0], true) as number;

    // tell the Readable Stream that we are ready for more data
    next();
  }

  /**
   *
   * @returns {*}
   */
  finishStreamIteration(): void {
    if (this.dataFormatDetermined && this.size !== this.count) {
      this.log("This iteration's data length was different from the first.");
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

    if (this.log && this.i % this.logPeriod === 0) {
      this.log(`iterations: ${this.i}, training error: ${error}`);
    }
    if (this.callback && this.i % this.callbackPeriod === 0) {
      this.callback({
        error,
        iterations: this.i,
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
          error,
          iterations: this.i,
        });
      }
    }
  }
}
