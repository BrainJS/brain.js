/* Functions for turning sparse hashes into arrays and vice versa */
class Lookup {
  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} hashes
   * @returns {Object}
   */
  static toTable(hashes) {
    const hash = hashes.reduce((memo, hash) => {
      return Object.assign(memo, hash);
    }, {});

    return Lookup.toHash(hash);
  }

  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} objects2D
   * @returns {Object}
   */
  static toTable2D(objects2D) {
    const table = {};
    let valueIndex = 0;
    for (let i = 0; i < objects2D.length; i++) {
      const objects = objects2D[i];
      for (let j = 0; j < objects.length; j++) {
        const object = objects[j];
        for (const p in object) {
          if (object.hasOwnProperty(p) && !table.hasOwnProperty(p)) {
            table[p] = valueIndex++;
          }
        }
      }
    }
    return table;
  }

  static toInputTable(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      for (const p in data[dataIndex].input) {
        if (!table.hasOwnProperty(p)) {
          table[p] = tableIndex++;
        }
      }
    }
    return table;
  }

  static toInputTable2D(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      const input = data[dataIndex].input;
      for (let i = 0; i < input.length; i++) {
        const object = input[i];
        for (const p in object) {
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }
    }
    return table;
  }

  static toOutputTable(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      for (const p in data[dataIndex].output) {
        if (!table.hasOwnProperty(p)) {
          table[p] = tableIndex++;
        }
      }
    }
    return table;
  }

  static toOutputTable2D(data) {
    const table = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      const output = data[dataIndex].output;
      for (let i = 0; i < output.length; i++) {
        const object = output[i];
        for (const p in object) {
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
  static toHash(hash) {
    const lookup = {};
    let index = 0;
    for (const i in hash) {
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
    for (const p in lookup) {
      result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
    }
    return result;
  }

  static toArrayShort(lookup, object) {
    const result = [];
    for (const p in lookup) {
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
    for (const p in lookup) {
      object[p] = array[lookup[p]];
    }
    return object;
  }

  static toObjectPartial(lookup, array, offset = 0, limit = 0) {
    const object = {};
    let i = 0;
    for (const p in lookup) {
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
  static lookupFromArray(array) {
    const lookup = {};
    let z = 0;
    let i = array.length;
    while (i-- > 0) {
      lookup[array[i]] = z++;
    }
    return lookup;
  }

  static dataShape(data) {
    const shape = [];

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

    let p;
    while (data) {
      for (p in data) {
        break;
      }
      if (!data.hasOwnProperty(p)) break;
      if (Array.isArray(data) || data.buffer instanceof ArrayBuffer) {
        shape.push('array');
        data = data[p];
      } else if (typeof data === 'object') {
        shape.push('object');
        data = data[p];
      } else {
        throw new Error('unhandled signature');
      }
    }
    shape.push(typeof data);
    return shape;
  }

  static addKeys(value, table) {
    if (Array.isArray(value)) return;
    table = table || {};
    let i = Object.keys(table).length;
    for (const p in value) {
      if (!value.hasOwnProperty(p)) continue;
      if (table.hasOwnProperty(p)) continue;
      table[p] = i++;
    }
    return table;
  }
}

module.exports = Lookup;
