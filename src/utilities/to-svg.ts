import { FeedForward, IFeedForwardJSON } from '../feed-forward';
import { recurrentZeros } from '../layer/recurrent-zeros';
import { Recurrent } from '../recurrent';
import { IRNNJSON, RNN } from '../recurrent/rnn';
import {
  INeuralNetworkData,
  INeuralNetworkJSON,
  NeuralNetwork,
} from '../neural-network';
import { GRU } from '../recurrent/gru';
import { LSTM } from '../recurrent/lstm';
import { NeuralNetworkGPU } from '../neural-network-gpu';
import { IRNNTimeStepJSON, RNNTimeStep } from '../recurrent/rnn-time-step';
import { LSTMTimeStep } from '../recurrent/lstm-time-step';
import { GRUTimeStep } from '../recurrent/gru-time-step';
import { ILayer } from '../layer';

interface LineDrawInfo {
  className: string;
  color: string;
  width: number;
}

interface NodeDrawInfo {
  className: string;
  color: string;
}

interface BaseDrawArgs {
  pixelX: number;
  pixelY: number;
  radius: number;
  row: number;
  column: number;
}

interface InputDrawArgs extends BaseDrawArgs {
  line: LineDrawInfo;
  inputs: NodeDrawInfo & { labels?: string[] | null };
  fontSize: string;
  fontClassName: string;
}

export function drawInput({
  pixelX,
  pixelY,
  radius,
  inputs,
  row,
  line,
  fontSize,
  fontClassName,
}: InputDrawArgs): string {
  let svg = `<rect
              x="${pixelX / 2 - radius}"
              y="${pixelY / 2 + row * pixelY - radius}"
              width="${2 * radius}"
              height="${2 * radius}"
              stroke="black"
              stroke-width="1"
              fill="${inputs.color}"
              class="${inputs.className}" />
            <line
              x1="${pixelX / 4}"
              y1="${pixelY / 2 + row * pixelY}"
              x2="${pixelX / 2 - radius}"
              y2="${pixelY / 2 + row * pixelY}"
              style="stroke:${line.color};stroke-width:${line.width}"
              class="${line.className}" />`;
  if (inputs.labels) {
    svg += `<text
              x="${pixelX / 8}"
              y="${pixelY / 2 + row * pixelY - 5}"
              fill="black"
              font-size="${fontSize}"
              class="${fontClassName}">${inputs.labels[row]}</text>`;
  }
  return svg;
}

export interface NeuronDrawArgs extends BaseDrawArgs {
  column: number;
  hidden: NodeDrawInfo;
}

export function drawNeuron({
  pixelX,
  pixelY,
  row,
  column,
  radius,
  hidden,
}: NeuronDrawArgs): string {
  return `<circle
            cx="${pixelX / 2 + column * pixelX}"
            cy="${pixelY / 2 + row * pixelY}"
            r="${radius}"
            stroke="black"
            stroke-width="1"
            fill="${hidden.color}"
            class="${hidden.className}" />`;
}

export interface OutputDrawArgs extends BaseDrawArgs {
  column: number;
  line: LineDrawInfo;
  outputs: NodeDrawInfo;
}

export function drawOutput({
  pixelX,
  pixelY,
  row,
  column,
  line,
  outputs,
  radius,
}: OutputDrawArgs): string {
  return `<circle
            cx="${pixelX / 2 + column * pixelX}"
            cy="${pixelY / 2 + row * pixelY}"
            r="${radius}"
            stroke="black"
            stroke-width="1"
            fill="${outputs.color}"
            class="${outputs.className}" />
          <line
            x1="${pixelX / 2 + column * pixelX + radius}"
            y1="${pixelY / 2 + row * pixelY}"
            x2="${pixelX / 2 + column * pixelX + pixelX / 4}"
            y2="${pixelY / 2 + row * pixelY}"
            style="stroke:${line.color};stroke-width:${line.width}"
            class="${line.className}" />`;
}

export interface BackwardConnectionsDrawArgs extends BaseDrawArgs {
  column: number;
  lineY: number;
  previousConnectionIndex: number;
  line: LineDrawInfo;
}

