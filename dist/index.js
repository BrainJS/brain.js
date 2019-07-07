'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _activation = require('./activation');

var _activation2 = _interopRequireDefault(_activation);

var _crossValidate = require('./cross-validate');

var _crossValidate2 = _interopRequireDefault(_crossValidate);

var _layer = require('./layer');

var layer = _interopRequireWildcard(_layer);

var _likely = require('./likely');

var _likely2 = _interopRequireDefault(_likely);

var _lookup = require('./lookup');

var _lookup2 = _interopRequireDefault(_lookup);

var _praxis = require('./praxis');

var _praxis2 = _interopRequireDefault(_praxis);

var _feedForward = require('./feed-forward');

var _feedForward2 = _interopRequireDefault(_feedForward);

var _neuralNetwork = require('./neural-network');

var _neuralNetwork2 = _interopRequireDefault(_neuralNetwork);

var _neuralNetworkGpu = require('./neural-network-gpu');

var _neuralNetworkGpu2 = _interopRequireDefault(_neuralNetworkGpu);

var _trainStream = require('./train-stream');

var _trainStream2 = _interopRequireDefault(_trainStream);

var _recurrent = require('./recurrent');

var _recurrent2 = _interopRequireDefault(_recurrent);

var _rnnTimeStep = require('./recurrent/rnn-time-step');

var _rnnTimeStep2 = _interopRequireDefault(_rnnTimeStep);

var _lstmTimeStep = require('./recurrent/lstm-time-step');

var _lstmTimeStep2 = _interopRequireDefault(_lstmTimeStep);

var _gruTimeStep = require('./recurrent/gru-time-step');

var _gruTimeStep2 = _interopRequireDefault(_gruTimeStep);

var _rnn = require('./recurrent/rnn');

var _rnn2 = _interopRequireDefault(_rnn);

var _lstm = require('./recurrent/lstm');

var _lstm2 = _interopRequireDefault(_lstm);

var _gru = require('./recurrent/gru');

var _gru2 = _interopRequireDefault(_gru);

var _max = require('./utilities/max');

var _max2 = _interopRequireDefault(_max);

var _mse = require('./utilities/mse');

var _mse2 = _interopRequireDefault(_mse);

var _ones = require('./utilities/ones');

var _ones2 = _interopRequireDefault(_ones);

var _random = require('./utilities/random');

var _random2 = _interopRequireDefault(_random);

var _randomWeight = require('./utilities/random-weight');

var _randomWeight2 = _interopRequireDefault(_randomWeight);

var _randos = require('./utilities/randos');

var _randos2 = _interopRequireDefault(_randos);

var _range = require('./utilities/range');

var _range2 = _interopRequireDefault(_range);

var _toArray = require('./utilities/to-array');

var _toArray2 = _interopRequireDefault(_toArray);

var _dataFormatter = require('./utilities/data-formatter');

var _dataFormatter2 = _interopRequireDefault(_dataFormatter);

var _zeros = require('./utilities/zeros');

var _zeros2 = _interopRequireDefault(_zeros);

var _feedForward3 = require('./layer/feed-forward');

var _feedForward4 = _interopRequireDefault(_feedForward3);

var _gru3 = require('./layer/gru');

var _gru4 = _interopRequireDefault(_gru3);

var _lstm3 = require('./layer/lstm');

var _lstm4 = _interopRequireDefault(_lstm3);

var _recurrent3 = require('./layer/recurrent');

var _recurrent4 = _interopRequireDefault(_recurrent3);

var _output = require('./layer/output');

var _output2 = _interopRequireDefault(_output);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

layer.feedForward = _feedForward4.default;

// layer deps

layer.gru = _gru4.default;
layer.lstm = _lstm4.default;
layer.recurrent = _recurrent4.default;
layer.output = _output2.default;

var brain = {
  activation: _activation2.default,
  crossValidate: _crossValidate2.default,
  likely: _likely2.default,
  layer: layer,
  lookup: _lookup2.default,
  praxis: _praxis2.default,
  FeedForward: _feedForward2.default,
  NeuralNetwork: _neuralNetwork2.default,
  NeuralNetworkGPU: _neuralNetworkGpu2.default,
  Recurrent: _recurrent2.default,
  TrainStream: _trainStream2.default,
  recurrent: {
    RNNTimeStep: _rnnTimeStep2.default,
    LSTMTimeStep: _lstmTimeStep2.default,
    GRUTimeStep: _gruTimeStep2.default,
    RNN: _rnn2.default,
    LSTM: _lstm2.default,
    GRU: _gru2.default
  },
  utilities: {
    max: _max2.default,
    mse: _mse2.default,
    ones: _ones2.default,
    random: _random2.default,
    randomWeight: _randomWeight2.default,
    randos: _randos2.default,
    range: _range2.default,
    toArray: _toArray2.default,
    DataFormatter: _dataFormatter2.default,
    zeros: _zeros2.default
  }
};

if (typeof window !== 'undefined') {
  window.brain = brain; //eslint-disable-line
}

exports.default = brain;