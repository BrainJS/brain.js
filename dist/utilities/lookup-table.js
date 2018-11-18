"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = LookupTable;
function LookupTable(data, prop) {
  this.length = 0;
  if (prop) {
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
  } else {
    var _table = this.table = {};
    for (var _i = 0; _i < data.length; _i++) {
      var _object = data[_i];
      for (var _p in _object) {
        if (_table.hasOwnProperty(_p)) continue;
        _table[_p] = this.length++;
      }
    }
  }
};
//# sourceMappingURL=lookup-table.js.map