/* Functions for turning sparse hashes into arrays and vice versa */
export default class lookup {
  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} hashes
   * @returns {Object}
   */
  static buildLookup(hashes) {
    let hash = hashes.reduce((memo, hash) => {
      return Object.assign(memo, hash);
    }, {});

    return lookup.lookupFromHash(hash);
  }

  /**
   * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
   * @param {Object} hash
   * @returns {Object}
   */
  static lookupFromHash(hash) {
    let lookup = {};
    let index = 0;
    for (let i in hash) {
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
  static toArray(lookup, hash) {
    let array = [];
    for (let i in lookup) {
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
  static toHash(lookup, array) {
    let hash = {};
    for (let i in lookup) {
      hash[i] = array[lookup[i]];
    }
    return hash;
  }

  /**
   *
   * @param {Array} array
   * @returns {*}
   */
  static lookupFromArray(array) {
    let lookup = {};
    let z = 0;
    let i = array.length;
    while (i-- > 0) {
      lookup[array[i]] = z++;
    }
    return lookup;
  }
}