import { INeuralNetworkData, INeuralNetworkTrainOptions } from "./neural-network";
import { INeuralNetworkGPUOptions, NeuralNetworkGPU } from "./neural-network-gpu";

import { ITrainingDatum } from "./lookup";
import { IFeedForwardTrainingData } from "./feed-forward";


/**
 * @typedef {Object} AETrainOptions
 * @property {number} errorThresh
 * Once the training error reaches `errorThresh`, training will be complete.
 * @property {number} iterations
 * Once the training epoch count reaches `iterations`, training will be
 * complete.
 * @property {number} learningRate
 * The rate at which values will be changed.
 */

interface AETrainOptions extends INeuralNetworkTrainOptions {};

/**
 * @typedef {import('brain.js/dist/lookup').ITrainingDatum[]} ITrainingData
 */

type ITrainingData = ITrainingDatum[];

/**
 *
 * @param {string} word
 * The word to convert into a vector.
 * @param {number} wordLength
 * The maximum possible length of a word.
 * @returns {Float32Array}
 */
function word2vec (
    word: string,
    wordLength: number = 16
) {
    if (wordLength) {
        word = word.padEnd(wordLength);
    }

    const byteLength = wordLength * 4;
    const bitLength = byteLength * 8;

    const vec = new Float32Array(bitLength);

    let index = 0;

    for (let char of word) {
        let byte = char.charCodeAt(0);

        vec[index++] = byte & 0b0000_0001;
        vec[index++] = (byte & 0b0000_0010) >> 1;
        vec[index++] = (byte & 0b0000_0100) >> 2;
        vec[index++] = (byte & 0b0000_1000) >> 3;
        vec[index++] = (byte & 0b0001_0000) >> 4;
        vec[index++] = (byte & 0b0010_0000) >> 5;
        vec[index++] = (byte & 0b0100_0000) >> 6;
        vec[index++] = (byte & 0b1000_0000) >> 7;
    }

    return vec;
}

/**
 * Convert a vector of bits into a word.
 * @param {number[]} vec The vector of bits to convert into a word.
 * @returns {string} The decoded word.
 */
function vec2word (
    vec: number[]
) {
    const bytes = [];

    for (
        let vecIndex = 0;
        vecIndex < vec.length;
        vecIndex += 8
    ) {
        let byte = 0x00;

        for (
            let localBitIndex = 0;
            localBitIndex < 8;
            localBitIndex++
        ) {
            const bitIndex = vecIndex + localBitIndex;
            const predictedBit = vec[bitIndex];

            const bit = Math.round(predictedBit);

            byte |= bit << localBitIndex;
        }

        bytes.push(byte);
    }

    let word = String.fromCharCode(...bytes).trim();

    return word;
}

/**
 * @typedef {DataType[] | string} AutoDecodedData
 */

type AutoDecodedData
    = DataType[]
    | boolean[]
    | number[]
    | string
    ;

/**
 * @typedef {Float32Array} AutoEncodedData
 */

type AutoEncodedData = Float32Array;

/**
 * @typedef {"boolean"|"number"|"string"} DataType
 */

type DataType = boolean | number | string;

/**
 * @typedef {Object} AE
 */

/**
 * An Auto Encoder (AE) is a type of neural network consisting of two
 * subnetworks: an encoder, and a decoder.
 * The encoder is responsible for converting the input into a smaller
 * representation via feature extraction.
 * The decoder is responsible for reconstructing the original input from a
 * vector of extracted features.
 *
 * Example usage:
 * ```
 * const ae = new AE(10, 1, 'string');
 *
 * ae.train(["this", "is", "an", "example"]);
 *
 * const encoded = ae.encode("example");
 * const decoded = ae.decode(encoded);
 *
 * console.log(encoded, '->', decoded);
 * ```
 */
export class AE<
    InputType extends INeuralNetworkData,
    OutputType extends INeuralNetworkData
