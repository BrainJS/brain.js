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
    const array = new Float32Array(arrayLength);
    for (let i in lookup) {
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
  static toObject(lookup, array) {
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

  static toTrainingData(data, inputTable, outputTable) {
    // turn sparse hash input into arrays with 0s as filler
    const convertInput = getTypedArrayFn(data[0].input, inputTable);
    const convertOutput = getTypedArrayFn(data[0].output, outputTable);
    const result = [];
    if (convertInput && convertOutput) {
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: convertInput(data[i].input),
          output: convertOutput(data[i].output),
        });
      }
    } else if (convertInput) {
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: convertInput(data[i].input),
          output: data[i].output
        });
      }
    } else if (convertOutput) {
      for (let i = 0; i < data.length; i++) {
        result.push({
          input: data[i].input,
          output: convertOutput(data[i].output)
        });
      }
    } else {
      return data;
    }
    return result;
  }
}

function getTypedArrayFn(value, table) {
  if (value.buffer instanceof ArrayBuffer) {
    return null;
  } else if (Array.isArray(value)) {
    return (v) => Float32Array.from(v);
  } else {
    const length = Object.keys(table).length;
    return (v) => {
      const array = new Float32Array(length);
      for (let p in table) {
        array[table[p]] = v[p] || 0;
      }
      return array;
    }
  }
}