export function drawBackwardConnections({
  pixelX,
  pixelY,
  row,
  column,
  radius,
  lineY,
  line,
  previousConnectionIndex,
}: BackwardConnectionsDrawArgs): string {
  return `<line
            x1="${pixelX / 2 + (column - 1) * pixelX + radius}"
            y1="${lineY / 2 + previousConnectionIndex * lineY}"
            x2="${pixelX / 2 + column * pixelX - radius}"
            y2="${pixelY / 2 + row * pixelY}"
            style="stroke:${line.color};stroke-width:${line.width}"
            class="${line.className}" />`;
}

export interface NeuralNetworkDrawOptions {
  sizes: number[];
  height: number;
  width: number;
  radius: number;
  line: LineDrawInfo;
  inputs: NodeDrawInfo & { labels?: string[] | null };
  hidden: NodeDrawInfo;
  outputs: NodeDrawInfo;
  fontSize: string;
  fontClassName: string;
}

export function neuralNetworkToInnerSVG(
  options: NeuralNetworkDrawOptions
): string {
  const { sizes, height, width } = options;
  let svg = '';
  const pixelX = width / sizes.length;
  for (let column = 0; column < sizes.length; column++) {
    const size = sizes[column];
    const pixelY = height / size;
    for (let row = 0; row < size; row++) {
      if (column === 0) {
        svg += drawInput({ pixelX, pixelY, row, column, ...options });
      } else {
        if (column === sizes.length - 1) {
          svg += drawOutput({ pixelX, pixelY, row, column, ...options });
        } else {
          svg += drawNeuron({ pixelX, pixelY, row, column, ...options });
        }
        const previousSize = sizes[column - 1];
        const lineY = height / previousSize;
        for (
          let previousConnectionIndex = 0;
          previousConnectionIndex < previousSize;
          previousConnectionIndex++
        ) {
          svg += drawBackwardConnections({
            pixelX,
            pixelY,
            row,
            column,
            lineY,
            previousConnectionIndex,
            ...options,
          });
        }
      }
    }
  }
  return svg;
}

export interface RecurrentConnectionsDrawArgs extends BaseDrawArgs {
  column: number;
  recurrentLine: LineDrawInfo;
}

export function drawRecurrentConnections({
  pixelX,
  pixelY,
  row,
  column,
  radius,
  recurrentLine,
}: RecurrentConnectionsDrawArgs): string {
  const moveX = pixelX / 2 + column * pixelX + radius + 1;
  const moveY = pixelY / 2 + row * pixelY;
  const x = moveX - radius * 2 - 2;
  const y = moveY;
  const x1 = x + 100;
  const y1 = y + 50;
  const x2 = moveX - 100;
  const y2 = moveY + 50;
  return `<path
              d="M ${moveX} ${moveY} C ${x1} ${y1}, ${x2} ${y2}, ${x} ${y}"
              stroke="${recurrentLine.color}"
              stroke-width="${recurrentLine.width}"
              fill="transparent"
              stroke-linecap="round"
              marker-end="url(#arrow)"
              class="${recurrentLine.className}" />`;
}

export interface RecurrentNeuralNetworkDrawOptions
  extends NeuralNetworkDrawOptions {
  recurrentLine: LineDrawInfo;
}

export function rnnToInnerSVG(
  options: RecurrentNeuralNetworkDrawOptions
): string {
  const { width, height, recurrentLine, sizes, radius } = options;
  const pixelX = width / sizes.length;
  let svg = `<defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="${recurrentLine.color}" />
              </marker>
            </defs>`;
  svg += neuralNetworkToInnerSVG(options);
  for (let column = 1; column < sizes.length; column++) {
    const size = sizes[column];
    const pixelY = height / size;
    for (let row = 0; row < size; row++) {
      svg += drawRecurrentConnections({
        pixelX,
        pixelY,
        row,
        column,
        radius,
        recurrentLine,
      });
    }
  }
  return svg;
}

