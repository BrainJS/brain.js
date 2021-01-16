import {
  INeuralNetworkBinaryTestResult,
  INeuralNetworkOptions,
  INeuralNetworkState,
  INeuralNetworkTestResult,
} from './neural-network-types';

export type ICrossValidateOptions = INeuralNetworkOptions;

export interface INetwork {
  options: any;
  trainOpts: any;
  toJSON: () => any;
  train: (data: any[], trainOpts?: any) => INeuralNetworkState;
  test: (
    data: any[]
  ) => INeuralNetworkTestResult | INeuralNetworkBinaryTestResult;
}

export type ICrossValidateJSON<JsonType> =
  | ICrossValidateStats<JsonType>
  | ICrossValidateBinaryStats<JsonType>;

export interface ICrossValidateStatsAverages {
  trainTime: number;
  testTime: number;
  iterations: number;
  error: number;
}

export interface ICrossValidateStats<JsonType> {
  avgs: ICrossValidateStatsAverages;
  stats: ICrossValidateStatsResultStats;
  sets: Array<ICrossValidationTestPartitionResults<JsonType>>;
}
export interface ICrossValidateBinaryStats<NetworkType> {
  avgs: ICrossValidateStatsAverages;
  stats: ICrossValidateStatsResultBinaryStats;
  sets: Array<ICrossValidationTestPartitionBinaryResults<NetworkType>>;
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

export interface ICrossValidationTestPartitionResults<JsonType>
  extends INeuralNetworkTestResult {
  trainTime: number;
  testTime: number;
  iterations: number;
  network: JsonType;
  total: number;
}

export type ICrossValidationTestPartitionBinaryResults<
  JsonType
> = INeuralNetworkBinaryTestResult &
  ICrossValidationTestPartitionResults<JsonType>;

export type Classifier<NetworkType extends INetwork> = new (
  options: NetworkType['trainOpts']
) => NetworkType;

interface IStaticClassifier<NetworkType extends INetwork>
  extends Classifier<NetworkType> {
  fromJSON?: (json: ReturnType<NetworkType['toJSON']>) => NetworkType;
}

export default class CrossValidate<NetworkType extends INetwork> {
  Classifier: IStaticClassifier<NetworkType>;
  options: Partial<ICrossValidateOptions> = {};
  json: ICrossValidateJSON<ReturnType<NetworkType['toJSON']>> = {
    avgs: {
      error: 0,
      iterations: 0,
      testTime: 0,
      trainTime: 0,
    },
    stats: {
      total: 0,
      testSize: 0,
      trainSize: 0,
    },
    sets: [],
  };

  constructor(
    Classifier: IStaticClassifier<NetworkType>,
    options: Partial<NetworkType['options']> = {}
  ) {
    this.Classifier = Classifier;
    this.options = options;
  }

  testPartition(
    trainOpts: Parameters<NetworkType['train']>[1],
    trainSet: Parameters<NetworkType['train']>[0],
    testSet: Parameters<NetworkType['train']>[0]
  ):
    | ICrossValidationTestPartitionResults<ReturnType<NetworkType['toJSON']>>
    | ICrossValidationTestPartitionBinaryResults<
        ReturnType<NetworkType['toJSON']>
      > {
    const classifier = new this.Classifier(this.options);
    const beginTrain = Date.now();
    const trainingStats = classifier.train(trainSet, trainOpts);
    const beginTest = Date.now();
    const testStats:
      | INeuralNetworkTestResult
      | INeuralNetworkBinaryTestResult = classifier.test(testSet);
    const endTest = Date.now();
    return {
      ...testStats,
      trainTime: beginTest - beginTrain,
      testTime: endTest - beginTest,
      iterations: trainingStats.iterations,
      error: trainingStats.error,
      total: testStats.total,
      network: (classifier as {
        toJSON: () => ReturnType<NetworkType['toJSON']>;
      }).toJSON(),
    };
  }

  /**
   * Randomize array element order in-place.
   * Using Durstenfeld shuffle algorithm.
   * source: http://stackoverflow.com/a/12646864/1324039
   */
  shuffleArray<K>(array: K[]): K[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = array[i];
      array[i] = array[j];
      array[j] = temp;
    }
    return array;
  }

  static isBinaryStats = (
    stats: ICrossValidateStatsResultStats | ICrossValidateStatsResultBinaryStats
  ): stats is ICrossValidateStatsResultBinaryStats => {
    return (
      (stats as ICrossValidateStatsResultBinaryStats).accuracy !== undefined
    );
  };

  static isBinaryResults = <JsonType>(
    stats: ICrossValidateStats<JsonType> | ICrossValidateBinaryStats<JsonType>
  ): stats is ICrossValidateBinaryStats<JsonType> =>
    (stats as ICrossValidateBinaryStats<JsonType>).stats.accuracy !== undefined;

  static isBinaryPartitionResults = <JsonType>(
    stats:
      | ICrossValidationTestPartitionResults<JsonType>
      | ICrossValidationTestPartitionBinaryResults<JsonType>
  ): stats is ICrossValidationTestPartitionBinaryResults<JsonType> =>
    (stats as ICrossValidationTestPartitionBinaryResults<JsonType>).accuracy !==
    undefined;

  train(
    data: Parameters<NetworkType['train']>[0],
    trainOpts: Partial<Parameters<NetworkType['train']>[1]> = {},
    k = 4
  ): ICrossValidateStats<NetworkType> {
    if (data.length < k) {
      throw new Error(
        `Training set size is too small for ${data.length} k folds of ${k}`
      );
    }
    this.shuffleArray<Parameters<NetworkType['train']>[0]>(data);
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
      if (
        CrossValidate.isBinaryStats(stats) &&
        CrossValidate.isBinaryPartitionResults(result)
      ) {
        stats.accuracy += result.accuracy;
        stats.falseNeg += result.falseNeg;
        stats.falsePos += result.falsePos;
        stats.precision += result.precision;
        stats.recall += result.recall;
        stats.trueNeg += result.trueNeg;
        stats.truePos += result.truePos;
      }

      results.push(result);
    }
    avgs.error /= k;
    avgs.iterations /= k;
    avgs.testTime /= k;
    avgs.trainTime /= k;

    if (CrossValidate.isBinaryStats(stats)) {
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

  toNeuralNetwork(): NetworkType {
    return this.fromJSON(this.json);
  }

  toJSON(): ICrossValidateJSON<ReturnType<NetworkType['toJSON']>> | null {
    return this.json;
  }

  fromJSON(
    crossValidateJson: ICrossValidateJSON<ReturnType<NetworkType['toJSON']>>
  ): NetworkType {
    const Classifier = this.Classifier;
    const winningJSON:
      | ICrossValidationTestPartitionResults<ReturnType<NetworkType['toJSON']>>
      | ICrossValidationTestPartitionBinaryResults<
          ReturnType<NetworkType['toJSON']>
        > = (crossValidateJson as ICrossValidateStats<
      ReturnType<NetworkType['toJSON']>
    >).sets.reduce((prev, cur) => (prev.error < cur.error ? prev : cur));
    if (Classifier.fromJSON) {
      return Classifier.fromJSON(winningJSON.network);
    }
    const instance = new Classifier(this.options);
    if (
      (instance as {
        fromJSON?: (json: ReturnType<NetworkType['toJSON']>) => void;
      }).fromJSON
    ) {
      ((instance as unknown) as {
        fromJSON: (json: ReturnType<NetworkType['toJSON']>) => void;
      }).fromJSON(winningJSON.network);
      return instance;
    } else {
      throw new Error('no fromJSON method available');
    }
  }
}
