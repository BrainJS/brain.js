'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Functions for turning sparse hashes into arrays and vice versa */
var lookup = function () {
  function lookup() {
    _classCallCheck(this, lookup);
  }

  _createClass(lookup, null, [{
    key: 'toTable',

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

    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} objects2D
     * @returns {Object}
     */

  }, {
    key: 'toTable2D',
    value: function toTable2D(objects2D) {
      var table = {};
      var valueIndex = 0;
      for (var i = 0; i < objects2D.length; i++) {
        var objects = objects2D[i];
        for (var j = 0; j < objects.length; j++) {
          var object = objects[j];
          for (var p in object) {
            if (object.hasOwnProperty(p) && !table.hasOwnProperty(p)) {
              table[p] = valueIndex++;
            }
          }
        }
      }
      return table;
    }
  }, {
    key: 'toInputTable',
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
    key: 'toInputTable2D',
    value: function toInputTable2D(data) {
      var table = {};
      var tableIndex = 0;
      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        var input = data[dataIndex].input;
        for (var i = 0; i < input.length; i++) {
          var object = input[i];
          for (var p in object) {
            if (!table.hasOwnProperty(p)) {
              table[p] = tableIndex++;
            }
          }
        }
      }
      return table;
    }
  }, {
    key: 'toOutputTable',
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
  }, {
    key: 'toOutputTable2D',
    value: function toOutputTable2D(data) {
      var table = {};
      var tableIndex = 0;
      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        var output = data[dataIndex].output;
        for (var i = 0; i < output.length; i++) {
          var object = output[i];
          for (var p in object) {
            if (!table.hasOwnProperty(p)) {
              table[p] = tableIndex++;
            }
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
    key: 'toHash',
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
    key: 'toArray',
    value: function toArray(lookup, object, arrayLength) {
      var result = new Float32Array(arrayLength);
      for (var p in lookup) {
        result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
      }
      return result;
    }
  }, {
    key: 'toArrayShort',
    value: function toArrayShort(lookup, object) {
      var result = [];
      for (var p in lookup) {
        if (!object.hasOwnProperty(p)) break;
        result[lookup[p]] = object[p];
      }
      return Float32Array.from(result);
    }
  }, {
    key: 'toArrays',
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
    key: 'toObject',
    value: function toObject(lookup, array) {
      var object = {};
      for (var p in lookup) {
        object[p] = array[lookup[p]];
      }
      return object;
    }
  }, {
    key: 'toObjectPartial',
    value: function toObjectPartial(lookup, array) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

      var object = {};
      var i = 0;
      for (var p in lookup) {
        if (offset > 0) {
          if (i++ < offset) continue;
        }
        if (limit > 0) {
          if (i++ >= limit) continue;
        }
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
    key: 'lookupFromArray',
    value: function lookupFromArray(array) {
      var lookup = {};
      var z = 0;
      var i = array.length;
      while (i-- > 0) {
        lookup[array[i]] = z++;
      }
      return lookup;
    }
  }, {
    key: 'dataShape',
    value: function dataShape(data) {
      var shape = [];

      if (data.input) {
        shape.push('datum');
        data = data.input;
      } else if (Array.isArray(data)) {
        if (data[0].input) {
          shape.push('array', 'datum');
          data = data[0].input;
        } else {
          shape.push('array');
          data = data[0];
        }
      }

      var p = void 0;
      while (data) {
        for (p in data) {
          break;
        }
        if (!data.hasOwnProperty(p)) break;
        if (Array.isArray(data) || data.buffer instanceof ArrayBuffer) {
          shape.push('array');
          data = data[p];
        } else if ((typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object') {
          shape.push('object');
          data = data[p];
        } else {
          throw new Error('unhandled signature');
        }
      }
      shape.push(typeof data === 'undefined' ? 'undefined' : _typeof(data));
      return shape;
    }
  }, {
    key: 'addKeys',
    value: function addKeys(value, table) {
      if (Array.isArray(value)) return;
      table = table || {};
      var i = Object.keys(table).length;
      for (var p in value) {
        if (!value.hasOwnProperty(p)) continue;
        if (table.hasOwnProperty(p)) continue;
        table[p] = i++;
      }
      return table;
    }
  }]);

  return lookup;
}();

exports.default = lookup;
//# sourceMappingURL=lookup.js.map