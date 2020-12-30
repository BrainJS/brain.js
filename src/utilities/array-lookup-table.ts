export class ArrayLookupTable {
  length = 0;
  table: { [key: string]: number } = {};

  constructor(
    data: Array<{
      input: Array<Record<string, number>>;
      output: Array<Record<string, number>>;
    }>,
    public prop: 'input' | 'output'
  ) {
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      const ioValue = datum[prop];
      for (let j = 0; j < ioValue.length; j++) {
        const value = ioValue[j];
        for (const p in value) {
          if (!value.hasOwnProperty(p)) continue;
          if (this.table.hasOwnProperty(p)) continue;
          this.table[p] = this.length++;
        }
      }
    }
  }
}
