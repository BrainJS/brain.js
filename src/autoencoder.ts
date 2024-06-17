import { IKernelFunctionThis, KernelOutput, Texture, TextureArrayOutput } from "gpu.js";
import { IJSONLayer, INeuralNetworkData, INeuralNetworkDatum, INeuralNetworkTrainOptions, NeuralNetworkIO, NeuralNetworkRAM } from "./neural-network";
import { INeuralNetworkGPUOptions, NeuralNetworkGPU } from "./neural-network-gpu";
import { INeuralNetworkState } from "./neural-network-types";
import { UntrainedNeuralNetworkError } from "./errors/untrained-neural-network-error";

function loss(
  this: IKernelFunctionThis,
  actual: number,
  expected: number,
  inputs: NeuralNetworkIO,
  ram: NeuralNetworkRAM
) {
  let error = expected - actual;

  // if ( o ≈ i0 ) then return 10% of the loss value.
  // Otherwise, return 1000% of the full loss value.
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (Math.round(actual) !== Math.round(inputs[this.thread.x])) error *= 32;
  else error *= 0.03125;

  return error;
}

/**
 * An autoencoder learns to compress input data down to relevant features and reconstruct input data from its compressed representation.
 */
export class AutoencoderGPU<DecodedData extends INeuralNetworkData, EncodedData extends INeuralNetworkData> extends NeuralNetworkGPU<DecodedData, DecodedData> {
  private decoder?: NeuralNetworkGPU<EncodedData, DecodedData>;

  constructor (
    options?: Partial<INeuralNetworkGPUOptions>
  ) {
    // Create default options for the autoencoder.
    options ??= {};

    // Inherit the binary threshold of the parent autoencoder.
    options.binaryThresh = options.binaryThresh;
    // Inherit the hidden layers of the parent autoencoder.
    options.hiddenLayers = options.hiddenLayers;

    const decodedSize = options.inputSize ?? options.outputSize ?? 1;

    // Define the denoiser subnet's input and output sizes.
    if (decodedSize) options.inputSize = options.outputSize = decodedSize;

    options.loss ??= loss;

    // Create the autoencoder.
    super(options);
  }

  /**
   * Denoise input data, removing any anomalies from the data.
   * @param {DecodedData} input
   * @returns {DecodedData}
   */
  denoise(input: DecodedData): DecodedData {
    // Run the input through the generic denoiser.
    // This isn't the best denoiser implementation, but it's efficient.
    // Efficiency is important here because training should focus on
    // optimizing for feature extraction as quickly as possible rather than
    // denoising and anomaly detection; there are other specialized topologies
    // better suited for these tasks anyways, many of which can be implemented
    // by using an autoencoder.
    return this.run(input);
  }

  /**
   * Decode `EncodedData` into an approximation of its original form.
   *
   * @param {EncodedData} input
   * @returns {DecodedData}
   */
  decode(input: EncodedData): DecodedData {
    // If the decoder has not been trained yet, throw an error.
    if (!this.decoder) throw new UntrainedNeuralNetworkError(this);

    // Decode the encoded input.
    return this.decoder.run(input);
  }

  /**
   * Encode data to extract features, reduce dimensionality, etc.
   *
   * @param {DecodedData} input
   * @returns {EncodedData}
   */
  encode(input: DecodedData): EncodedData {
    // If the decoder has not been trained yet, throw an error.
    if (!this) throw new UntrainedNeuralNetworkError(this);

    // Process the input.
    this.run(input);

    // Get the auto-encoded input.
    let encodedInput: TextureArrayOutput = this.encodedLayer as TextureArrayOutput;

    // If the encoded input is a `Texture`, convert it into an `Array`.
    if (encodedInput instanceof Texture) encodedInput = encodedInput.toArray();
    else encodedInput = encodedInput.slice(0);

    // Return the encoded input.
    return encodedInput as EncodedData;
  }

  /**
   * Test whether or not a data sample likely contains anomalies.
   * If anomalies are likely present in the sample, returns `true`.
   * Otherwise, returns `false`.
   *
   * @param {DecodedData} input
   * @returns {boolean}
   */
  likelyIncludesAnomalies(input: DecodedData, anomalyThreshold: number = 0.2): boolean {
    // Create the anomaly vector.
    const anomalies: number[] = [];

    // Attempt to denoise the input.
    const denoised = this.denoise(input);

    // Calculate the anomaly vector.
    for (let i = 0; i < (input.length ?? 0); i++) {
      anomalies[i] = Math.abs((input as number[])[i] - (denoised as number[])[i]);
    }

    // Calculate the sum of all anomalies within the vector.
    const sum = anomalies.reduce(
      (previousValue, value) => previousValue + value
    );

    // Calculate the mean anomaly.
    const mean = sum / (input as number[]).length;

    // Return whether or not the mean anomaly rate is greater than the anomaly threshold.
    return mean > anomalyThreshold;
  }

  /**
   * Train the auto encoder.
   *
   * @param {DecodedData[]} data
   * @param {Partial<INeuralNetworkTrainOptions>} options
   * @returns {INeuralNetworkState}
   */
  train(data: Partial<DecodedData>[] | INeuralNetworkDatum<Partial<DecodedData>, Partial<DecodedData>>[], options?: Partial<INeuralNetworkTrainOptions>): INeuralNetworkState {
    const preprocessedData: INeuralNetworkDatum<Partial<DecodedData>, Partial<DecodedData>>[] = [];

    if (data.length && data.length > 0)
    for (let datum of data) {
      preprocessedData.push( { input: datum as Partial<DecodedData>, output: datum as Partial<DecodedData> } );
    }

    const results = super.train(preprocessedData, options);

    this.decoder = this.createDecoder();

    return results;
  }

  /**
   * Create a new decoder from the trained denoiser.
   *
   * @returns {NeuralNetworkGPU<EncodedData, DecodedData>}
   */
  private createDecoder() {
    const json = this.toJSON();

    const layers: IJSONLayer[] = [];
    const sizes: number[] = [];

    for (let i = this.encodedLayerIndex; i < this.sizes.length; i++) {
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
    return this.outputs[this.encodedLayerIndex];
  }

  /**
   * Get the offset of the encoded layer.
   */
  private get encodedLayerIndex(): number {
    return Math.round(this.outputs.length * 0.5) - 1;
  }
}

export default AutoencoderGPU;
