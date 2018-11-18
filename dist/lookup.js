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
      var result = new Float32Array(arrayLength);
      for (var p in lookup) {
        result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
      }
      return result;
    }
  }, {
    key: "toArrayShort",
    value: function toArrayShort(lookup, object) {
      var result = [];
      for (var p in lookup) {
        if (!object.hasOwnProperty(p)) break;
        result[lookup[p]] = object[p];
      }
      return Float32Array.from(result);
    }
  }, {
    key: "toArrays",
    value: function toArrays(lookup, objects, arrayLength) {
      var result = [];
      for (var i = 0; i < objects.length; i++) {
        result.push(this.toArray(lookup, objects[i], arrayLength));
      }
      return result;
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
      var object = {};
      for (var p in lookup) {
        object[p] = array[lookup[p]];
      }
      return object;
    }
  }, {
    key: "toObjectPartial",
    value: function toObjectPartial(lookup, array, offset) {
      var object = {};
      var i = 0;
      for (var p in lookup) {
        if (i++ < offset) continue;
        object[p] = array[lookup[p] - offset];
      }
      return object;
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