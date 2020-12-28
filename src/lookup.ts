import { KernelOutput } from 'gpu.js';

export interface INumberHash {
  [character: string]: number;
}

export interface INumberArray {
  length: number;
  buffer?: ArrayBuffer;
  [index: number]: number;
}

export interface INumberObject {
  [name: string]: number;
}

export type InputOutputValue = INumberArray | INumberObject;

export interface ITrainingDatum {
  input: InputOutputValue | InputOutputValue[] | KernelOutput;
  output: InputOutputValue | InputOutputValue[] | KernelOutput;
}

export type FormattableData =
  | ITrainingDatum
  | ITrainingDatum[]
  | InputOutputValue
  | InputOutputValue[]
  | InputOutputValue[][];

/* Functions for turning sparse hashes into arrays and vice versa */
export const lookup = {
  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} hashes
   * @returns {Object}
   */
  toTable(hashes: INumberHash[]): INumberHash {
    const hash = hashes.reduce((memo, hash) => {
      return Object.assign(memo, hash);
    }, {});

    return lookup.toHash(hash);
  },

  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   */
  toTable2D(objects2D: INumberHash[][]): INumberHash {
    const table: INumberHash = {};
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
  },

  toInputTable2D(
    data: Array<{ input: Array<{ [key: string]: number }> }>
  ): INumberHash {
    const table: INumberHash = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      const input = data[dataIndex].input;
      for (let i = 0; i < input.length; i++) {
        const object = input[i];
        for (const p in object) {
          if (!object.hasOwnProperty(p)) continue;
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }
    }
    return table;
  },

  toOutputTable2D(
    data: Array<{ output: Array<{ [key: string]: number }> }>
  ): INumberHash {
    const table: INumberHash = {};
    let tableIndex = 0;
    for (let dataIndex = 0; dataIndex < data.length; dataIndex++) {
      const output = data[dataIndex].output;
      for (let i = 0; i < output.length; i++) {
        const object = output[i];
        for (const p in object) {
          if (!object.hasOwnProperty(p)) continue;
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }
    }
    return table;
  },

  /**
   * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
   */
  toHash(hash: INumberHash): INumberHash {
    const lookup: INumberHash = {};
    let index = 0;
    const keys = Object.keys(hash);
    for (let i = 0; i < keys.length; i++) {
      lookup[keys[i]] = index++;
    }
    return lookup;
  },

  /**
   * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
   */
  toArray(
    lookup: INumberHash,
    object: INumberObject,
    arrayLength: number
  ): Float32Array {
    const result = new Float32Array(arrayLength);
    for (const p in lookup) {
      if (!lookup.hasOwnProperty(p)) continue;
      result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
    }
    return result;
  },

  toArrayShort(lookup: INumberHash, object: INumberHash): Float32Array {
    const result = [];
    for (const p in lookup) {
      if (!lookup.hasOwnProperty(p)) continue;
      if (!object.hasOwnProperty(p)) break;
      result[lookup[p]] = object[p];
    }
    return Float32Array.from(result);
  },

  toArrays(
    lookup: INumberHash,
    objects: INumberHash[],
    arrayLength: number
  ): Float32Array[] {
    const result = [];
    for (let i = 0; i < objects.length; i++) {
      result.push(this.toArray(lookup, objects[i], arrayLength));
    }
    return result;
  },

  /**
   * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
   * @param {Object} lookup
   * @param {Array} array
   * @returns {Object}
   */
  toObject(lookup: INumberHash, array: number[] | Float32Array): INumberHash {
    const object: INumberHash = {};
    for (const p in lookup) {
      if (!lookup.hasOwnProperty(p)) continue;
      object[p] = array[lookup[p]];
    }
    return object;
  },

  toObjectPartial(
    lookup: INumberHash,
    array: number[] | Float32Array,
    offset = 0,
    limit = 0
  ): INumberHash {
    const object: INumberHash = {};
    let i = 0;
    for (const p in lookup) {
      if (!lookup.hasOwnProperty(p)) continue;
      if (offset > 0) {
        if (i++ < offset) continue;
      }
      if (limit > 0) {
        if (i++ >= limit) continue;
      }
      object[p] = array[lookup[p] - offset];
    }
    return object;
  },

  dataShape(data: FormattableData): string[] {
    const shape = [];
    let lastData:
      | InputOutputValue
      | InputOutputValue[]
      | InputOutputValue[][]
      | KernelOutput;
    if (data.hasOwnProperty('input')) {
      shape.push('datum');
      lastData = (data as ITrainingDatum).input;
    } else if (Array.isArray(data)) {
      if ((data as ITrainingDatum[])[0].input) {
        shape.push('array', 'datum');
        lastData = (data as ITrainingDatum[])[0].input;
      } else if (Array.isArray(data[0])) {
        shape.push('array');
        lastData = data[0];
      } else {
        lastData = data as
          | InputOutputValue
          | InputOutputValue[]
          | InputOutputValue[][];
      }
    } else {
      lastData = data as
        | InputOutputValue
        | InputOutputValue[]
        | InputOutputValue[][];
    }

    let p;
    while (lastData) {
      p = Object.keys(lastData)[0];
      if (
        Array.isArray(lastData) ||
        typeof (lastData as Float32Array).buffer === 'object'
      ) {
        shape.push('array');
        const possibleNumber:
          | number
          | INumberArray = (lastData as INumberArray[])[parseInt(p)];
        if (typeof possibleNumber === 'number') {
          shape.push('number');
          break;
        } else {
          lastData = possibleNumber;
        }
      } else if (
        typeof lastData === 'object' &&
        typeof (lastData as Float32Array).buffer !== 'object'
      ) {
        shape.push('object');
        const possibleNumber:
          | number
          | INumberObject = (lastData as INumberObject)[p];
        if (typeof possibleNumber === 'number') {
          shape.push('number');
          break;
        } else {
          lastData = possibleNumber;
        }
      } else {
        throw new Error('unhandled signature');
      }
    }
    return shape;
  },

  addKeys(value: number[] | INumberHash, table: INumberHash): INumberHash {
    if (Array.isArray(value)) return table;
    let i = Object.keys(table).length;
    for (const p in value) {
      if (!value.hasOwnProperty(p)) continue;
      if (table.hasOwnProperty(p)) continue;
      table[p] = i++;
    }
    return table;
  },
};
