import { Writable } from 'stream';
import { INeuralNetworkTrainOptions } from './neural-network';
import { INeuralNetworkState } from './neural-network-types';

export interface ITrainStreamNetwork<InputType, FormattedType, TrainOptsType> {
  trainOpts: any;
  updateTrainingOptions: (trainOpts: Partial<TrainOptsType>) => void;
  addFormat: (data: InputType) => void;
  formatData: (data: InputType[]) => FormattedType[];
  trainPattern: (value: FormattedType, logErrorRate?: boolean) => number | null;
  verifyIsInitialized: (data: FormattedType[]) => void;
}

interface ITrainStreamOptions<Network> extends INeuralNetworkTrainOptions {
  neuralNetwork: Network;
  floodCallback?: () => void;
  doneTrainingCallback?: (stats: { error: number; iterations: number }) => void;
}

export class TrainStream<
  Network extends ITrainStreamNetwork<
    Parameters<Network['addFormat']>[0],
    Parameters<Network['trainPattern']>[0],
    Network['trainOpts']
  >
> extends Writable {
  neuralNetwork: Network;

  dataFormatDetermined: boolean;
  i: number;
  size: number;
  count: number;
  sum: number;
  floodCallback?: () => void;
  doneTrainingCallback?: (stats: { error: number; iterations: number }) => void;
  iterations: number;
  errorThresh: number;
  log: boolean | ((status: INeuralNetworkState) => void);
  logPeriod: number;
  callbackPeriod: number;
  callback?: (status: { iterations: number; error: number }) => void;
  firstDatum: Array<Parameters<Network['addFormat']>[0]> | undefined;

  constructor(options: Partial<ITrainStreamOptions<Network>>) {
    super({
      objectMode: true,
    });

    // require the neuralNetwork
    if (!options.neuralNetwork) {
      throw new Error(
        'No neural network specified. Please see list of available network types: https://github.com/BrainJS/brain.js#neural-network-types'
      );
    }

    const { neuralNetwork } = options;
    // inherit trainOpts settings from neuralNetwork
    neuralNetwork.updateTrainingOptions(options);
    const { trainOpts } = neuralNetwork; // just updated from above line

    this.neuralNetwork = neuralNetwork;
    this.dataFormatDetermined = false;
    this.i = 0; // keep track of internal iterations
    this.size = 0;
    this.count = 0;
    this.sum = 0;
    this.floodCallback = options.floodCallback;
    this.doneTrainingCallback = options.doneTrainingCallback;

    this.iterations = trainOpts.iterations;
    this.errorThresh = trainOpts.errorThresh;
    this.log = trainOpts.log;
    this.logPeriod = trainOpts.logPeriod;
    this.callbackPeriod = trainOpts.callbackPeriod;
    this.on('finish', this.finishStreamIteration.bind(this));
    this.callback = trainOpts.callback;
  }

  endInputs(): void {
    this.write(false);
  }

  _write(
    chunk: Array<Parameters<Network['addFormat']>[0]>,
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

      if (this.firstDatum === undefined) {
        this.firstDatum = chunk;
      }

      return next();
    }

    this.count++;

    const data = this.neuralNetwork.formatData([chunk]);
    const error = this.neuralNetwork.trainPattern(data[0], true) as number;

    if (error !== null) {
      this.sum += error;
    }

    // tell the Readable Stream that we are ready for more data
    next();
  }

  finishStreamIteration(): void {
    if (this.dataFormatDetermined && this.size !== this.count) {
      console.warn(
        "This iteration's data length was different from the first!"
      );
    }

    if (!this.dataFormatDetermined && this.firstDatum !== undefined) {
      const data = this.neuralNetwork.formatData([this.firstDatum]);
      this.neuralNetwork.verifyIsInitialized(data);
      this.dataFormatDetermined = true;

      if (typeof this.floodCallback === 'function') {
        this.floodCallback();
      }

      return;
    }

    const error = this.sum / this.size;

    if (this.log && this.i % this.logPeriod === 0) {
      if (typeof this.log === 'function') {
        this.log({
          iterations: this.i,
          error: error,
        });
      } else {
        console.info(`iterations: ${this.i}, training error: ${error}`);
      }
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