> {
    _dataType: DataType;
    _encodedDataSize: number;
    _transcodedDataSize: number;
    _decodedDataSize: number;
    encoder: NeuralNetworkGPU<InputType, OutputType>;
    decoder: NeuralNetworkGPU<InputType, OutputType>;

    /**
     * Create a new auto encoder.
     * @param {number} decodedDataSize
     * The size of the data prior to encoding, and after decoding.
     * @param {number} encodedDataSize
     * The size of the data after encoding, and prior to decoding.
     * @param {DataType} dataType
     * The type of data to encode.
     */
    constructor (
        decodedDataSize: number,
        encodedDataSize: number,
        dataType: DataType = 'number'
    ) {
        const transcodedDataSize = Math.round(
            (encodedDataSize + decodedDataSize) * 0.5
        );

        /**
         * @type {DataType}
         */
        this._dataType = dataType;

        /**
         * @type {number}
         */
        this._encodedDataSize = encodedDataSize;

        /**
         * @type {number}
         */
        this._transcodedDataSize = transcodedDataSize;

        /**
         * @type {number}
         */
        this._decodedDataSize = decodedDataSize;

        /**
         * @type {NeuralNetworkGPU}
         */
        this.encoder = new NeuralNetworkGPU(
            {
                hiddenLayers: [
                    this._getTranscodedDataSize(),
                    this._getEncodedDataSize(),
                    this._getTranscodedDataSize()
                ],
                inputSize: this._getDecodedDataSize(),
                outputSize: this._getDecodedDataSize()
            }
        );

        /**
         * @type {NeuralNetworkGPU}
         */
        this.decoder = new NeuralNetworkGPU(
            {
                hiddenLayers: [ this._getTranscodedDataSize() ],
                inputSize: this._getEncodedDataSize(),
                outputSize: this._getDecodedDataSize()
            }
        );
    }

    /**
     * Parse a stringified `AE`.
     * @param {string} jsonString
     * A JSON string containing a stringified `AE`.
     * @returns
     */
    static parse (
        jsonString: string
    ) {
        const json = JSON.parse(jsonString);

        const autoEncoder = new AE(
            json.decodedDataSize,
            json.encodedDataSize,
            json.dataType
        );

        autoEncoder.fromJSON(json);

        return autoEncoder;
    }

    _accuracy (
        input: Array<DataType>
    ) {
        const encoded = this.encode(input);
        const decoded = this.decode(encoded);

        let accuracy = 0;

        for (
            let i = 0;
            i < decoded.length;
            i++
        ) {
            const inputValue = input[i];
            // TODO: Support types other than 'number' here.
            const decodedValue = Math.round(decoded[i] as number);

            const isCorrect = inputValue === decodedValue;

            if (isCorrect) {
                accuracy += 1;
            }
        }

        accuracy /= decoded.length;

        return accuracy;
    }

    accuracy (
        trainingData: DataType[] | DataType[][]
    ) {
        if (
            !trainingData.hasOwnProperty('length') ||
            typeof trainingData[0] !== 'object'
        ) {
            return this._accuracy(trainingData as DataType[]);
        }

        trainingData = trainingData as DataType[][];

        let accuracy = 0;

        for (let input of trainingData) {
            accuracy += this._accuracy(input);
        }

        accuracy /= trainingData.length;

        return accuracy;
    }

    /**
     * Decode encoded data.
     * @param {Float32Array} encodedData The encoded data to decode.
     * @returns {boolean[]|number[]|string} The decoded data.
     */
    decode (encodedData: Float32Array) {
        let decodedDataObject = this.decoder.run(encodedData as InputType);

        let decodedData: DataType[] | string = [];

        for (let extract in decodedDataObject) {
            const i  = extract as unknown as number;
            decodedData[i] = (decodedDataObject as number[])[i];

            if (this._dataType === 'boolean') {
                decodedData[i] = (decodedData[i] as number) >= 0.5;
            }
        }

        if (this._dataType === 'string') {
            decodedData = vec2word(decodedData as number[]);
            decodedData = decodedData.substring(0, decodedData.indexOf(' '));
        }

        return decodedData;
    }

    /**
     * Encode data.
     * @param {AutoDecodedData} data
     * The data to encode.
     * @returns {AutoEncodedData}
     */
    encode (data: AutoDecodedData) {
        let encoderInput: Float32Array | AutoDecodedData = data;

        if (this._dataType === 'string') {
            const dataString = data as string;

            if (dataString.length < this._getWordSize()) {
                dataString.padEnd(this._getWordSize());
            }

            encoderInput = word2vec(
                dataString,
                this._getWordSize()
            );
        }

        this.encoder.run(encoderInput as InputType);

        const encodedDataLayer = this.encoder.outputs[2];

        let encodedData = encodedDataLayer.toArray();

        return encodedData;
    }

    /**
     * Load this `AE`'s data from JSON.
     * @param {any} json JSON representation of an `AE`.
     */
    fromJSON (json: any) {
        if (typeof json === 'string') json = JSON.parse(json);

        this._decodedDataSize = json.decodedDataSize;
        this._transcodedDataSize = json.transcodedDataSize;
        this._encodedDataSize = json.encodedDataSize;

        this.encoder.fromJSON(json.encoder);
        this.decoder.fromJSON(json.decoder);
    }

    /**
     * Predict the decoded output of a given input data.
     * @param {AutoDecodedData} input
     * The input to predict the decoded output of.
     * @returns
     */
    run (input: AutoDecodedData) {
        return this.decode(this.encode(input));
    }

    /**
     * Stringify this `AE`.
     * @returns {string}
     * A JSON `string` containing this `AE`.
     */
    stringify () {
        return JSON.stringify(this.toJSON());
    }

    /**
     *
     * @returns {object}
     * An object suitable for passing to `JSON.stringify()`.
     */
    toJSON () {
        return {
            encoder: this.encoder.toJSON(),
            decoder: this.decoder.toJSON()
        };
    }

    /**
     * Train the auto encoder on a training data set.
     * @param {ITrainingData} data
     * The data set to train the neural networks on.
     * @param {AETrainOptions} options
     * The options to pass to the neural network trainers.
     */
    train (
        data: ITrainingData,
        options: Partial<AETrainOptions> = {}
    ) {
        this._trainEncoder(data, options);
        this._trainDecoder(data, options);
    }

    /**
     * Validate input by asserting that decoding the output of the encoder
     * reproduces the original input.
     * @param {AutoDecodedData} input
     * The input to validate.
     * @returns
     */
    validate (input: AutoDecodedData) {
        const output = this.run(input);
        if (typeof output === 'string') return output === input;
        else throw new Error(`\`validate()\` not yet implemented for data type '${this._dataType}'.`);
    }

    _getDecodedDataSize () {
        let size = this._decodedDataSize;

        if (this._dataType === 'string') {
            size *= 8;
        }

        return size;
    }

    _getEncodedDataSize () {
        let size = this._encodedDataSize;

        if (this._dataType === 'string') {
            size *= 8;
        }

        return Math.round(size);
    }

    _getTranscodedDataSize () {
        let size
            = (
                this._getEncodedDataSize()
                    + this._getDecodedDataSize()
            )
                * 0.5
        ;

        return Math.round(size);
    }

    _getVecSize () {
        return this._getWordSize() * 8;
    }

    _getWordSize () {
        return this._getDecodedDataSize() / 8;
    }

    _trainDecoder (
        data: ITrainingData | string[],
        options: Partial<AETrainOptions>
    ) {
        const trainingData = [];

        for (let output of data) {
            let finalOutput: ITrainingDatum | Float32Array;
            if (this._dataType === 'string') {
                output = (output as string).padEnd(this._getWordSize());
            }

            if (typeof output === 'string') {
                finalOutput = word2vec(
                    output as string,
                    this._getWordSize()
                );

                this._dataType = 'string';
            } else {
                finalOutput = output;
            }

            const input = this.encode(finalOutput as unknown as AutoDecodedData);

            const entry = {
                input,
                output
            };

            trainingData.push(entry);
        }

        this.decoder.train(
            trainingData as unknown as Array<
                IFeedForwardTrainingData<
                    InputType,
                    OutputType
                >
            >,
            options
        );
    }

    _trainEncoder (
        data: ITrainingData | string[],
        options: Partial<AETrainOptions>
    ) {
        const trainingData: ITrainingData = [];

        for (let input of data) {
            let finalInput: ITrainingDatum | Float32Array;

            if (this._dataType === 'string') {
                input = (input as string).padEnd(this._getWordSize());
            }

            if (typeof input === 'string') {
                finalInput = word2vec(
                    input,
                    this._getWordSize()
                );

                this._dataType = 'string';
            } else {
                finalInput = input;
            }

            let output = input;

            let finalOutput: ITrainingDatum | Float32Array;

            if (typeof output === 'string') {
                output = output.padEnd(this._getWordSize());

                finalOutput = word2vec(
                    output,
                    this._getWordSize()
                );

                this._dataType = 'string';
            } else {
                finalOutput = output;
            }

            const entry = {
                input: finalInput,
                output: finalOutput
            };

            trainingData.push(entry);
        }

        this.encoder.train(
            trainingData,
            options
        );
    }
}
