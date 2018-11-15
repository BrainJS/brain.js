"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Functions for turning sparse hashes into arrays and vice versa */
var lookup = function () {
  function lookup() {
    _classCallCheck(this, lookup);
  }

  _createClass(lookup, null, [{
    key: "toTable",

    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} hashes
     * @returns {Object}
     */
    value: function toTable(hashes) {
      var hash = hashes.reduce(function (memo, hash) {
        return Object.assign(memo, hash);
      }, {});

      return lookup.toHash(hash);
    }
  }, {
    key: "toInputTable",
    value: function toInputTable(data) {
      var table = {};
      var tableIndex = 0;
      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        for (var p in data[dataIndex].input) {
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }
      return table;
    }
  }, {
    key: "toOutputTable",
    value: function toOutputTable(data) {
      var table = {};
      var tableIndex = 0;
      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        for (var p in data[dataIndex].output) {
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }
      return table;
    }

    /**
     * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
     * @param {Object} hash
     * @returns {Object}
     */

  }, {
    key: "toHash",
    value: function toHash(hash) {
      var lookup = {};
      var index = 0;
      for (var i in hash) {
        lookup[i] = index++;
      }
      return lookup;
    }

    /**
     * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
     * @param {*} lookup
     * @param {*} object
     * @param {*} arrayLength
     * @returns {Float32Array}
     */

  }, {
    key: "toArray",
    value: function toArray(lookup, object, arrayLength) {
      var array = new Float32Array(arrayLength);
      for (var i in lookup) {
        array[lookup[i]] = object[i] || 0;
      }
      return array;
    }

    /**
     * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
     * @param {Object} lookup
     * @param {Array} array
     * @returns {Object}
     */

  }, {
    key: "toObject",
    value: function toObject(lookup, array) {
      var hash = {};
      for (var i in lookup) {
        hash[i] = array[lookup[i]];
      }
      return hash;
    }

    /**
     *
     * @param {Array} array
     * @returns {*}
     */

  }, {
    key: "lookupFromArray",
    value: function lookupFromArray(array) {
      var lookup = {};
      var z = 0;
      var i = array.length;
      while (i-- > 0) {
        lookup[array[i]] = z++;
      }
      return lookup;
    }
  }]);

  return lookup;
}();

exports.default = lookup;
//# sourceMappingURL=lookup.js.map