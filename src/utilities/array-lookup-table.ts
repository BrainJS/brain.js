export interface Table {
  [k: string]: number
}
export interface ArrayLookupTable {
  (): any
  length: number
  prop: string | number
  table: Table
}

const arrayLookupTable = function(this: ArrayLookupTable, data: string | any[], prop: string | number) {
  this.length = 0;
  this.prop = prop;
  const table: Table = this.table = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    const input = datum[prop];
    for (let j = 0; j < input.length; j++) {
      for (let p in input[j]) {
        if (table.hasOwnProperty(p)) continue;
        table[p] = this.length++;
      }
    }
  }
}

export default arrayLookupTable;
