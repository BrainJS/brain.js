export class ArrayLookupTable<TDatum extends { [key: string]: any[] }> {
  length = 0;
  table: any = {};

  constructor(data: TDatum[], public prop: keyof TDatum) {
    const table = (this.table = {});
    for (let i = 0; i < data.length; i++) {
      const datum = data[i];
      const input = datum[prop];
      for (let j = 0; j < input.length; j++) {
        for (const p in input[j]) {
          if (this.table.hasOwnProperty(p)) continue;
          this.table[p] = this.length++;
        }
      }
    }
  }
}
