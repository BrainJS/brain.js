function LookupTable(data, prop) {
  this.length = 0;
  if (prop) {
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
  } else if (Array.isArray(data[0])) {
    const table = this.table = {};
    for (let i = 0; i < data.length; i++) {
      const array = data[i];
      for (let j = 0; j < array.length; j++) {
        const object = array[j];
        for (let p in object) {
          if (table.hasOwnProperty(p)) continue;
          table[p] = this.length++;
        }
      }
    }
  } else {
    const table = this.table = {};
    for (let i = 0; i < data.length; i++) {
      const object = data[i];
      for (let p in object) {
        if (table.hasOwnProperty(p)) continue;
        table[p] = this.length++;
      }
    }
  }
}

module.exports = LookupTable;
