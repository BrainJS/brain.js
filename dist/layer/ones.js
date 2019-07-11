'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ones2D = require('../utilities/ones-2d');
var zeros2D = require('../utilities/zeros-2d');
var Model = require('./types').Model;

var Ones = function (_Model) {
  _inherits(Ones, _Model);

  function Ones(settings) {
    _classCallCheck(this, Ones);

    var _this = _possibleConstructorReturn(this, (Ones.__proto__ || Object.getPrototypeOf(Ones)).call(this, settings));

    _this.validate();
    _this.weights = ones2D(_this.width, _this.height);
    _this.deltas = zeros2D(_this.width, _this.height);
    return _this;
  }

  return Ones;
}(Model);

module.exports = Ones;