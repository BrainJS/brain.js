"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* Functions for turning sparse hashes into arrays and vice versa */
var lookup = function () {
  function lookup() {
    _classCallCheck(this, lookup);
  }

  _createClass(lookup, null, [{
    key: "buildLookup",

    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} hashes
     * @returns {Object}
     */
    value: function buildLookup(hashes) {
      var reducedHash = hashes.reduce(function (memo, hash) {
        return Object.assign(memo, hash);
      }, {});

      return lookup.lookupFromHash(reducedHash);
    }

    /**
     * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
     * @param {Object} hash
     * @returns {Object}
     */

  }, {
    key: "lookupFromHash",
    value: function lookupFromHash(hash) {
      var lookupHash = {};
      var index = 0;

      Object.keys(hash).forEach(function (i) {
        index += 1;
        lookupHash[i] = index;
      });

      return lookupHash;
    }

    /**
     * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
     * @param {*} lookup
     * @param {*} hash
     * @returns {Array}
     */

  }, {
    key: "toArray",
    value: function toArray(lookupHash, hash) {
      var array = [];

      Object.keys(lookupHash).forEach(function (i) {
        array[lookupHash[i]] = hash[i] || 0;
      });

      return array;
    }

    /**
     * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
     * @param {Object} lookupHash
     * @param {Array} array
     * @returns {Object}
     */

  }, {
    key: "toHash",
    value: function toHash(lookupHash, array) {
      var hash = {};

      Object.keys(lookupHash).forEach(function (i) {
        hash[i] = array[lookupHash[i]];
      });

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
      var lookupHash = {};
      var z = 0;
      var i = array.length;

      while (i-- > 0) {
        lookupHash[array[i]] = z++;
      }

      return lookupHash;
    }
  }]);

  return lookup;
}();

module.exports = lookup;