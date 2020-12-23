import NeuralNetwork from './neural-network';
import {
  INeuralNetworkOptions,
  INeuralNetworkTestResult,
  INeuralNetworkTrainingData,
  INeuralNetworkTrainingOptions,
} from './neural-network-types';

export type ICrossValidateOptions = INeuralNetworkOptions;
export interface ICrossValidateJSON {
  avgs: ICrossValidationTestPartitionResults;
  stats: ICrossValidateStats;
  sets: ICrossValidationTestPartitionResults[];
}

export interface ICrossValidateStatsAverages {
  trainTime: number;
  testTime: number;
  iterations: number;
  error: number;
}

export interface ICrossValidateStatsResultStats {
  total: number;
  testSize: number;
  trainSize: number;
}

export interface ICrossValidateStatsResultBinaryStats
  extends ICrossValidateStatsResultStats {
  total: number;
  truePos: number;
  trueNeg: number;
  falsePos: number;
  falseNeg: number;
  precision: number;
  recall: number;
  accuracy: number;
}
export interface ICrossValidateStats {
  avgs: ICrossValidateStatsAverages;
  stats: ICrossValidateStatsResultStats | ICrossValidateStatsResultBinaryStats;
  sets: ICrossValidationTestPartitionResults[];
}

export interface ICrossValidationTestPartitionResults
  extends INeuralNetworkTestResult {
  trainTime: number;
  testTime: number;
  iterations: number;
  learningRate: number;
  hiddenLayers: number[];
  network: NeuralNetwork;
  total: number;
}
type $TSFixME = any;

export default class CrossValidate {
  Classifier: typeof NeuralNetwork;
  options: ICrossValidateOptions = {};
  json: $TSFixME = null;

  /**
   *
   * @param {NeuralNetwork|constructor} Classifier
   * @param {object} [options]
   */
  constructor(
    Classifier: typeof NeuralNetwork,
    options: ICrossValidateOptions = {}
  ) {
    this.Classifier = Classifier;
    this.options = options;
    this.json = null;
  }

  testPartition(
    trainOpts: INeuralNetworkTrainingOptions,
    trainSet: INeuralNetworkTrainingData[],
    testSet: INeuralNetworkTrainingData[]
  ): ICrossValidationTestPartitionResults {
    const classifier = new this.Classifier(this.options);
    const beginTrain = Date.now();
    const trainingStats = classifier.train(trainSet, trainOpts);
    const beginTest = Date.now();
    const testStats: INeuralNetworkTestResult = classifier.test(testSet);
    const endTest = Date.now();
    const stats: ICrossValidationTestPartitionResults = {
      ...testStats,
      trainTime: beginTest - beginTrain,
      testTime: endTest - beginTest,
      iterations: trainingStats.iterations,
      error: trainingStats.error,
      total: testStats.total,
      learningRate: (classifier.trainOpts as $TSFixME).learningRate,
      hiddenLayers: (classifier as $TSFixME).hiddenLayers,
      network: classifier.toJSON(),
    };
    return stats;
  }

  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   * source: http://stackoverflow.com/a/12646864/1324039
   */
  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  train<T extends []>(
    data: INeuralNetworkTrainingData[] | T,
    trainOpts: INeuralNetworkTrainingOptions = {},
    k = 4
  ): ICrossValidateStats {
    if (data.length < k) {
      throw new Error(
        `Training set size is too small for ${data.length} k folds of ${k}`
      );
    }
    this.shuffleArray(data);
    const size = data.length / k;

    const avgs: ICrossValidateStatsAverages = {
      trainTime: 0,
      testTime: 0,
      iterations: 0,
      error: 0,
    };

    const stats:
      | ICrossValidateStatsResultStats
      | ICrossValidateStatsResultBinaryStats = {
      total: 0,
      testSize: 0,
      trainSize: 0,
    };

    const isBinaryStats = (
      stats:
        | ICrossValidateStatsResultStats
        | ICrossValidateStatsResultBinaryStats
    ): stats is ICrossValidateStatsResultBinaryStats => {
      return (stats as ICrossValidateStatsResultBinaryStats) !== undefined;
    };

    const binaryStats: ICrossValidateStatsResultBinaryStats = {
      total: 0,
      testSize: 0,
      trainSize: 0,
      truePos: 0,
      trueNeg: 0,
      falsePos: 0,
      falseNeg: 0,
      precision: 0,
      recall: 0,
      accuracy: 0,
    };

    const results = [];
    let isBinary = null;

    for (let i = 0; i < k; i++) {
      const dclone = data.slice(0);
      const testSet = dclone.splice(i * size, size);
      const trainSet = dclone;
      const result = this.testPartition(trainOpts, trainSet, testSet);

      if (isBinary === null) {
        isBinary =
          result.hasOwnProperty('falseNeg') &&
          result.hasOwnProperty('falsePos') &&
          result.hasOwnProperty('trueNeg') &&
          result.hasOwnProperty('truePos');
        if (isBinary) {
          Object.assign(stats, binaryStats);
        }
      }

      avgs.iterations += result.iterations;
      avgs.testTime += result.testTime;
      avgs.trainTime += result.trainTime;
      avgs.error += result.error;
      stats.total += result.total;
      results.push(result);
    }
    avgs.error /= k;
    avgs.iterations /= k;
    avgs.testTime /= k;
    avgs.trainTime /= k;

    if (isBinaryStats(stats)) {
      stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
      stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
      stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;
    }

    stats.testSize = size;
    stats.trainSize = data.length - size;

    this.json = {
      avgs: avgs,
      stats: stats,
      sets: results,
    };
    return this.json;
  }

  toNeuralNetwork(): NeuralNetwork {
    return this.fromJSON(this.json);
  }

  toJSON(): ICrossValidateJSON {
    return this.json;
  }

  fromJSON(crossValidateJson: ICrossValidateJSON): NeuralNetwork {
    const Classifier = this.Classifier;
    const json: ICrossValidationTestPartitionResults = crossValidateJson.sets.reduce(
      (prev, cur) => (prev.error < cur.error ? prev : cur)
    );
    if (Classifier.fromJSON) {
      return Classifier.fromJSON(json);
    }
    const instance = new Classifier();
    instance.fromJSON(json);
    return instance;
  }
}