export function getFeedForwardLayers(network: FeedForward): ISimpleNet {
  const { options } = network;
  if (!options) {
    throw new Error('options not defined');
  }
  if (!options.inputLayer) {
    throw new Error('options.inputLater not defined');
  }
  if (!options.hiddenLayers) {
    throw new Error('options.hiddenLayers not defined');
  }
  if (options.hiddenLayers.length < 1) {
    throw new Error('options.hiddenLayers is empty');
  }
  if (!options.outputLayer) {
    throw new Error('options.outputLayer not defined');
  }
  const inputLayer = options.inputLayer();
  const hiddenLayers = [];
  hiddenLayers.push(options.hiddenLayers[0](inputLayer, 0));
  for (let i = 1; i < options.hiddenLayers.length; i++) {
    hiddenLayers.push(options.hiddenLayers[i](hiddenLayers[i - 1], i));
  }
  const outputLayer = options.outputLayer(
    hiddenLayers[hiddenLayers.length - 1],
    hiddenLayers.length
  );
  return {
    inputSize: inputLayer.height,
    hiddenLayers: hiddenLayers.map((hiddenLayer: ILayer) => hiddenLayer.height),
    outputSize: outputLayer.height,
  };
}

export function getRecurrentLayers(network: Recurrent): ISimpleNet {
  const hiddenLayers: ILayer[] = [];
  const { options } = network;
  if (!options.inputLayer) {
    throw new Error('inputLayer not defined');
  }
  if (!options.outputLayer) {
    throw new Error('outputLayer not defined');
  }
  const inputLayer = options.inputLayer();
  hiddenLayers.push(options.hiddenLayers[0](inputLayer, recurrentZeros(), 0));
  for (let i = 1; i < options.hiddenLayers.length; i++) {
    hiddenLayers.push(
      options.hiddenLayers[i](hiddenLayers[i - 1], recurrentZeros(), i)
    );
  }
  const outputLayer = options.outputLayer(
    hiddenLayers[hiddenLayers.length - 1],
    -1
  );
  return {
    inputSize: inputLayer.height,
    hiddenLayers: hiddenLayers.map((hiddenLayer: ILayer) => hiddenLayer.height),
    outputSize: outputLayer.height,
  };
}

export function wrapOuterSVG(
  svgBody: string,
  width: number,
  height: number
): string {
  // language=html
  return `<svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="${width}"
            height="${height}">${svgBody}</svg>`;
}

export function getNeuralNetworkJSONSizes(json: INeuralNetworkJSON): number[] {
  return json.sizes;
}

export function getNeuralNetworkSizes<
  InputType extends INeuralNetworkData,
  OutputType extends INeuralNetworkData
>(
  net:
    | NeuralNetwork<InputType, OutputType>
    | NeuralNetworkGPU<InputType, OutputType>
): number[] {
  const { options, sizes } = net;
  const { inputSize, outputSize, hiddenLayers } = options;
  if (!sizes) {
    if (typeof inputSize === 'number' && inputSize < 1) {
      throw new Error('inputSize not set');
    }
    if (typeof outputSize === 'number' && outputSize < 1) {
      throw new Error('outputSize not set');
    }
    if (hiddenLayers?.some((v) => v < 1)) {
      throw new Error('hiddenLayers not set');
    }
  }
  return typeof inputSize === 'number' &&
    Array.isArray(hiddenLayers) &&
    typeof outputSize === 'number'
    ? [inputSize].concat(hiddenLayers).concat([outputSize])
    : sizes;
}

export function getRNNSizes(
  net: RNN | LSTM | GRU | RNNTimeStep | LSTMTimeStep | GRUTimeStep | IRNNJSON
): number[] {
  const { options } = net;
  const { inputSize, outputSize, hiddenLayers } = options;
  return [inputSize].concat(hiddenLayers).concat([outputSize]);
}

export function defaultOptions(): RecurrentNeuralNetworkDrawOptions {
  return {
    line: {
      width: 0.5,
      color: 'black',
      className: 'connection',
    },
    recurrentLine: {
      width: 1,
      color: 'red',
      className: 'recurrence',
    },
    inputs: {
      color: 'rgba(0, 128, 0, 0.5)',
      labels: null,
      className: 'input',
    },
    outputs: {
      color: 'rgba(100, 149, 237, 0.5)',
      className: 'output',
    },
    hidden: {
      color: 'rgba(255, 127, 80, 0.5)',
      className: 'hidden-neuron',
    },
    fontSize: '14px',
    fontClassName: 'label',
    radius: 8,
    width: 400,
    height: 250,
    sizes: [],
  };
}

export interface ISimpleNet {
  inputSize: number;
  hiddenLayers: number[];
  outputSize: number;
}
export interface ISizes {
  sizes: number[];
}

