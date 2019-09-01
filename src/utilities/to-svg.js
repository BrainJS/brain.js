const NeuralNetwork = require('../neural-network');
const RNN = require('../recurrent/rnn');
const RNNTimeStep = require('../recurrent/rnn-time-step');
const { FeedForward } = require('../feed-forward');
const { Recurrent } = require('../recurrent');
const { recurrentZeros } = require('../layer/recurrent-zeros');

const recurrentJSONTypes = [
  'RNN',
  'LSTM',
  'GRU',
  'RNNTimeStep',
  'LSTMTimeStep',
  'GRUTimeStep',
  'Recurrent'
];

function drawInput({ pixelX, pixelY, radius, inputs, row, line, fontSize, fontClassName }) {
  let svg = `<rect
              x="${ pixelX / 2 - radius }"
              y="${ pixelY / 2 + row * pixelY - radius }"
              width="${ 2 * radius }"
              height="${ 2 * radius }"
              stroke="black"
              stroke-width="1"
              fill="${ inputs.color }" 
              class="${ inputs.className }" />
            <line
              x1="${ pixelX / 4 }"
              y1="${ pixelY / 2 + row * pixelY }"
              x2="${ pixelX / 2 - radius }"
              y2="${ pixelY / 2 + row * pixelY }"
              style="stroke:${ line.color };stroke-width:${ line.width }"
              class="${ line.className }" />`;
  if (inputs.labels) {
    svg += `<text
              x="${ pixelX / 8 }"
              y="${ pixelY / 2 + row * pixelY - 5 }"
              fill="black"
              font-size="${ fontSize }"
              class="${ fontClassName }">${ inputs.labels[row] }</text>`;
  }
  return svg;
}

function drawNeuron({ pixelX, pixelY, row, column, radius, hidden }) {
  return `<circle
            cx="${ pixelX / 2 + column * pixelX }"
            cy="${ pixelY / 2 + row * pixelY }"
            r="${ radius }"
            stroke="black"
            stroke-width="1"
            fill="${ hidden.color }"
            class="${ hidden.className }" />`
}

function drawOutput({ pixelX, pixelY, row, column, line, outputs, radius }) {
  return `<circle
            cx="${ pixelX / 2 + column * pixelX }"
            cy="${ pixelY / 2 + row * pixelY }"
            r="${ radius }"
            stroke="black"
            stroke-width="1"
            fill="${ outputs.color }"
            class="${ outputs.className }" />
          <line
            x1="${ pixelX / 2 + column * pixelX + radius }"
            y1="${ pixelY / 2 + row * pixelY }"
            x2="${ pixelX / 2 + column * pixelX + pixelX / 4 }"
            y2="${ pixelY / 2 + row * pixelY }"
            style="stroke:${ line.color };stroke-width:${ line.width }"
            class="${ line.className }" />`
}

function drawBackwardConnections({ pixelX, pixelY, row, column, radius, lineY, line, previousConnectionIndex }) {
  return `<line
            x1="${ pixelX / 2 + (column - 1) * pixelX + radius }"
            y1="${ lineY / 2 + previousConnectionIndex * lineY }"
            x2="${ pixelX / 2 + column * pixelX - radius }"
            y2="${ pixelY / 2 + row * pixelY }"
            style="stroke:${ line.color };stroke-width:${ line.width }"
            class="${ line.className }" />`;
}

function neuralNetworkToSVG(options) {
  const { sizes, height, width } = options;
  let svg = '';
  const pixelX = width / sizes.length;
  for (let column = 0; column < sizes.length; column++) {
    const size = sizes[column];
    const pixelY = height / size;
    for (let row = 0; row < size; row++) {
      if (column === 0) {
        svg += drawInput(Object.assign({ pixelX, pixelY, row, column }, options));
      } else {
        if (column === sizes.length - 1) {
          svg += drawOutput(Object.assign({ pixelX, pixelY, row, column }, options));
        } else {
          svg += drawNeuron(Object.assign({ pixelX, pixelY, row, column }, options));
        }
        const previousSize = sizes[column - 1];
        const lineY = height / previousSize;
        for (let previousConnectionIndex = 0; previousConnectionIndex < previousSize; previousConnectionIndex++) {
          svg += drawBackwardConnections(Object.assign({ pixelX, pixelY, row, column, lineY, previousConnectionIndex }, options));
        }
      }
    }
  }
  return svg;
}

