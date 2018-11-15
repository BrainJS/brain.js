export default function LookupTable(data, prop) {
  this.length = 0;
  this.prop = prop;
  const table = this.table = {};
  for (let i = 0; i < data.length; i++) {
    const datum = data[i];
    const object = datum[prop];
    for (let p in object) {
      if (table.hasOwnProperty(p)) continue;
      table[p] = this.length++;
    }
  }
};