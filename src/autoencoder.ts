import { KernelOutput, Texture, TextureArrayOutput } from "gpu.js";
import { IJSONLayer, INeuralNetworkData, INeuralNetworkDatum, INeuralNetworkTrainOptions } from "./neural-network";
import { INeuralNetworkGPUOptions, NeuralNetworkGPU } from "./neural-network-gpu";
import { INeuralNetworkState } from "./neural-network-types";

function deepClone(value: TextureArrayOutput): TextureArrayOutput {
  const clone: TextureArrayOutput = [];

  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] === "object") (clone[i] as any) = deepClone(value[i] as any);
    else clone[i] = value[i];
  }

  return clone;
}

export interface IAEOptions {
  binaryThresh: number;
  decodedSize: number;
  hiddenLayers: number[];
}

/**
 * An autoencoder learns to compress input data down to relevant features and reconstruct input data from its compressed representation.
 */
export class AE<DecodedData extends INeuralNetworkData, EncodedData extends INeuralNetworkData> {
  #decoder?: NeuralNetworkGPU<EncodedData, DecodedData>;
  #denoiser: NeuralNetworkGPU<DecodedData, DecodedData>;

  constructor (
    options?: Partial<IAEOptions>
  ) {
    options ??= {};

    const denoiserOptions: Partial<INeuralNetworkGPUOptions> = {};

    denoiserOptions.binaryThresh = options.binaryThresh;
    denoiserOptions.hiddenLayers = options.hiddenLayers;

    if (options.decodedSize) denoiserOptions.inputSize = denoiserOptions.outputSize = options.decodedSize;

    this.#denoiser = new NeuralNetworkGPU<DecodedData, DecodedData>(options);
  }

  /**
   * Denoise input data, removing any anomalies from the data.
   * @param {DecodedData} input
   * @returns {DecodedData}
   */
  denoise(input: DecodedData): DecodedData {
    return this.#denoiser.run(input);
  }

  /**
   * Test a data sample for anomalies.
   *
   * @param {DecodedData} input
   * @returns {boolean}
   */
  includesAnomalies(input: DecodedData, anomalyThreshold: number = 0.2): boolean {
    const anomalies: number[] = [];

    const denoised = this.denoise(input);

    for (let i = 0; i < (input.length ?? 0); i++) {
      anomalies[i] = Math.abs((input as number[])[i] - (denoised as number[])[i]);
    }

    const sum = anomalies.reduce(
      (previousValue, value) => previousValue + value
    );

    const mean = sum / (input as number[]).length;

    return mean > anomalyThreshold;
  }

  /**
   * Decode `EncodedData` into an approximation of its original form.
   *
   * @param {EncodedData} input
   * @returns {DecodedData}
   */
  decode(input: EncodedData): DecodedData {
    // Decode the encoded input.
    let output = this.#decoder?.run(input);

    if (!output) throw new Error("Cannot decode data before training the auto encoder.");

    return output as DecodedData;
  }

  /**
   * Encode data to extract features, reduce dimensionality, etc.
   *
   * @param {DecodedData} input
   * @returns {EncodedData}
   */
  encode(input: DecodedData): EncodedData {
    // Process the input.
    this.#denoiser.run(input);

    // Get the auto-encoded input.
    let encodedInput: TextureArrayOutput = this.encodedLayer as TextureArrayOutput;

    // If the encoded input is a `Texture`, convert it into an `Array`.
    if (encodedInput instanceof Texture) encodedInput = encodedInput.toArray();

    // Return the encoded input.
    return deepClone(encodedInput) as EncodedData;
  }

  /**
   * Train the auto encoder.
   *
   * @param {DecodedData[]} data
   * @param {Partial<INeuralNetworkTrainOptions>} options
   * @returns {INeuralNetworkState}
   */
  train(data: DecodedData[], options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkState {
    const preprocessedData: INeuralNetworkDatum<Partial<DecodedData>, Partial<DecodedData>>[] = [];

    for (let datum of data) {
      preprocessedData.push( { input: datum, output: datum } );
    }

    const results = this.#denoiser.train(preprocessedData, options);

    this.#decoder = this.createDecoder();

    return results;
  }

  /**
   * Create a new decoder from the trained denoiser.
   *
   * @returns {NeuralNetworkGPU<EncodedData, DecodedData>}
   */
  private createDecoder() {
    const json = this.#denoiser.toJSON();

    const layers: IJSONLayer[] = [];
    const sizes: number[] = [];

    for (let i = this.encodedLayerIndex; i < this.#denoiser.sizes.length; i++) {
      layers.push(json.layers[i]);
      sizes.push(json.sizes[i]);
    }

    json.layers = layers;
    json.sizes = sizes;

    json.options.inputSize = json.sizes[0];

    const decoder = new NeuralNetworkGPU().fromJSON(json);

    return decoder as unknown as NeuralNetworkGPU<EncodedData, DecodedData>;
  }

  /**
   * Get the layer containing the encoded representation.
   */
  private get encodedLayer(): KernelOutput {
    return this.#denoiser.outputs[this.encodedLayerIndex];
  }

  /**
   * Get the offset of the encoded layer.
   */
  private get encodedLayerIndex(): number {
    return Math.round(this.#denoiser.outputs.length * 0.5) - 1;
  }
}

export default AE;
