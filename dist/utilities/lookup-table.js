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
  } else if (Array.isArray(data[0])) {
    var _table = this.table = {};
    for (var _i = 0; _i < data.length; _i++) {
      var array = data[_i];
      for (var j = 0; j < array.length; j++) {
        var _object = array[j];
        for (var _p in _object) {
          if (_table.hasOwnProperty(_p)) continue;
          _table[_p] = this.length++;
        }
      }
    }
  } else {
    var _table2 = this.table = {};
    for (var _i2 = 0; _i2 < data.length; _i2++) {
      var _object2 = data[_i2];
      for (var _p2 in _object2) {
        if (_table2.hasOwnProperty(_p2)) continue;
        _table2[_p2] = this.length++;
      }
    }
  }
};
//# sourceMappingURL=lookup-table.js.map