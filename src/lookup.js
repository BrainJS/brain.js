/* Functions for turning sparse hashes into arrays and vice versa */
export default class lookup {
  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} hashes
   * @returns {Object}
   */
  static toTable(hashes) {
    const hash = hashes.reduce((memo, hash) => {
      return Object.assign(memo, hash);
    }, {});

    return lookup.toHash(hash);
  }

  static toInputTable(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      for (let p in data[dataIndex].input) {
        if (!table.hasOwnProperty(p)) {
          table[p] = tableIndex++;
        }
      }
    }
    return table;
  }

  static toOutputTable(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      for (let p in data[dataIndex].output) {
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
  static toHash(hash) {
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
   * @param {*} object
   * @param {*} arrayLength
   * @returns {Float32Array}
   */
  static toArray(lookup, object, arrayLength) {
    const result = new Float32Array(arrayLength);
    for (let p in lookup) {
      result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
    }
    return result;
  }

  static toArrayShort(lookup, object) {
    const result = [];
    for (let p in lookup) {
      if (!object.hasOwnProperty(p)) break;
      result[lookup[p]] = object[p];
    }
    return Float32Array.from(result);
  }

  static toArrays(lookup, objects, arrayLength) {
    const result = [];
    for (let i = 0; i < objects.length; i++) {
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
  static toObject(lookup, array) {
    const object = {};
    for (let p in lookup) {
      object[p] = array[lookup[p]];
    }
    return object;
  }

  static toObjectPartial(lookup, array, offset) {
    const object = {};
    let i = 0;
    for (let p in lookup) {
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
