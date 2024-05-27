import AutoEncoder from "./auto-encoder";

const trainingData = [
  [0, 0, 0],
  [0, 1, 1],
  [1, 0, 1],
  [1, 1, 0]
];

const xornet = new AutoEncoder<number[], number[]>(
  {
    decodedSize: 3,
    hiddenLayers: [ 5, 2, 5 ]
  }
);

const errorThresh = 0.011;

const result = xornet.train(
  trainingData, {
    iterations: 100000,
    errorThresh
  }
);

test(
  "denoise a data sample",
  async () => {
    expect(result.error).toBeLessThanOrEqual(errorThresh);

    function xor(...args: number[]) {
      return Math.round(xornet.denoise(args)[2]);
    }

    const run1 = xor(0, 0, 0);
    const run2 = xor(0, 1, 1);
    const run3 = xor(1, 0, 1);
    const run4 = xor(1, 1, 0);

    expect(run1).toBe(0);
    expect(run2).toBe(1);
    expect(run3).toBe(1);
    expect(run4).toBe(0);
  }
);

test(
  "encode and decode a data sample",
  async () => {
    expect(result.error).toBeLessThanOrEqual(errorThresh);

    const run1$input = [0, 0, 0];
    const run1$encoded = xornet.encode(run1$input);
    const run1$decoded = xornet.decode(run1$encoded);

    const run2$input = [0, 1, 1];
    const run2$encoded = xornet.encode(run2$input);
    const run2$decoded = xornet.decode(run2$encoded);

    for (let i = 0; i < 3; i++) expect(Math.round(run1$decoded[i])).toBe(run1$input[i]);
    for (let i = 0; i < 3; i++) expect(Math.round(run2$decoded[i])).toBe(run2$input[i]);
  }
);

test(
  "test a data sample for anomalies",
  async () => {
    expect(result.error).toBeLessThanOrEqual(errorThresh);

    function includesAnomalies(...args: number[]) {
      expect(xornet.includesAnomalies(args)).toBe(false);
    }

    includesAnomalies(0, 0, 0);
    includesAnomalies(0, 1, 1);
    includesAnomalies(1, 0, 1);
    includesAnomalies(1, 1, 0);
  }
);
