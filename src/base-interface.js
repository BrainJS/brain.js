import Thaw from 'thaw.js';

/**
 * @param {object} options
 * @constructor
 */
export default class BaseInterface {

  constructor(options = {}) {
    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(Object.assign({}, this.constructor.trainDefaults, options));

    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;
  }

  /**
   *
   * @param options
   *    Supports all `trainDefaults` properties
   *    also supports:
   *       learningRate: (number),
   *       momentum: (number),
   *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
   */
  updateTrainingOptions(options) {
    const trainDefaults = this.constructor.trainDefaults;
    for (const p in trainDefaults) {
      if (!trainDefaults.hasOwnProperty(p)) continue;
      this.trainOpts[p] = options.hasOwnProperty(p)
        ? options[p]
        : trainDefaults[p];
    }
    this.validateTrainingOptions(this.trainOpts);
    this.setLogMethod(options.log || this.trainOpts.log);
    this.activation = options.activation || this.activation;
  }

  /**
   *
   * @param options
   */
  validateTrainingOptions(options) {
    const validations = {
      iterations: (val) => { return typeof val === 'number' && val > 0; },
      errorThresh: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      log: (val) => { return typeof val === 'function' || typeof val === 'boolean'; },
      logPeriod: (val) => { return typeof val === 'number' && val > 0; },
      learningRate: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      momentum: (val) => { return typeof val === 'number' && val > 0 && val < 1; },
      callback: (val) => { return typeof val === 'function' || val === null },
      callbackPeriod: (val) => { return typeof val === 'number' && val > 0; },
      timeout: (val) => { return typeof val === 'number' && val > 0 }
    };
    for (const p in validations) {
      if (!validations.hasOwnProperty(p)) continue;
      if (!options.hasOwnProperty(p)) continue;
      if (!validations[p](options[p])) {
        throw new Error(`[${p}, ${options[p]}] is out of normal training range, your network will probably not train.`);
      }
    }
  }

  /**
   *
   * @param log
   * if a method is passed in method is used
   * if false passed in nothing is logged
   * @returns error
   */
  setLogMethod(log) {
    if (typeof log === 'function'){
      this.trainOpts.log = log;
    } else if (log) {
      this.trainOpts.log = console.log;
    } else {
      this.trainOpts.log = false;
    }
  }

  /**
   *
   * @param data
   * @returns {Number} error
   */
  calculateTrainingError(data) {
    let sum = 0;
    for (let i = 0; i < data.length; ++i) {
      sum += this.trainPattern(data[i], true);
    }
    return sum / data.length;
  }

  /**
   * @param data
   */
  trainPatterns(data) {
    for (let i = 0; i < data.length; ++i) {
      this.trainPattern(data[i]);
    }
  }

  /**
   *
   * @param {object} data
   * @param {object} status { iterations: number, error: number }
   * @param endTime
   */
  trainingTick(data, status, endTime) {
    if (status.iterations >= this.trainOpts.iterations || status.error <= this.trainOpts.errorThresh || Date.now() >= endTime) {
      return false;
    }

    status.iterations++;

    if (this.trainOpts.log && (status.iterations % this.trainOpts.logPeriod === 0)) {
      status.error = this.calculateTrainingError(data);
      this.trainOpts.log(`iterations: ${status.iterations}, training error: ${status.error}`);
    } else {
      if (status.iterations % this.errorCheckInterval === 0) {
        status.error = this.calculateTrainingError(data);
      } else {
        this.trainPatterns(data);
      }
    }

    if (this.trainOpts.callback && (status.iterations % this.trainOpts.callbackPeriod === 0)) {
      this.trainOpts.callback({
        iterations: status.iterations,
        error: status.error
      });
    }
    return true;
  }

  /**
   *
   * @param data
   * @param options
   * @protected
   * @return {object} { data, status, endTime }
   */
  prepTraining(data, options) {
    this.updateTrainingOptions(options);
    data = this.formatData(data);
    const endTime = Date.now() + this.trainOpts.timeout;

    const status = {
      error: 1,
      iterations: 0
    };

    this.verifyIsInitialized(data);

    return {
      data,
      status,
      endTime
    };
  }

  /**
   *
   * @param data
   * @param options
   * @returns {object} {error: number, iterations: number}
   */
  train(data, options = {}) {
    let status, endTime;
    ({ data, status, endTime } = this.prepTraining(data, options));

    while (this.trainingTick(data, status, endTime));
    return status;
  }

  /**
   *
   * @param data
   * @param options
   * @returns {Promise}
   * @resolves {{error: number, iterations: number}}
   * @rejects {{trainError: string, status: {error: number, iterations: number}}
   */
  trainAsync(data, options = {}) {
    let status, endTime;
    ({ data, status, endTime } = this.prepTraining(data, options));

    return new Promise((resolve, reject) => {
      try {
        const thawedTrain = new Thaw(new Array(this.trainOpts.iterations), {
          delay: true,
          each: () => this.trainingTick(data, status, endTime) || thawedTrain.stop(),
          done: () => resolve(status)
        });
        thawedTrain.tick();
      } catch (trainError) {
        reject({trainError, status});
      }
    });
  }

  // These methods to be implimented in subclasses

  trainPattern() {
    throw new Error('not yet implemented');
  }

  addFormat() {
    throw new Error('not yet implemented');
  }

  toJSON() {
    throw new Error('not yet implemented');
  }

  fromJSON() {
    throw new Error('not yet implemented');
  }

  toFunction() {
    throw new Error('not yet implemented');
  }

}
