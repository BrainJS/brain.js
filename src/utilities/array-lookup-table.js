function ArrayLookupTable(data, prop) {
  this.length = 0;
  this.prop = prop;
  const table = (this.table = {});
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    const input = datum[prop];
    for (let j = 0; j < input.length; j++) {
      for (const p in input[j]) {
        if (table.hasOwnProperty(p)) continue;
        table[p] = this.length++;
      }
    }
  }
}

module.exports = ArrayLookupTable;
