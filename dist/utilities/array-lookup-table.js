"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = ArrayLookupTable;
function ArrayLookupTable(data, prop) {
  this.length = 0;
  this.prop = prop;
  var table = this.table = {};
  for (var i = 0; i < data.length; i++) {
    var datum = data[i];
    var input = datum[prop];
    for (var j = 0; j < input.length; j++) {
      for (var p in input[j]) {
        if (table.hasOwnProperty(p)) continue;
        table[p] = this.length++;
      }
    }
  }
};
//# sourceMappingURL=array-lookup-table.js.map