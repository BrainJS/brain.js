"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _types = require("./types");

var _zeros2d = require("../utilities/zeros-2d");

var _zeros2d2 = _interopRequireDefault(_zeros2d);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var RecurrentConnection = function (_Internal) {
  _inherits(RecurrentConnection, _Internal);

  function RecurrentConnection() {
    _classCallCheck(this, RecurrentConnection);

    return _possibleConstructorReturn(this, (RecurrentConnection.__proto__ || Object.getPrototypeOf(RecurrentConnection)).apply(this, arguments));
  }

  _createClass(RecurrentConnection, [{
    key: "setLayer",
    value: function setLayer(layer) {
      this.layer = layer;
    }
  }, {
    key: "predict",
    value: function predict() {}
  }, {
    key: "compare",
    value: function compare() {}
  }, {
    key: "learn",
    value: function learn() {
      this.layer.deltas = (0, _zeros2d2.default)(this.width, this.height);
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {}
  }, {
    key: "reuseKernels",
    value: function reuseKernels() {}
  }, {
    key: "width",
    get: function get() {
      return this.layer.width;
    },
    set: function set(value) {}
  }, {
    key: "height",
    get: function get() {
      return this.layer.height;
    },
    set: function set(value) {}
  }, {
    key: "deltas",
    get: function get() {
      return this.layer.deltas;
    },
    set: function set(deltas) {
      this.layer.deltas = deltas;
    }
  }, {
    key: "weights",
    get: function get() {
      return this.layer.weights;
    },
    set: function set(weights) {
      this.layer.weights = weights;
    }
  }]);

  return RecurrentConnection;
}(_types.Internal);

exports.default = RecurrentConnection;
//# sourceMappingURL=recurrent-connection.js.map