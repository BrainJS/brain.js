'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Base = require('./base');

var Activation = function (_Base) {
  _inherits(Activation, _Base);

  function Activation() {
    _classCallCheck(this, Activation);

    return _possibleConstructorReturn(this, (Activation.__proto__ || Object.getPrototypeOf(Activation)).apply(this, arguments));
  }

  return Activation;
}(Base);

var Internal = function Internal() {
  _classCallCheck(this, Internal);
};

var Filter = function (_Base2) {
  _inherits(Filter, _Base2);

  function Filter() {
    _classCallCheck(this, Filter);

    return _possibleConstructorReturn(this, (Filter.__proto__ || Object.getPrototypeOf(Filter)).apply(this, arguments));
  }

  return Filter;
}(Base);

var Model = function (_Base3) {
  _inherits(Model, _Base3);

  function Model() {
    _classCallCheck(this, Model);

    return _possibleConstructorReturn(this, (Model.__proto__ || Object.getPrototypeOf(Model)).apply(this, arguments));
  }

  return Model;
}(Base);

var Modifier = function (_Base4) {
  _inherits(Modifier, _Base4);

  function Modifier() {
    _classCallCheck(this, Modifier);

    return _possibleConstructorReturn(this, (Modifier.__proto__ || Object.getPrototypeOf(Modifier)).apply(this, arguments));
  }

  return Modifier;
}(Base);

var Operator = function (_Base5) {
  _inherits(Operator, _Base5);

  function Operator() {
    _classCallCheck(this, Operator);

    return _possibleConstructorReturn(this, (Operator.__proto__ || Object.getPrototypeOf(Operator)).apply(this, arguments));
  }

  return Operator;
}(Base);

module.exports = { Activation: Activation, Internal: Internal, Filter: Filter, Model: Model, Modifier: Modifier, Operator: Operator };