export function toSVG<
  T extends
    | ISimpleNet
    | ISizes
    | Recurrent
    | FeedForward
    | IFeedForwardJSON
    | RNNTimeStep
    | IRNNTimeStepJSON
    | LSTMTimeStep
    | GRUTimeStep
    | RNN
    | IRNNJSON
    | GRU
    | LSTM
    | NeuralNetwork<InputType, OutputType>
    | INeuralNetworkJSON
    | NeuralNetworkGPU<InputType, OutputType>,
  InputType extends INeuralNetworkData,
  OutputType extends INeuralNetworkData
>(
  net: T,
  options?:
    | Partial<RecurrentNeuralNetworkDrawOptions>
    | Partial<NeuralNetworkDrawOptions>
): string {
  const mergedOptions = { ...defaultOptions(), ...options };
  const { width, height, inputs } = mergedOptions;

  // Get network size array for NeuralNetwork or NeuralNetworkGPU
  let sizes: number[] = [];
  if (net instanceof NeuralNetwork || net instanceof NeuralNetworkGPU) {
    // @ts-ignore
    sizes = getNeuralNetworkSizes(net);
  }
  // get network size for Recurrent
  else if (net instanceof Recurrent) {
    const { inputSize, hiddenLayers, outputSize } = getRecurrentLayers(net);
    sizes = [inputSize].concat(hiddenLayers).concat([outputSize]);
  }
  // get network size for FeedForward
  else if (net instanceof FeedForward) {
    const { inputSize, hiddenLayers, outputSize } = getFeedForwardLayers(net);
    sizes = [inputSize].concat(hiddenLayers).concat([outputSize]);
  }
  // handle json, recurrent first
  else if (
    net instanceof RNN ||
    net instanceof LSTM ||
    net instanceof GRU ||
    net instanceof RNNTimeStep ||
    net instanceof LSTMTimeStep ||
    net instanceof GRUTimeStep
  ) {
    return wrapOuterSVG(
      rnnToInnerSVG({
        ...mergedOptions,
        sizes: checkSizes(
          getRNNSizes(
            (net as unknown) as
              | RNN
              | LSTM
              | GRU
              | RNNTimeStep
              | LSTMTimeStep
              | GRUTimeStep
          ),
          inputs.labels
        ),
      }),
      width,
      height
    );
  }
  // handle json, NeuralNetwork
  else if (net.hasOwnProperty('type')) {
    switch ((net as INeuralNetworkJSON).type) {
      case 'NeuralNetwork':
      case 'NeuralNetworkGPU':
        return wrapOuterSVG(
          neuralNetworkToInnerSVG({
            ...mergedOptions,
            sizes: checkSizes(
              getNeuralNetworkJSONSizes(net as INeuralNetworkJSON),
              inputs.labels
            ),
          }),
          width,
          height
        );
      case 'RNN':
      case 'GRU':
      case 'LSTM':
      case 'RNNTimeStep':
      case 'GRUTimeStep':
      case 'LSTMTimeStep':
        return wrapOuterSVG(
          rnnToInnerSVG({
            ...mergedOptions,
            sizes: checkSizes(getRNNSizes(net as IRNNJSON), inputs.labels),
          }),
          width,
          height
        );
      default:
        throw new Error('unrecognized network');
    }
  } else if (
    net.hasOwnProperty('inputSize') &&
    net.hasOwnProperty('hiddenLayers') &&
    net.hasOwnProperty('outputSize')
  ) {
    const { inputSize, hiddenLayers, outputSize } = net as ISimpleNet;
    sizes = [inputSize, ...hiddenLayers, outputSize];
  } else if (net.hasOwnProperty('sizes')) {
    sizes = (net as ISizes).sizes;
  } else {
    throw new Error('unrecognized network');
  }
  return wrapOuterSVG(
    neuralNetworkToInnerSVG({
      ...mergedOptions,
      sizes: checkSizes(sizes, inputs.labels),
    }),
    width,
    height
  );
}

export function checkSizes(
  sizes: number[],
  labels: string[] | null | undefined
): number[] {
  if (!sizes) {
    throw new Error('sizes not set');
  }
  if (sizes.some((size: number) => size < 1)) {
    throw new Error('sizes not set correctly');
  }
  if (labels && labels.length !== sizes[0]) {
    throw new Error('not enough labels for inputs');
  }
  return sizes;
}
