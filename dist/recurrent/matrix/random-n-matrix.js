'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Matrix = require('.');
var randomN = require('../../utilities/random').randomN;

/**
 *
 * @param {Number} rows
 * @param {Number} columns
 * @param mu
 * @param std
 * @constructor
 */

var RandomNMatrix = function (_Matrix) {
  _inherits(RandomNMatrix, _Matrix);

  function RandomNMatrix(rows, columns, mu, std) {
    _classCallCheck(this, RandomNMatrix);

    var _this = _possibleConstructorReturn(this, (RandomNMatrix.__proto__ || Object.getPrototypeOf(RandomNMatrix)).call(this, rows, columns));

    _this.fillRandN(mu, std);
    return _this;
  }

  // fill matrix with random gaussian numbers


  _createClass(RandomNMatrix, [{
    key: 'fillRandN',
    value: function fillRandN(mu, std) {
      for (var i = 0, max = this.weights.length; i < max; i++) {
        this.weights[i] = randomN(mu, std);
      }
    }
  }]);

  return RandomNMatrix;
}(Matrix);

module.exports = RandomNMatrix;