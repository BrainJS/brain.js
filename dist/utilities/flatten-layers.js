'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flattenLayers;

var _traverseLayersFrom = require('./traverse-layers-from');

var _traverseLayersFrom2 = _interopRequireDefault(_traverseLayersFrom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function flattenLayers(layers) {
  var result = layers.slice(0);

  var _loop = function _loop(i) {
    var offset = 0;
    (0, _traverseLayersFrom2.default)(result[i], function (layer) {
      if (result.indexOf(layer) === -1) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  };

  for (var i = 0; i < result.length; i++) {
    _loop(i);
  }
  return result;
}
//# sourceMappingURL=flatten-layers.js.map