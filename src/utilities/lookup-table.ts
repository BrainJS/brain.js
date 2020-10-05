import {
  ITrainingDatum,
  INumberHash,
  InputOutputValue,
  INumberObject,
} from '../lookup';

export type LookupTableProp = 'input' | 'output';

export class LookupTable {
  length: number;
  prop: LookupTableProp | null = null;
  table: INumberHash = {};
  constructor(
    data: ITrainingDatum[] | InputOutputValue[] | InputOutputValue[][],
    prop?: LookupTableProp
  ) {
    this.length = 0;
    const table = this.table;
    if (prop) {
      this.prop = prop;
      for (let i = 0; i < data.length; i++) {
        const datum = (data as ITrainingDatum[])[i];
        const object = datum[prop] as INumberObject;
        for (const p in object) {
          if (!object.hasOwnProperty(p)) continue;
          if (table.hasOwnProperty(p)) continue;
          table[p] = this.length++;
        }
      }
    } else if (Array.isArray(data) && Array.isArray(data[0])) {
      for (let i = 0; i < data.length; i++) {
        const array = (data as InputOutputValue[][])[i];
        for (let j = 0; j < array.length; j++) {
          const object = array[j];
          for (const p in object) {
            if (!object.hasOwnProperty(p)) continue;
            if (table.hasOwnProperty(p)) continue;
            table[p] = this.length++;
          }
        }
      }
    } else {
      for (let i = 0; i < data.length; i++) {
        const object = (data as INumberObject[])[i];
        for (const p in object) {
          if (!object.hasOwnProperty(p)) continue;
          if (table.hasOwnProperty(p)) continue;
          table[p] = this.length++;
        }
      }
    }
  }
}
