'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = deepClone;
/* This was taken from http://jsben.ch/13YKQ */

function deepClone(o) {
  if ((typeof o === 'undefined' ? 'undefined' : _typeof(o)) !== 'object') return o;

  if (!o) return o;

  if (Object.prototype.toString.apply(o) === '[object Array]') {
    var newArray = [];
    var oLen = o.length;
    var _i = void 0;
    for (_i = 0; _i < oLen; _i++) {
      newArray.push(deepClone(o[_i]));
    }
    return newArray;
  }

  var newObject = {};
  var i = void 0;
  for (i in o) {
    if (o.hasOwnProperty(i)) {
      newObject[i] = deepClone(o[i]);
    }
  }
  return newObject;
}
//# sourceMappingURL=deepClone.js.map