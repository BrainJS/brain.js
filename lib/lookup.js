'use strict';

/* Functions for turning sparse hashes into arrays and vice versa */
/**
 * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
 * @param {Object} hashes
 * @returns {Object}
 */
function buildLookup(hashes) {
  var hash = hashes.reduce(function(memo, hash) {
    return Object.assign(memo, hash);
  }, {});

  return lookupFromHash(hash);
}

/**
 * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
 * @param {Object} hash
 * @returns {Object}
 */
function lookupFromHash(hash) {
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
 * @param {*} hash
 * @returns {Array}
 */
function toArray(lookup, hash) {
  var array = [];
  for (var i in lookup) {
    array[lookup[i]] = hash[i] || 0;
  }
  return array;
}

/**
 * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
 * @param {Object} lookup
 * @param {Array} array
 * @returns {Object}
 */
function toHash(lookup, array) {
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
function lookupFromArray(array) {
  var lookup = {};
  var z = 0;
  var i = array.length;
  while (i-- > 0) {
    lookup[array[i]] = z++;
  }
  return lookup;
}

module.exports = {
  buildLookup: buildLookup,
  lookupFromHash: lookupFromHash,
  toArray: toArray,
  toHash: toHash,
  lookupFromArray: lookupFromArray
};
