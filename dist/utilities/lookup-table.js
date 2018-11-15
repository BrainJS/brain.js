"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LookupTable;
function LookupTable(data, prop) {
  this.length = 0;
  this.prop = prop;
  var table = this.table = {};
  for (var i = 0; i < data.length; i++) {
    var datum = data[i];
    var object = datum[prop];
    for (var p in object) {
      if (table.hasOwnProperty(p)) continue;
      table[p] = this.length++;
    }
  }
};
//# sourceMappingURL=lookup-table.js.map