function rnnToSVG(options) {
  const { width, height, recurrentLine, sizes, radius } = options;
  const pixelX = width / sizes.length;
  let svg = `<defs>
              <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                <path d="M0,0 L0,6 L9,3 z" fill="${ recurrentLine.color }" />
              </marker>
            </defs>`;
  svg += neuralNetworkToSVG(options);
  for (let column = 1; column < sizes.length; column++) {
    const size = sizes[column];
    const pixelY = height / size;
    for (let row = 0; row < size; row++) {
      svg += drawRecurrentConnections({ pixelX, pixelY, row, column, radius, recurrentLine });
    }
  }
  return svg;

  function drawRecurrentConnections({ pixelX, pixelY, row, column, radius, recurrentLine }) {
    const moveX = (pixelX / 2 + column * pixelX + radius) + 1;
    const moveY = pixelY / 2 + row * pixelY;
    const x = (moveX - (radius * 2)) - 2;
    const y = moveY;
    const x1 = x + 100;
    const y1 = y + 50;
    const x2 = moveX - 100;
    const y2 = moveY + 50;
    return `<path
              d="M ${ moveX } ${ moveY } C ${ x1 } ${ y1 }, ${ x2 } ${ y2 }, ${ x } ${ y }"
              stroke="${ recurrentLine.color }"
              stroke-width="${ recurrentLine.width }"
              fill="transparent"
              stroke-linecap="round"
              marker-end="url(#arrow)"
              class="${ recurrentLine.className }" />`;
  }
}

function getFeedForwardLayers(network) {
  const inputLayer = network.inputLayer();
  const hiddenLayers = [];
  hiddenLayers.push(network.hiddenLayers[0](inputLayer));
  for (let i = 1; i < network.hiddenLayers.length; i++) {
    hiddenLayers.push(network.hiddenLayers[i](hiddenLayers[i - 1]));
  }
  const outputLayer = network.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
  return {
    inputLayer,
    hiddenLayers,
    outputLayer,
    layerCount: 1 + hiddenLayers.length + 1
  };
}

function getRecurrentLayers(network) {
  const inputLayer = network.inputLayer();
  const hiddenLayers = [];
  hiddenLayers.push(network.hiddenLayers[0](inputLayer, recurrentZeros(), 0));
  for (let i = 1; i < network.hiddenLayers.length; i++) {
    hiddenLayers.push(network.hiddenLayers[i](hiddenLayers[i - 1], recurrentZeros(), i));
  }
  const outputLayer = network.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
  return {
    inputLayer,
    hiddenLayers,
    outputLayer,
    layerCount: 1 + hiddenLayers.length + 1
  };
}

function wrapSVG(svgBody, width, height) {
  return `<svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            version="1.1"
            width="${ width }"
            height="${ height }">${ svgBody }</svg>`;
}

function getSizes(object) {
  return (typeof object.inputSize === 'number'
    && Array.isArray(object.hiddenLayers)
    && object.hiddenLayers.every(l => typeof l === 'number')
    && typeof object.outputSize === 'number')
  ? [object.inputSize]
      .concat(object.hiddenLayers)
      .concat([object.outputSize])
  : null
}

function toSVG(net, options) {
  //default values
  const defaultOptions = {
    line: {
      width: 0.5,
      color: 'black',
      className: 'connection'
    },
    recurrentLine: {
      width: 1,
      color: 'red',
      className: 'recurrence'
    },
    inputs: {
      color:'rgba(0, 128, 0, 0.5)',
      labels: null,
      className: 'input'
    },
    outputs: {
      color:'rgba(100, 149, 237, 0.5)',
      className: 'output'
    },
    hidden: {
      color:'rgba(255, 127, 80, 0.5)',
      className: 'hidden-neuron'
    },
    fontSize: '14px',
    fontClassName: 'label',
    radius: 8,
    width: 400,
    height: 250
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const {
    width,
    height,
    inputs,
  } = mergedOptions;

  const isRNN = net.hasOwnProperty('model')
    || net instanceof Recurrent
    || (net.type && recurrentJSONTypes.indexOf(net.type) !== -1);

  // Get network size array for NeuralNetwork or NeuralNetworkGPU
  let sizes = null;
  if (
    net instanceof NeuralNetwork
    || net instanceof RNN
    || net instanceof RNNTimeStep
  ) {
    sizes = getSizes(net);
  }
  // Get network size array for NeuralNetwork json
  else if (net.sizes) {
    sizes = net.sizes;
  }
  // get network size for Recurrent
  else if (net instanceof Recurrent) {
    const { inputLayer, hiddenLayers, outputLayer } = getRecurrentLayers(net);
    sizes = [inputLayer.height]
      .concat(hiddenLayers.map(l => l.height))
      .concat([outputLayer.height]);
  }
  // get network size for FeedForward
  else if (net instanceof FeedForward) {
    const { inputLayer, hiddenLayers, outputLayer } = getFeedForwardLayers(net);
    sizes = [inputLayer.height]
      .concat(hiddenLayers.map(l => l.height))
      .concat([outputLayer.height]);
  }
  // handle json, recurrent first
  else if (isRNN) {
    if (net.options) {
      sizes = getSizes(net.options);
    }
  }
  // handle json, NeuralNetwork
  else {
    sizes = getSizes(net);
  }

  if (!sizes) throw new Error('sizes not set');

  if (inputs.labels && inputs.labels.length !== sizes[0]) throw new Error('not enough labels for inputs');

  if (isRNN) {
    return wrapSVG(rnnToSVG({ ...mergedOptions, sizes }), width, height);
  } else {
    return wrapSVG(neuralNetworkToSVG({ ...mergedOptions, sizes }), width, height);
  }
}

module.exports = toSVG;
