'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var require$$0 = require('gpu.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var require$$0__default = /*#__PURE__*/_interopDefaultLegacy(require$$0);

/**
 * Relu Activation, aka Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 */
function activate(weight) {
  return Math.max(0, weight);
}
/**
 * Relu derivative
 */

function measure(weight, delta) {
  if (weight <= 0) {
    return 0;
  }

  return delta;
}

var relu = /*#__PURE__*/Object.freeze({
  __proto__: null,
  activate: activate,
  measure: measure
});

/**
 * sigmoid activation
 */
function activate$1(value) {
  return 1 / (1 + Math.exp(-value));
}
/**
 * sigmoid derivative
 */

function measure$1(weight, error) {
  return weight * (1 - weight) * error;
}

var sigmoid = /*#__PURE__*/Object.freeze({
  __proto__: null,
  activate: activate$1,
  measure: measure$1
});

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, basedir, module) {
	return module = {
	  path: basedir,
	  exports: {},
	  require: function (path, base) {
      return commonjsRequire(path, (base === undefined || base === null) ? module.path : base);
    }
	}, fn(module, module.exports), module.exports;
}

function commonjsRequire () {
	throw new Error('Dynamic requires are not currently supported by @rollup/plugin-commonjs');
}

var _global = createCommonjsModule(function (module) {
// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
var global = module.exports = typeof window != 'undefined' && window.Math == Math
  ? window : typeof self != 'undefined' && self.Math == Math ? self
  // eslint-disable-next-line no-new-func
  : Function('return this')();
if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
});

var _core = createCommonjsModule(function (module) {
var core = module.exports = { version: '2.6.11' };
if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
});

var _isObject = function (it) {
  return typeof it === 'object' ? it !== null : typeof it === 'function';
};

var _anObject = function (it) {
  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
  return it;
};

var _fails = function (exec) {
  try {
    return !!exec();
  } catch (e) {
    return true;
  }
};

// Thank's IE8 for his funny defineProperty
var _descriptors = !_fails(function () {
  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
});

var document$1 = _global.document;
// typeof document.createElement is 'object' in old IE
var is = _isObject(document$1) && _isObject(document$1.createElement);
var _domCreate = function (it) {
  return is ? document$1.createElement(it) : {};
};

var _ie8DomDefine = !_descriptors && !_fails(function () {
  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
});

// 7.1.1 ToPrimitive(input [, PreferredType])

// instead of the ES6 spec version, we didn't implement @@toPrimitive case
// and the second argument - flag - preferred type is a string
var _toPrimitive = function (it, S) {
  if (!_isObject(it)) return it;
  var fn, val;
  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
  throw TypeError("Can't convert object to primitive value");
};

var dP = Object.defineProperty;

var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
  _anObject(O);
  P = _toPrimitive(P, true);
  _anObject(Attributes);
  if (_ie8DomDefine) try {
    return dP(O, P, Attributes);
  } catch (e) { /* empty */ }
  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
  if ('value' in Attributes) O[P] = Attributes.value;
  return O;
};

var _objectDp = {
	f: f
};

var _propertyDesc = function (bitmap, value) {
  return {
    enumerable: !(bitmap & 1),
    configurable: !(bitmap & 2),
    writable: !(bitmap & 4),
    value: value
  };
};

var _hide = _descriptors ? function (object, key, value) {
  return _objectDp.f(object, key, _propertyDesc(1, value));
} : function (object, key, value) {
  object[key] = value;
  return object;
};

var hasOwnProperty = {}.hasOwnProperty;
var _has = function (it, key) {
  return hasOwnProperty.call(it, key);
};

var id = 0;
var px = Math.random();
var _uid = function (key) {
  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
};

var _library = false;

var _shared = createCommonjsModule(function (module) {
var SHARED = '__core-js_shared__';
var store = _global[SHARED] || (_global[SHARED] = {});

(module.exports = function (key, value) {
  return store[key] || (store[key] = value !== undefined ? value : {});
})('versions', []).push({
  version: _core.version,
  mode:  'global',
  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
});
});

var _functionToString = _shared('native-function-to-string', Function.toString);

var _redefine = createCommonjsModule(function (module) {
var SRC = _uid('src');

var TO_STRING = 'toString';
var TPL = ('' + _functionToString).split(TO_STRING);

_core.inspectSource = function (it) {
  return _functionToString.call(it);
};

(module.exports = function (O, key, val, safe) {
  var isFunction = typeof val == 'function';
  if (isFunction) _has(val, 'name') || _hide(val, 'name', key);
  if (O[key] === val) return;
  if (isFunction) _has(val, SRC) || _hide(val, SRC, O[key] ? '' + O[key] : TPL.join(String(key)));
  if (O === _global) {
    O[key] = val;
  } else if (!safe) {
    delete O[key];
    _hide(O, key, val);
  } else if (O[key]) {
    O[key] = val;
  } else {
    _hide(O, key, val);
  }
// add fake Function#toString for correct work wrapped methods / constructors with methods like LoDash isNative
})(Function.prototype, TO_STRING, function toString() {
  return typeof this == 'function' && this[SRC] || _functionToString.call(this);
});
});

var _aFunction = function (it) {
  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
  return it;
};

// optional / simple context binding

var _ctx = function (fn, that, length) {
  _aFunction(fn);
  if (that === undefined) return fn;
  switch (length) {
    case 1: return function (a) {
      return fn.call(that, a);
    };
    case 2: return function (a, b) {
      return fn.call(that, a, b);
    };
    case 3: return function (a, b, c) {
      return fn.call(that, a, b, c);
    };
  }
  return function (/* ...args */) {
    return fn.apply(that, arguments);
  };
};

var PROTOTYPE = 'prototype';

var $export = function (type, name, source) {
  var IS_FORCED = type & $export.F;
  var IS_GLOBAL = type & $export.G;
  var IS_STATIC = type & $export.S;
  var IS_PROTO = type & $export.P;
  var IS_BIND = type & $export.B;
  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] || (_global[name] = {}) : (_global[name] || {})[PROTOTYPE];
  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
  var expProto = exports[PROTOTYPE] || (exports[PROTOTYPE] = {});
  var key, own, out, exp;
  if (IS_GLOBAL) source = name;
  for (key in source) {
    // contains in native
    own = !IS_FORCED && target && target[key] !== undefined;
    // export native or passed
    out = (own ? target : source)[key];
    // bind timers to global for call from export context
    exp = IS_BIND && own ? _ctx(out, _global) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
    // extend global
    if (target) _redefine(target, key, out, type & $export.U);
    // export
    if (exports[key] != out) _hide(exports, key, exp);
    if (IS_PROTO && expProto[key] != out) expProto[key] = out;
  }
};
_global.core = _core;
// type bitmap
$export.F = 1;   // forced
$export.G = 2;   // global
$export.S = 4;   // static
$export.P = 8;   // proto
$export.B = 16;  // bind
$export.W = 32;  // wrap
$export.U = 64;  // safe
$export.R = 128; // real proto method for `library`
var _export = $export;

// 20.2.2.14 Math.expm1(x)
var $expm1 = Math.expm1;
var _mathExpm1 = (!$expm1
  // Old FF bug
  || $expm1(10) > 22025.465794806719 || $expm1(10) < 22025.4657948067165168
  // Tor Browser bug
  || $expm1(-2e-17) != -2e-17
) ? function expm1(x) {
  return (x = +x) == 0 ? x : x > -1e-6 && x < 1e-6 ? x + x * x / 2 : Math.exp(x) - 1;
} : $expm1;

// 20.2.2.33 Math.tanh(x)


var exp = Math.exp;

_export(_export.S, 'Math', {
  tanh: function tanh(x) {
    var a = _mathExpm1(x = +x);
    var b = _mathExpm1(-x);
    return a == Infinity ? 1 : b == Infinity ? -1 : (a - b) / (exp(x) + exp(-x));
  }
});

/**
 * Hyperbolic tan
 */
function activate$2(weight) {
  return Math.tanh(weight);
}
/**
 * @description grad for z = tanh(x) is (1 - z^2)
 */

function measure$2(weight, error) {
  return (1 - weight * weight) * error;
}

var tanh = /*#__PURE__*/Object.freeze({
  __proto__: null,
  activate: activate$2,
  measure: measure$2
});

/**
 * Leaky Relu Activation, aka Leaky Rectified Linear Unit Activation
 * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
 */
function activate$3(weight) {
  return weight > 0 ? weight : 0.01 * weight;
}
/**
 * Leaky Relu derivative
 */

function measure$3(weight, error) {
  return weight > 0 ? error : 0.01 * error;
}

var leakyRelu = /*#__PURE__*/Object.freeze({
  __proto__: null,
  activate: activate$3,
  measure: measure$3
});

var activation = /*#__PURE__*/Object.freeze({
  __proto__: null,
  relu: relu,
  sigmoid: sigmoid,
  tanh: tanh,
  leakyRelu: leakyRelu
});

var _wks = createCommonjsModule(function (module) {
var store = _shared('wks');

var Symbol = _global.Symbol;
var USE_SYMBOL = typeof Symbol == 'function';

var $exports = module.exports = function (name) {
  return store[name] || (store[name] =
    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
};

$exports.store = store;
});

// 22.1.3.31 Array.prototype[@@unscopables]
var UNSCOPABLES = _wks('unscopables');
var ArrayProto = Array.prototype;
if (ArrayProto[UNSCOPABLES] == undefined) _hide(ArrayProto, UNSCOPABLES, {});
var _addToUnscopables = function (key) {
  ArrayProto[UNSCOPABLES][key] = true;
};

var _iterStep = function (done, value) {
  return { value: value, done: !!done };
};

var _iterators = {};

var toString = {}.toString;

var _cof = function (it) {
  return toString.call(it).slice(8, -1);
};

// fallback for non-array-like ES3 and non-enumerable old V8 strings

// eslint-disable-next-line no-prototype-builtins
var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
  return _cof(it) == 'String' ? it.split('') : Object(it);
};

// 7.2.1 RequireObjectCoercible(argument)
var _defined = function (it) {
  if (it == undefined) throw TypeError("Can't call method on  " + it);
  return it;
};

// to indexed object, toObject with fallback for non-array-like ES3 strings


var _toIobject = function (it) {
  return _iobject(_defined(it));
};

// 7.1.4 ToInteger
var ceil = Math.ceil;
var floor = Math.floor;
var _toInteger = function (it) {
  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
};

// 7.1.15 ToLength

var min = Math.min;
var _toLength = function (it) {
  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
};

var max = Math.max;
var min$1 = Math.min;
var _toAbsoluteIndex = function (index, length) {
  index = _toInteger(index);
  return index < 0 ? max(index + length, 0) : min$1(index, length);
};

// false -> Array#indexOf
// true  -> Array#includes



var _arrayIncludes = function (IS_INCLUDES) {
  return function ($this, el, fromIndex) {
    var O = _toIobject($this);
    var length = _toLength(O.length);
    var index = _toAbsoluteIndex(fromIndex, length);
    var value;
    // Array#includes uses SameValueZero equality algorithm
    // eslint-disable-next-line no-self-compare
    if (IS_INCLUDES && el != el) while (length > index) {
      value = O[index++];
      // eslint-disable-next-line no-self-compare
      if (value != value) return true;
    // Array#indexOf ignores holes, Array#includes - not
    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
      if (O[index] === el) return IS_INCLUDES || index || 0;
    } return !IS_INCLUDES && -1;
  };
};

var shared = _shared('keys');

var _sharedKey = function (key) {
  return shared[key] || (shared[key] = _uid(key));
};

var arrayIndexOf = _arrayIncludes(false);
var IE_PROTO = _sharedKey('IE_PROTO');

var _objectKeysInternal = function (object, names) {
  var O = _toIobject(object);
  var i = 0;
  var result = [];
  var key;
  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
  // Don't enum bug & hidden keys
  while (names.length > i) if (_has(O, key = names[i++])) {
    ~arrayIndexOf(result, key) || result.push(key);
  }
  return result;
};

// IE 8- don't enum bug keys
var _enumBugKeys = (
  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
).split(',');

// 19.1.2.14 / 15.2.3.14 Object.keys(O)



var _objectKeys = Object.keys || function keys(O) {
  return _objectKeysInternal(O, _enumBugKeys);
};

var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
  _anObject(O);
  var keys = _objectKeys(Properties);
  var length = keys.length;
  var i = 0;
  var P;
  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
  return O;
};

var document$2 = _global.document;
var _html = document$2 && document$2.documentElement;

// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



var IE_PROTO$1 = _sharedKey('IE_PROTO');
var Empty = function () { /* empty */ };
var PROTOTYPE$1 = 'prototype';

// Create object with fake `null` prototype: use iframe Object with cleared prototype
var createDict = function () {
  // Thrash, waste and sodomy: IE GC bug
  var iframe = _domCreate('iframe');
  var i = _enumBugKeys.length;
  var lt = '<';
  var gt = '>';
  var iframeDocument;
  iframe.style.display = 'none';
  _html.appendChild(iframe);
  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
  // createDict = iframe.contentWindow.Object;
  // html.removeChild(iframe);
  iframeDocument = iframe.contentWindow.document;
  iframeDocument.open();
  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
  iframeDocument.close();
  createDict = iframeDocument.F;
  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
  return createDict();
};

var _objectCreate = Object.create || function create(O, Properties) {
  var result;
  if (O !== null) {
    Empty[PROTOTYPE$1] = _anObject(O);
    result = new Empty();
    Empty[PROTOTYPE$1] = null;
    // add "__proto__" for Object.getPrototypeOf polyfill
    result[IE_PROTO$1] = O;
  } else result = createDict();
  return Properties === undefined ? result : _objectDps(result, Properties);
};

var def = _objectDp.f;

var TAG = _wks('toStringTag');

var _setToStringTag = function (it, tag, stat) {
  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
};

var IteratorPrototype = {};

// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

var _iterCreate = function (Constructor, NAME, next) {
  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
  _setToStringTag(Constructor, NAME + ' Iterator');
};

// 7.1.13 ToObject(argument)

var _toObject = function (it) {
  return Object(_defined(it));
};

// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


var IE_PROTO$2 = _sharedKey('IE_PROTO');
var ObjectProto = Object.prototype;

var _objectGpo = Object.getPrototypeOf || function (O) {
  O = _toObject(O);
  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
    return O.constructor.prototype;
  } return O instanceof Object ? ObjectProto : null;
};

var ITERATOR = _wks('iterator');
var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
var FF_ITERATOR = '@@iterator';
var KEYS = 'keys';
var VALUES = 'values';

var returnThis = function () { return this; };

var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
  _iterCreate(Constructor, NAME, next);
  var getMethod = function (kind) {
    if (!BUGGY && kind in proto) return proto[kind];
    switch (kind) {
      case KEYS: return function keys() { return new Constructor(this, kind); };
      case VALUES: return function values() { return new Constructor(this, kind); };
    } return function entries() { return new Constructor(this, kind); };
  };
  var TAG = NAME + ' Iterator';
  var DEF_VALUES = DEFAULT == VALUES;
  var VALUES_BUG = false;
  var proto = Base.prototype;
  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
  var $default = $native || getMethod(DEFAULT);
  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
  var methods, key, IteratorPrototype;
  // Fix native
  if ($anyNative) {
    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
      // Set @@toStringTag to native iterators
      _setToStringTag(IteratorPrototype, TAG, true);
      // fix for some old engines
      if ( typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
    }
  }
  // fix Array#{values, @@iterator}.name in V8 / FF
  if (DEF_VALUES && $native && $native.name !== VALUES) {
    VALUES_BUG = true;
    $default = function values() { return $native.call(this); };
  }
  // Define iterator
  if ( (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
    _hide(proto, ITERATOR, $default);
  }
  // Plug for library
  _iterators[NAME] = $default;
  _iterators[TAG] = returnThis;
  if (DEFAULT) {
    methods = {
      values: DEF_VALUES ? $default : getMethod(VALUES),
      keys: IS_SET ? $default : getMethod(KEYS),
      entries: $entries
    };
    if (FORCED) for (key in methods) {
      if (!(key in proto)) _redefine(proto, key, methods[key]);
    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
  }
  return methods;
};

// 22.1.3.4 Array.prototype.entries()
// 22.1.3.13 Array.prototype.keys()
// 22.1.3.29 Array.prototype.values()
// 22.1.3.30 Array.prototype[@@iterator]()
var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
  this._t = _toIobject(iterated); // target
  this._i = 0;                   // next index
  this._k = kind;                // kind
// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var kind = this._k;
  var index = this._i++;
  if (!O || index >= O.length) {
    this._t = undefined;
    return _iterStep(1);
  }
  if (kind == 'keys') return _iterStep(0, index);
  if (kind == 'values') return _iterStep(0, O[index]);
  return _iterStep(0, [index, O[index]]);
}, 'values');

// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
_iterators.Arguments = _iterators.Array;

_addToUnscopables('keys');
_addToUnscopables('values');
_addToUnscopables('entries');

var ITERATOR$1 = _wks('iterator');
var TO_STRING_TAG = _wks('toStringTag');
var ArrayValues = _iterators.Array;

var DOMIterables = {
  CSSRuleList: true, // TODO: Not spec compliant, should be false.
  CSSStyleDeclaration: false,
  CSSValueList: false,
  ClientRectList: false,
  DOMRectList: false,
  DOMStringList: false,
  DOMTokenList: true,
  DataTransferItemList: false,
  FileList: false,
  HTMLAllCollection: false,
  HTMLCollection: false,
  HTMLFormElement: false,
  HTMLSelectElement: false,
  MediaList: true, // TODO: Not spec compliant, should be false.
  MimeTypeArray: false,
  NamedNodeMap: false,
  NodeList: true,
  PaintRequestList: false,
  Plugin: false,
  PluginArray: false,
  SVGLengthList: false,
  SVGNumberList: false,
  SVGPathSegList: false,
  SVGPointList: false,
  SVGStringList: false,
  SVGTransformList: false,
  SourceBufferList: false,
  StyleSheetList: true, // TODO: Not spec compliant, should be false.
  TextTrackCueList: false,
  TextTrackList: false,
  TouchList: false
};

for (var collections = _objectKeys(DOMIterables), i = 0; i < collections.length; i++) {
  var NAME = collections[i];
  var explicit = DOMIterables[NAME];
  var Collection = _global[NAME];
  var proto = Collection && Collection.prototype;
  var key;
  if (proto) {
    if (!proto[ITERATOR$1]) _hide(proto, ITERATOR$1, ArrayValues);
    if (!proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
    _iterators[NAME] = ArrayValues;
    if (explicit) for (key in es6_array_iterator) if (!proto[key]) _redefine(proto, key, es6_array_iterator[key], true);
  }
}

// getting tag from 19.1.3.6 Object.prototype.toString()

var TAG$1 = _wks('toStringTag');
// ES3 wrong here
var ARG = _cof(function () { return arguments; }()) == 'Arguments';

// fallback for IE11 Script Access Denied error
var tryGet = function (it, key) {
  try {
    return it[key];
  } catch (e) { /* empty */ }
};

var _classof = function (it) {
  var O, T, B;
  return it === undefined ? 'Undefined' : it === null ? 'Null'
    // @@toStringTag case
    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
    // builtinTag case
    : ARG ? _cof(O)
    // ES3 arguments fallback
    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
};

// 19.1.3.6 Object.prototype.toString()

var test = {};
test[_wks('toStringTag')] = 'z';
if (test + '' != '[object z]') {
  _redefine(Object.prototype, 'toString', function toString() {
    return '[object ' + _classof(this) + ']';
  }, true);
}

// most Object methods by ES6 should accept primitives



var _objectSap = function (KEY, exec) {
  var fn = (_core.Object || {})[KEY] || Object[KEY];
  var exp = {};
  exp[KEY] = exec(fn);
  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
};

// 19.1.2.14 Object.keys(O)



_objectSap('keys', function () {
  return function keys(it) {
    return _objectKeys(_toObject(it));
  };
});

var f$1 = Object.getOwnPropertySymbols;

var _objectGops = {
	f: f$1
};

var f$2 = {}.propertyIsEnumerable;

var _objectPie = {
	f: f$2
};

// 19.1.2.1 Object.assign(target, source, ...)






var $assign = Object.assign;

// should work with symbols and should have deterministic property order (V8 bug)
var _objectAssign = !$assign || _fails(function () {
  var A = {};
  var B = {};
  // eslint-disable-next-line no-undef
  var S = Symbol();
  var K = 'abcdefghijklmnopqrst';
  A[S] = 7;
  K.split('').forEach(function (k) { B[k] = k; });
  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
  var T = _toObject(target);
  var aLen = arguments.length;
  var index = 1;
  var getSymbols = _objectGops.f;
  var isEnum = _objectPie.f;
  while (aLen > index) {
    var S = _iobject(arguments[index++]);
    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
    var length = keys.length;
    var j = 0;
    var key;
    while (length > j) {
      key = keys[j++];
      if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
    }
  } return T;
} : $assign;

// 19.1.3.1 Object.assign(target, source)


_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

var CrossValidate = /*#__PURE__*/function () {
  /**
   *
   * @param {NeuralNetwork|constructor} Classifier
   * @param {object} [options]
   */
  function CrossValidate(Classifier, options) {
    _classCallCheck(this, CrossValidate);

    this.Classifier = Classifier;
    this.options = options;
    this.json = null;
  }
  /**
   *
   * @param {object} trainOpts
   * @param {object} trainSet
   * @param {object} testSet
   * @returns {void|*}
   */


  _createClass(CrossValidate, [{
    key: "testPartition",
    value: function testPartition(trainOpts, trainSet, testSet) {
      var classifier = new this.Classifier(this.options);
      var beginTrain = Date.now();
      var trainingStats = classifier.train(trainSet, trainOpts);
      var beginTest = Date.now();
      var testStats = classifier.test(testSet);
      var endTest = Date.now();
      var stats = Object.assign({}, testStats, {
        trainTime: beginTest - beginTrain,
        testTime: endTest - beginTest,
        iterations: trainingStats.iterations,
        error: trainingStats.error,
        total: testStats.total,
        learningRate: classifier.trainOpts.learningRate,
        hiddenLayers: classifier.hiddenLayers,
        network: classifier.toJSON()
      });
      return stats;
    }
    /**
     * Randomize array element order in-place.
     * Using Durstenfeld shuffle algorithm.
     * source: http://stackoverflow.com/a/12646864/1324039
     */

  }, {
    key: "shuffleArray",
    value: function shuffleArray(array) {
      for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
      }

      return array;
    }
    /**
     *
     * @param {object} data
     * @param {object} trainOpts
     * @param {number} [k]
     * @returns {
     *  {
     *    avgs: {
     *      error: number,
     *      trainTime: number,
     *      testTime: number,
     *      iterations: number,
     *      error: number
     *    },
     *    stats: {
     *      truePos: number,
     *      trueNeg: number,
     *      falsePos: number,
     *      falseNeg: number,
     *      total: number
     *    },
     *    sets: Array
     *  }
     * }
     */

  }, {
    key: "train",
    value: function train(data) {
      var trainOpts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var k = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 4;

      if (data.length < k) {
        throw new Error("Training set size is too small for ".concat(data.length, " k folds of ").concat(k));
      }

      var size = data.length / k;

      if (data.constructor === Array) {
        this.shuffleArray(data);
      } else {
        var newData = {};
        this.shuffleArray(Object.keys(data)).forEach(function (key) {
          newData[key] = data[key];
        });
        data = newData;
      }

      var avgs = {
        trainTime: 0,
        testTime: 0,
        iterations: 0,
        error: 0
      };
      var stats = {
        total: 0
      };
      var binaryStats = {
        total: 0,
        truePos: 0,
        trueNeg: 0,
        falsePos: 0,
        falseNeg: 0
      };
      var results = [];
      var stat;
      var isBinary = null;

      for (var i = 0; i < k; i++) {
        var dclone = data.slice(0);
        var testSet = dclone.splice(i * size, size);
        var trainSet = dclone;
        var result = this.testPartition(trainOpts, trainSet, testSet);

        if (isBinary === null) {
          isBinary = result.hasOwnProperty('falseNeg') && result.hasOwnProperty('falsePos') && result.hasOwnProperty('trueNeg') && result.hasOwnProperty('truePos');

          if (isBinary) {
            Object.assign(stats, binaryStats);
          }
        }

        for (stat in avgs) {
          if (stat in avgs) {
            avgs[stat] += result[stat];
          }
        }

        for (stat in stats) {
          if (stat in stats) {
            stats[stat] += result[stat];
          }
        }

        results.push(result);
      }

      for (stat in avgs) {
        if (stat in avgs) {
          avgs[stat] /= k;
        }
      }

      if (isBinary) {
        stats.precision = stats.truePos / (stats.truePos + stats.falsePos);
        stats.recall = stats.truePos / (stats.truePos + stats.falseNeg);
        stats.accuracy = (stats.trueNeg + stats.truePos) / stats.total;
      }

      stats.testSize = size;
      stats.trainSize = data.length - size;
      return this.json = {
        avgs: avgs,
        stats: stats,
        sets: results
      };
    }
  }, {
    key: "toNeuralNetwork",
    value: function toNeuralNetwork() {
      return this.fromJSON(this.json);
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return this.json;
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(crossValidateJson) {
      var Classifier = this.Classifier;
      var json = crossValidateJson.sets.reduce(function (prev, cur) {
        return prev.error < cur.error ? prev : cur;
      }, {
        error: Infinity
      }).network;

      if (Classifier.fromJSON) {
        return Classifier.fromJSON(json);
      }

      var instance = new Classifier();
      instance.fromJSON(json);
      return instance;
    }
  }]);

  return CrossValidate;
}();

var crossValidate = CrossValidate;

var dP$1 = _objectDp.f;
var FProto = Function.prototype;
var nameRE = /^\s*function ([^ (]*)/;
var NAME$1 = 'name';

// 19.2.4.2 name
NAME$1 in FProto || _descriptors && dP$1(FProto, NAME$1, {
  configurable: true,
  get: function () {
    try {
      return ('' + this).match(nameRE)[1];
    } catch (e) {
      return '';
    }
  }
});

var TYPED = _uid('typed_array');
var VIEW = _uid('view');
var ABV = !!(_global.ArrayBuffer && _global.DataView);
var CONSTR = ABV;
var i$1 = 0;
var l = 9;
var Typed;

var TypedArrayConstructors = (
  'Int8Array,Uint8Array,Uint8ClampedArray,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array'
).split(',');

while (i$1 < l) {
  if (Typed = _global[TypedArrayConstructors[i$1++]]) {
    _hide(Typed.prototype, TYPED, true);
    _hide(Typed.prototype, VIEW, true);
  } else CONSTR = false;
}

var _typed = {
  ABV: ABV,
  CONSTR: CONSTR,
  TYPED: TYPED,
  VIEW: VIEW
};

var _redefineAll = function (target, src, safe) {
  for (var key in src) _redefine(target, key, src[key], safe);
  return target;
};

var _anInstance = function (it, Constructor, name, forbiddenField) {
  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
    throw TypeError(name + ': incorrect invocation!');
  } return it;
};

// https://tc39.github.io/ecma262/#sec-toindex


var _toIndex = function (it) {
  if (it === undefined) return 0;
  var number = _toInteger(it);
  var length = _toLength(number);
  if (number !== length) throw RangeError('Wrong length!');
  return length;
};

// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

var f$3 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
  return _objectKeysInternal(O, hiddenKeys);
};

var _objectGopn = {
	f: f$3
};

var _arrayFill = function fill(value /* , start = 0, end = @length */) {
  var O = _toObject(this);
  var length = _toLength(O.length);
  var aLen = arguments.length;
  var index = _toAbsoluteIndex(aLen > 1 ? arguments[1] : undefined, length);
  var end = aLen > 2 ? arguments[2] : undefined;
  var endPos = end === undefined ? length : _toAbsoluteIndex(end, length);
  while (endPos > index) O[index++] = value;
  return O;
};

var _typedBuffer = createCommonjsModule(function (module, exports) {











var gOPN = _objectGopn.f;
var dP = _objectDp.f;


var ARRAY_BUFFER = 'ArrayBuffer';
var DATA_VIEW = 'DataView';
var PROTOTYPE = 'prototype';
var WRONG_LENGTH = 'Wrong length!';
var WRONG_INDEX = 'Wrong index!';
var $ArrayBuffer = _global[ARRAY_BUFFER];
var $DataView = _global[DATA_VIEW];
var Math = _global.Math;
var RangeError = _global.RangeError;
// eslint-disable-next-line no-shadow-restricted-names
var Infinity = _global.Infinity;
var BaseBuffer = $ArrayBuffer;
var abs = Math.abs;
var pow = Math.pow;
var floor = Math.floor;
var log = Math.log;
var LN2 = Math.LN2;
var BUFFER = 'buffer';
var BYTE_LENGTH = 'byteLength';
var BYTE_OFFSET = 'byteOffset';
var $BUFFER = _descriptors ? '_b' : BUFFER;
var $LENGTH = _descriptors ? '_l' : BYTE_LENGTH;
var $OFFSET = _descriptors ? '_o' : BYTE_OFFSET;

// IEEE754 conversions based on https://github.com/feross/ieee754
function packIEEE754(value, mLen, nBytes) {
  var buffer = new Array(nBytes);
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? pow(2, -24) - pow(2, -77) : 0;
  var i = 0;
  var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;
  var e, m, c;
  value = abs(value);
  // eslint-disable-next-line no-self-compare
  if (value != value || value === Infinity) {
    // eslint-disable-next-line no-self-compare
    m = value != value ? 1 : 0;
    e = eMax;
  } else {
    e = floor(log(value) / LN2);
    if (value * (c = pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }
    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * pow(2, eBias - 1) * pow(2, mLen);
      e = 0;
    }
  }
  for (; mLen >= 8; buffer[i++] = m & 255, m /= 256, mLen -= 8);
  e = e << mLen | m;
  eLen += mLen;
  for (; eLen > 0; buffer[i++] = e & 255, e /= 256, eLen -= 8);
  buffer[--i] |= s * 128;
  return buffer;
}
function unpackIEEE754(buffer, mLen, nBytes) {
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = eLen - 7;
  var i = nBytes - 1;
  var s = buffer[i--];
  var e = s & 127;
  var m;
  s >>= 7;
  for (; nBits > 0; e = e * 256 + buffer[i], i--, nBits -= 8);
  m = e & (1 << -nBits) - 1;
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[i], i--, nBits -= 8);
  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : s ? -Infinity : Infinity;
  } else {
    m = m + pow(2, mLen);
    e = e - eBias;
  } return (s ? -1 : 1) * m * pow(2, e - mLen);
}

function unpackI32(bytes) {
  return bytes[3] << 24 | bytes[2] << 16 | bytes[1] << 8 | bytes[0];
}
function packI8(it) {
  return [it & 0xff];
}
function packI16(it) {
  return [it & 0xff, it >> 8 & 0xff];
}
function packI32(it) {
  return [it & 0xff, it >> 8 & 0xff, it >> 16 & 0xff, it >> 24 & 0xff];
}
function packF64(it) {
  return packIEEE754(it, 52, 8);
}
function packF32(it) {
  return packIEEE754(it, 23, 4);
}

function addGetter(C, key, internal) {
  dP(C[PROTOTYPE], key, { get: function () { return this[internal]; } });
}

function get(view, bytes, index, isLittleEndian) {
  var numIndex = +index;
  var intIndex = _toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = store.slice(start, start + bytes);
  return isLittleEndian ? pack : pack.reverse();
}
function set(view, bytes, index, conversion, value, isLittleEndian) {
  var numIndex = +index;
  var intIndex = _toIndex(numIndex);
  if (intIndex + bytes > view[$LENGTH]) throw RangeError(WRONG_INDEX);
  var store = view[$BUFFER]._b;
  var start = intIndex + view[$OFFSET];
  var pack = conversion(+value);
  for (var i = 0; i < bytes; i++) store[start + i] = pack[isLittleEndian ? i : bytes - i - 1];
}

if (!_typed.ABV) {
  $ArrayBuffer = function ArrayBuffer(length) {
    _anInstance(this, $ArrayBuffer, ARRAY_BUFFER);
    var byteLength = _toIndex(length);
    this._b = _arrayFill.call(new Array(byteLength), 0);
    this[$LENGTH] = byteLength;
  };

  $DataView = function DataView(buffer, byteOffset, byteLength) {
    _anInstance(this, $DataView, DATA_VIEW);
    _anInstance(buffer, $ArrayBuffer, DATA_VIEW);
    var bufferLength = buffer[$LENGTH];
    var offset = _toInteger(byteOffset);
    if (offset < 0 || offset > bufferLength) throw RangeError('Wrong offset!');
    byteLength = byteLength === undefined ? bufferLength - offset : _toLength(byteLength);
    if (offset + byteLength > bufferLength) throw RangeError(WRONG_LENGTH);
    this[$BUFFER] = buffer;
    this[$OFFSET] = offset;
    this[$LENGTH] = byteLength;
  };

  if (_descriptors) {
    addGetter($ArrayBuffer, BYTE_LENGTH, '_l');
    addGetter($DataView, BUFFER, '_b');
    addGetter($DataView, BYTE_LENGTH, '_l');
    addGetter($DataView, BYTE_OFFSET, '_o');
  }

  _redefineAll($DataView[PROTOTYPE], {
    getInt8: function getInt8(byteOffset) {
      return get(this, 1, byteOffset)[0] << 24 >> 24;
    },
    getUint8: function getUint8(byteOffset) {
      return get(this, 1, byteOffset)[0];
    },
    getInt16: function getInt16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return (bytes[1] << 8 | bytes[0]) << 16 >> 16;
    },
    getUint16: function getUint16(byteOffset /* , littleEndian */) {
      var bytes = get(this, 2, byteOffset, arguments[1]);
      return bytes[1] << 8 | bytes[0];
    },
    getInt32: function getInt32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1]));
    },
    getUint32: function getUint32(byteOffset /* , littleEndian */) {
      return unpackI32(get(this, 4, byteOffset, arguments[1])) >>> 0;
    },
    getFloat32: function getFloat32(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 4, byteOffset, arguments[1]), 23, 4);
    },
    getFloat64: function getFloat64(byteOffset /* , littleEndian */) {
      return unpackIEEE754(get(this, 8, byteOffset, arguments[1]), 52, 8);
    },
    setInt8: function setInt8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setUint8: function setUint8(byteOffset, value) {
      set(this, 1, byteOffset, packI8, value);
    },
    setInt16: function setInt16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setUint16: function setUint16(byteOffset, value /* , littleEndian */) {
      set(this, 2, byteOffset, packI16, value, arguments[2]);
    },
    setInt32: function setInt32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setUint32: function setUint32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packI32, value, arguments[2]);
    },
    setFloat32: function setFloat32(byteOffset, value /* , littleEndian */) {
      set(this, 4, byteOffset, packF32, value, arguments[2]);
    },
    setFloat64: function setFloat64(byteOffset, value /* , littleEndian */) {
      set(this, 8, byteOffset, packF64, value, arguments[2]);
    }
  });
} else {
  if (!_fails(function () {
    $ArrayBuffer(1);
  }) || !_fails(function () {
    new $ArrayBuffer(-1); // eslint-disable-line no-new
  }) || _fails(function () {
    new $ArrayBuffer(); // eslint-disable-line no-new
    new $ArrayBuffer(1.5); // eslint-disable-line no-new
    new $ArrayBuffer(NaN); // eslint-disable-line no-new
    return $ArrayBuffer.name != ARRAY_BUFFER;
  })) {
    $ArrayBuffer = function ArrayBuffer(length) {
      _anInstance(this, $ArrayBuffer);
      return new BaseBuffer(_toIndex(length));
    };
    var ArrayBufferProto = $ArrayBuffer[PROTOTYPE] = BaseBuffer[PROTOTYPE];
    for (var keys = gOPN(BaseBuffer), j = 0, key; keys.length > j;) {
      if (!((key = keys[j++]) in $ArrayBuffer)) _hide($ArrayBuffer, key, BaseBuffer[key]);
    }
    ArrayBufferProto.constructor = $ArrayBuffer;
  }
  // iOS Safari 7.x bug
  var view = new $DataView(new $ArrayBuffer(2));
  var $setInt8 = $DataView[PROTOTYPE].setInt8;
  view.setInt8(0, 2147483648);
  view.setInt8(1, 2147483649);
  if (view.getInt8(0) || !view.getInt8(1)) _redefineAll($DataView[PROTOTYPE], {
    setInt8: function setInt8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    },
    setUint8: function setUint8(byteOffset, value) {
      $setInt8.call(this, byteOffset, value << 24 >> 24);
    }
  }, true);
}
_setToStringTag($ArrayBuffer, ARRAY_BUFFER);
_setToStringTag($DataView, DATA_VIEW);
_hide($DataView[PROTOTYPE], _typed.VIEW, true);
exports[ARRAY_BUFFER] = $ArrayBuffer;
exports[DATA_VIEW] = $DataView;
});

// check on default Array iterator

var ITERATOR$2 = _wks('iterator');
var ArrayProto$1 = Array.prototype;

var _isArrayIter = function (it) {
  return it !== undefined && (_iterators.Array === it || ArrayProto$1[ITERATOR$2] === it);
};

var ITERATOR$3 = _wks('iterator');

var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
  if (it != undefined) return it[ITERATOR$3]
    || it['@@iterator']
    || _iterators[_classof(it)];
};

// 7.2.2 IsArray(argument)

var _isArray = Array.isArray || function isArray(arg) {
  return _cof(arg) == 'Array';
};

var SPECIES = _wks('species');

var _arraySpeciesConstructor = function (original) {
  var C;
  if (_isArray(original)) {
    C = original.constructor;
    // cross-realm fallback
    if (typeof C == 'function' && (C === Array || _isArray(C.prototype))) C = undefined;
    if (_isObject(C)) {
      C = C[SPECIES];
      if (C === null) C = undefined;
    }
  } return C === undefined ? Array : C;
};

// 9.4.2.3 ArraySpeciesCreate(originalArray, length)


var _arraySpeciesCreate = function (original, length) {
  return new (_arraySpeciesConstructor(original))(length);
};

// 0 -> Array#forEach
// 1 -> Array#map
// 2 -> Array#filter
// 3 -> Array#some
// 4 -> Array#every
// 5 -> Array#find
// 6 -> Array#findIndex





var _arrayMethods = function (TYPE, $create) {
  var IS_MAP = TYPE == 1;
  var IS_FILTER = TYPE == 2;
  var IS_SOME = TYPE == 3;
  var IS_EVERY = TYPE == 4;
  var IS_FIND_INDEX = TYPE == 6;
  var NO_HOLES = TYPE == 5 || IS_FIND_INDEX;
  var create = $create || _arraySpeciesCreate;
  return function ($this, callbackfn, that) {
    var O = _toObject($this);
    var self = _iobject(O);
    var f = _ctx(callbackfn, that, 3);
    var length = _toLength(self.length);
    var index = 0;
    var result = IS_MAP ? create($this, length) : IS_FILTER ? create($this, 0) : undefined;
    var val, res;
    for (;length > index; index++) if (NO_HOLES || index in self) {
      val = self[index];
      res = f(val, index, O);
      if (TYPE) {
        if (IS_MAP) result[index] = res;   // map
        else if (res) switch (TYPE) {
          case 3: return true;             // some
          case 5: return val;              // find
          case 6: return index;            // findIndex
          case 2: result.push(val);        // filter
        } else if (IS_EVERY) return false; // every
      }
    }
    return IS_FIND_INDEX ? -1 : IS_SOME || IS_EVERY ? IS_EVERY : result;
  };
};

// 7.3.20 SpeciesConstructor(O, defaultConstructor)


var SPECIES$1 = _wks('species');
var _speciesConstructor = function (O, D) {
  var C = _anObject(O).constructor;
  var S;
  return C === undefined || (S = _anObject(C)[SPECIES$1]) == undefined ? D : _aFunction(S);
};

var ITERATOR$4 = _wks('iterator');
var SAFE_CLOSING = false;

try {
  var riter = [7][ITERATOR$4]();
  riter['return'] = function () { SAFE_CLOSING = true; };
  // eslint-disable-next-line no-throw-literal
  Array.from(riter, function () { throw 2; });
} catch (e) { /* empty */ }

var _iterDetect = function (exec, skipClosing) {
  if (!skipClosing && !SAFE_CLOSING) return false;
  var safe = false;
  try {
    var arr = [7];
    var iter = arr[ITERATOR$4]();
    iter.next = function () { return { done: safe = true }; };
    arr[ITERATOR$4] = function () { return iter; };
    exec(arr);
  } catch (e) { /* empty */ }
  return safe;
};

var SPECIES$2 = _wks('species');

var _setSpecies = function (KEY) {
  var C = _global[KEY];
  if (_descriptors && C && !C[SPECIES$2]) _objectDp.f(C, SPECIES$2, {
    configurable: true,
    get: function () { return this; }
  });
};

var _arrayCopyWithin = [].copyWithin || function copyWithin(target /* = 0 */, start /* = 0, end = @length */) {
  var O = _toObject(this);
  var len = _toLength(O.length);
  var to = _toAbsoluteIndex(target, len);
  var from = _toAbsoluteIndex(start, len);
  var end = arguments.length > 2 ? arguments[2] : undefined;
  var count = Math.min((end === undefined ? len : _toAbsoluteIndex(end, len)) - from, len - to);
  var inc = 1;
  if (from < to && to < from + count) {
    inc = -1;
    from += count - 1;
    to += count - 1;
  }
  while (count-- > 0) {
    if (from in O) O[to] = O[from];
    else delete O[to];
    to += inc;
    from += inc;
  } return O;
};

var gOPD = Object.getOwnPropertyDescriptor;

var f$4 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
  O = _toIobject(O);
  P = _toPrimitive(P, true);
  if (_ie8DomDefine) try {
    return gOPD(O, P);
  } catch (e) { /* empty */ }
  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
};

var _objectGopd = {
	f: f$4
};

var _typedArray = createCommonjsModule(function (module) {
if (_descriptors) {
  var LIBRARY = _library;
  var global = _global;
  var fails = _fails;
  var $export = _export;
  var $typed = _typed;
  var $buffer = _typedBuffer;
  var ctx = _ctx;
  var anInstance = _anInstance;
  var propertyDesc = _propertyDesc;
  var hide = _hide;
  var redefineAll = _redefineAll;
  var toInteger = _toInteger;
  var toLength = _toLength;
  var toIndex = _toIndex;
  var toAbsoluteIndex = _toAbsoluteIndex;
  var toPrimitive = _toPrimitive;
  var has = _has;
  var classof = _classof;
  var isObject = _isObject;
  var toObject = _toObject;
  var isArrayIter = _isArrayIter;
  var create = _objectCreate;
  var getPrototypeOf = _objectGpo;
  var gOPN = _objectGopn.f;
  var getIterFn = core_getIteratorMethod;
  var uid = _uid;
  var wks = _wks;
  var createArrayMethod = _arrayMethods;
  var createArrayIncludes = _arrayIncludes;
  var speciesConstructor = _speciesConstructor;
  var ArrayIterators = es6_array_iterator;
  var Iterators = _iterators;
  var $iterDetect = _iterDetect;
  var setSpecies = _setSpecies;
  var arrayFill = _arrayFill;
  var arrayCopyWithin = _arrayCopyWithin;
  var $DP = _objectDp;
  var $GOPD = _objectGopd;
  var dP = $DP.f;
  var gOPD = $GOPD.f;
  var RangeError = global.RangeError;
  var TypeError = global.TypeError;
  var Uint8Array = global.Uint8Array;
  var ARRAY_BUFFER = 'ArrayBuffer';
  var SHARED_BUFFER = 'Shared' + ARRAY_BUFFER;
  var BYTES_PER_ELEMENT = 'BYTES_PER_ELEMENT';
  var PROTOTYPE = 'prototype';
  var ArrayProto = Array[PROTOTYPE];
  var $ArrayBuffer = $buffer.ArrayBuffer;
  var $DataView = $buffer.DataView;
  var arrayForEach = createArrayMethod(0);
  var arrayFilter = createArrayMethod(2);
  var arraySome = createArrayMethod(3);
  var arrayEvery = createArrayMethod(4);
  var arrayFind = createArrayMethod(5);
  var arrayFindIndex = createArrayMethod(6);
  var arrayIncludes = createArrayIncludes(true);
  var arrayIndexOf = createArrayIncludes(false);
  var arrayValues = ArrayIterators.values;
  var arrayKeys = ArrayIterators.keys;
  var arrayEntries = ArrayIterators.entries;
  var arrayLastIndexOf = ArrayProto.lastIndexOf;
  var arrayReduce = ArrayProto.reduce;
  var arrayReduceRight = ArrayProto.reduceRight;
  var arrayJoin = ArrayProto.join;
  var arraySort = ArrayProto.sort;
  var arraySlice = ArrayProto.slice;
  var arrayToString = ArrayProto.toString;
  var arrayToLocaleString = ArrayProto.toLocaleString;
  var ITERATOR = wks('iterator');
  var TAG = wks('toStringTag');
  var TYPED_CONSTRUCTOR = uid('typed_constructor');
  var DEF_CONSTRUCTOR = uid('def_constructor');
  var ALL_CONSTRUCTORS = $typed.CONSTR;
  var TYPED_ARRAY = $typed.TYPED;
  var VIEW = $typed.VIEW;
  var WRONG_LENGTH = 'Wrong length!';

  var $map = createArrayMethod(1, function (O, length) {
    return allocate(speciesConstructor(O, O[DEF_CONSTRUCTOR]), length);
  });

  var LITTLE_ENDIAN = fails(function () {
    // eslint-disable-next-line no-undef
    return new Uint8Array(new Uint16Array([1]).buffer)[0] === 1;
  });

  var FORCED_SET = !!Uint8Array && !!Uint8Array[PROTOTYPE].set && fails(function () {
    new Uint8Array(1).set({});
  });

  var toOffset = function (it, BYTES) {
    var offset = toInteger(it);
    if (offset < 0 || offset % BYTES) throw RangeError('Wrong offset!');
    return offset;
  };

  var validate = function (it) {
    if (isObject(it) && TYPED_ARRAY in it) return it;
    throw TypeError(it + ' is not a typed array!');
  };

  var allocate = function (C, length) {
    if (!(isObject(C) && TYPED_CONSTRUCTOR in C)) {
      throw TypeError('It is not a typed array constructor!');
    } return new C(length);
  };

  var speciesFromList = function (O, list) {
    return fromList(speciesConstructor(O, O[DEF_CONSTRUCTOR]), list);
  };

  var fromList = function (C, list) {
    var index = 0;
    var length = list.length;
    var result = allocate(C, length);
    while (length > index) result[index] = list[index++];
    return result;
  };

  var addGetter = function (it, key, internal) {
    dP(it, key, { get: function () { return this._d[internal]; } });
  };

  var $from = function from(source /* , mapfn, thisArg */) {
    var O = toObject(source);
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var iterFn = getIterFn(O);
    var i, length, values, result, step, iterator;
    if (iterFn != undefined && !isArrayIter(iterFn)) {
      for (iterator = iterFn.call(O), values = [], i = 0; !(step = iterator.next()).done; i++) {
        values.push(step.value);
      } O = values;
    }
    if (mapping && aLen > 2) mapfn = ctx(mapfn, arguments[2], 2);
    for (i = 0, length = toLength(O.length), result = allocate(this, length); length > i; i++) {
      result[i] = mapping ? mapfn(O[i], i) : O[i];
    }
    return result;
  };

  var $of = function of(/* ...items */) {
    var index = 0;
    var length = arguments.length;
    var result = allocate(this, length);
    while (length > index) result[index] = arguments[index++];
    return result;
  };

  // iOS Safari 6.x fails here
  var TO_LOCALE_BUG = !!Uint8Array && fails(function () { arrayToLocaleString.call(new Uint8Array(1)); });

  var $toLocaleString = function toLocaleString() {
    return arrayToLocaleString.apply(TO_LOCALE_BUG ? arraySlice.call(validate(this)) : validate(this), arguments);
  };

  var proto = {
    copyWithin: function copyWithin(target, start /* , end */) {
      return arrayCopyWithin.call(validate(this), target, start, arguments.length > 2 ? arguments[2] : undefined);
    },
    every: function every(callbackfn /* , thisArg */) {
      return arrayEvery(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    fill: function fill(value /* , start, end */) { // eslint-disable-line no-unused-vars
      return arrayFill.apply(validate(this), arguments);
    },
    filter: function filter(callbackfn /* , thisArg */) {
      return speciesFromList(this, arrayFilter(validate(this), callbackfn,
        arguments.length > 1 ? arguments[1] : undefined));
    },
    find: function find(predicate /* , thisArg */) {
      return arrayFind(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    findIndex: function findIndex(predicate /* , thisArg */) {
      return arrayFindIndex(validate(this), predicate, arguments.length > 1 ? arguments[1] : undefined);
    },
    forEach: function forEach(callbackfn /* , thisArg */) {
      arrayForEach(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    indexOf: function indexOf(searchElement /* , fromIndex */) {
      return arrayIndexOf(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    includes: function includes(searchElement /* , fromIndex */) {
      return arrayIncludes(validate(this), searchElement, arguments.length > 1 ? arguments[1] : undefined);
    },
    join: function join(separator) { // eslint-disable-line no-unused-vars
      return arrayJoin.apply(validate(this), arguments);
    },
    lastIndexOf: function lastIndexOf(searchElement /* , fromIndex */) { // eslint-disable-line no-unused-vars
      return arrayLastIndexOf.apply(validate(this), arguments);
    },
    map: function map(mapfn /* , thisArg */) {
      return $map(validate(this), mapfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    reduce: function reduce(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduce.apply(validate(this), arguments);
    },
    reduceRight: function reduceRight(callbackfn /* , initialValue */) { // eslint-disable-line no-unused-vars
      return arrayReduceRight.apply(validate(this), arguments);
    },
    reverse: function reverse() {
      var that = this;
      var length = validate(that).length;
      var middle = Math.floor(length / 2);
      var index = 0;
      var value;
      while (index < middle) {
        value = that[index];
        that[index++] = that[--length];
        that[length] = value;
      } return that;
    },
    some: function some(callbackfn /* , thisArg */) {
      return arraySome(validate(this), callbackfn, arguments.length > 1 ? arguments[1] : undefined);
    },
    sort: function sort(comparefn) {
      return arraySort.call(validate(this), comparefn);
    },
    subarray: function subarray(begin, end) {
      var O = validate(this);
      var length = O.length;
      var $begin = toAbsoluteIndex(begin, length);
      return new (speciesConstructor(O, O[DEF_CONSTRUCTOR]))(
        O.buffer,
        O.byteOffset + $begin * O.BYTES_PER_ELEMENT,
        toLength((end === undefined ? length : toAbsoluteIndex(end, length)) - $begin)
      );
    }
  };

  var $slice = function slice(start, end) {
    return speciesFromList(this, arraySlice.call(validate(this), start, end));
  };

  var $set = function set(arrayLike /* , offset */) {
    validate(this);
    var offset = toOffset(arguments[1], 1);
    var length = this.length;
    var src = toObject(arrayLike);
    var len = toLength(src.length);
    var index = 0;
    if (len + offset > length) throw RangeError(WRONG_LENGTH);
    while (index < len) this[offset + index] = src[index++];
  };

  var $iterators = {
    entries: function entries() {
      return arrayEntries.call(validate(this));
    },
    keys: function keys() {
      return arrayKeys.call(validate(this));
    },
    values: function values() {
      return arrayValues.call(validate(this));
    }
  };

  var isTAIndex = function (target, key) {
    return isObject(target)
      && target[TYPED_ARRAY]
      && typeof key != 'symbol'
      && key in target
      && String(+key) == String(key);
  };
  var $getDesc = function getOwnPropertyDescriptor(target, key) {
    return isTAIndex(target, key = toPrimitive(key, true))
      ? propertyDesc(2, target[key])
      : gOPD(target, key);
  };
  var $setDesc = function defineProperty(target, key, desc) {
    if (isTAIndex(target, key = toPrimitive(key, true))
      && isObject(desc)
      && has(desc, 'value')
      && !has(desc, 'get')
      && !has(desc, 'set')
      // TODO: add validation descriptor w/o calling accessors
      && !desc.configurable
      && (!has(desc, 'writable') || desc.writable)
      && (!has(desc, 'enumerable') || desc.enumerable)
    ) {
      target[key] = desc.value;
      return target;
    } return dP(target, key, desc);
  };

  if (!ALL_CONSTRUCTORS) {
    $GOPD.f = $getDesc;
    $DP.f = $setDesc;
  }

  $export($export.S + $export.F * !ALL_CONSTRUCTORS, 'Object', {
    getOwnPropertyDescriptor: $getDesc,
    defineProperty: $setDesc
  });

  if (fails(function () { arrayToString.call({}); })) {
    arrayToString = arrayToLocaleString = function toString() {
      return arrayJoin.call(this);
    };
  }

  var $TypedArrayPrototype$ = redefineAll({}, proto);
  redefineAll($TypedArrayPrototype$, $iterators);
  hide($TypedArrayPrototype$, ITERATOR, $iterators.values);
  redefineAll($TypedArrayPrototype$, {
    slice: $slice,
    set: $set,
    constructor: function () { /* noop */ },
    toString: arrayToString,
    toLocaleString: $toLocaleString
  });
  addGetter($TypedArrayPrototype$, 'buffer', 'b');
  addGetter($TypedArrayPrototype$, 'byteOffset', 'o');
  addGetter($TypedArrayPrototype$, 'byteLength', 'l');
  addGetter($TypedArrayPrototype$, 'length', 'e');
  dP($TypedArrayPrototype$, TAG, {
    get: function () { return this[TYPED_ARRAY]; }
  });

  // eslint-disable-next-line max-statements
  module.exports = function (KEY, BYTES, wrapper, CLAMPED) {
    CLAMPED = !!CLAMPED;
    var NAME = KEY + (CLAMPED ? 'Clamped' : '') + 'Array';
    var GETTER = 'get' + KEY;
    var SETTER = 'set' + KEY;
    var TypedArray = global[NAME];
    var Base = TypedArray || {};
    var TAC = TypedArray && getPrototypeOf(TypedArray);
    var FORCED = !TypedArray || !$typed.ABV;
    var O = {};
    var TypedArrayPrototype = TypedArray && TypedArray[PROTOTYPE];
    var getter = function (that, index) {
      var data = that._d;
      return data.v[GETTER](index * BYTES + data.o, LITTLE_ENDIAN);
    };
    var setter = function (that, index, value) {
      var data = that._d;
      if (CLAMPED) value = (value = Math.round(value)) < 0 ? 0 : value > 0xff ? 0xff : value & 0xff;
      data.v[SETTER](index * BYTES + data.o, value, LITTLE_ENDIAN);
    };
    var addElement = function (that, index) {
      dP(that, index, {
        get: function () {
          return getter(this, index);
        },
        set: function (value) {
          return setter(this, index, value);
        },
        enumerable: true
      });
    };
    if (FORCED) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME, '_d');
        var index = 0;
        var offset = 0;
        var buffer, byteLength, length, klass;
        if (!isObject(data)) {
          length = toIndex(data);
          byteLength = length * BYTES;
          buffer = new $ArrayBuffer(byteLength);
        } else if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          buffer = data;
          offset = toOffset($offset, BYTES);
          var $len = data.byteLength;
          if ($length === undefined) {
            if ($len % BYTES) throw RangeError(WRONG_LENGTH);
            byteLength = $len - offset;
            if (byteLength < 0) throw RangeError(WRONG_LENGTH);
          } else {
            byteLength = toLength($length) * BYTES;
            if (byteLength + offset > $len) throw RangeError(WRONG_LENGTH);
          }
          length = byteLength / BYTES;
        } else if (TYPED_ARRAY in data) {
          return fromList(TypedArray, data);
        } else {
          return $from.call(TypedArray, data);
        }
        hide(that, '_d', {
          b: buffer,
          o: offset,
          l: byteLength,
          e: length,
          v: new $DataView(buffer)
        });
        while (index < length) addElement(that, index++);
      });
      TypedArrayPrototype = TypedArray[PROTOTYPE] = create($TypedArrayPrototype$);
      hide(TypedArrayPrototype, 'constructor', TypedArray);
    } else if (!fails(function () {
      TypedArray(1);
    }) || !fails(function () {
      new TypedArray(-1); // eslint-disable-line no-new
    }) || !$iterDetect(function (iter) {
      new TypedArray(); // eslint-disable-line no-new
      new TypedArray(null); // eslint-disable-line no-new
      new TypedArray(1.5); // eslint-disable-line no-new
      new TypedArray(iter); // eslint-disable-line no-new
    }, true)) {
      TypedArray = wrapper(function (that, data, $offset, $length) {
        anInstance(that, TypedArray, NAME);
        var klass;
        // `ws` module bug, temporarily remove validation length for Uint8Array
        // https://github.com/websockets/ws/pull/645
        if (!isObject(data)) return new Base(toIndex(data));
        if (data instanceof $ArrayBuffer || (klass = classof(data)) == ARRAY_BUFFER || klass == SHARED_BUFFER) {
          return $length !== undefined
            ? new Base(data, toOffset($offset, BYTES), $length)
            : $offset !== undefined
              ? new Base(data, toOffset($offset, BYTES))
              : new Base(data);
        }
        if (TYPED_ARRAY in data) return fromList(TypedArray, data);
        return $from.call(TypedArray, data);
      });
      arrayForEach(TAC !== Function.prototype ? gOPN(Base).concat(gOPN(TAC)) : gOPN(Base), function (key) {
        if (!(key in TypedArray)) hide(TypedArray, key, Base[key]);
      });
      TypedArray[PROTOTYPE] = TypedArrayPrototype;
      if (!LIBRARY) TypedArrayPrototype.constructor = TypedArray;
    }
    var $nativeIterator = TypedArrayPrototype[ITERATOR];
    var CORRECT_ITER_NAME = !!$nativeIterator
      && ($nativeIterator.name == 'values' || $nativeIterator.name == undefined);
    var $iterator = $iterators.values;
    hide(TypedArray, TYPED_CONSTRUCTOR, true);
    hide(TypedArrayPrototype, TYPED_ARRAY, NAME);
    hide(TypedArrayPrototype, VIEW, true);
    hide(TypedArrayPrototype, DEF_CONSTRUCTOR, TypedArray);

    if (CLAMPED ? new TypedArray(1)[TAG] != NAME : !(TAG in TypedArrayPrototype)) {
      dP(TypedArrayPrototype, TAG, {
        get: function () { return NAME; }
      });
    }

    O[NAME] = TypedArray;

    $export($export.G + $export.W + $export.F * (TypedArray != Base), O);

    $export($export.S, NAME, {
      BYTES_PER_ELEMENT: BYTES
    });

    $export($export.S + $export.F * fails(function () { Base.of.call(TypedArray, 1); }), NAME, {
      from: $from,
      of: $of
    });

    if (!(BYTES_PER_ELEMENT in TypedArrayPrototype)) hide(TypedArrayPrototype, BYTES_PER_ELEMENT, BYTES);

    $export($export.P, NAME, proto);

    setSpecies(NAME);

    $export($export.P + $export.F * FORCED_SET, NAME, { set: $set });

    $export($export.P + $export.F * !CORRECT_ITER_NAME, NAME, $iterators);

    if (!LIBRARY && TypedArrayPrototype.toString != arrayToString) TypedArrayPrototype.toString = arrayToString;

    $export($export.P + $export.F * fails(function () {
      new TypedArray(1).slice();
    }), NAME, { slice: $slice });

    $export($export.P + $export.F * (fails(function () {
      return [1, 2].toLocaleString() != new TypedArray([1, 2]).toLocaleString();
    }) || !fails(function () {
      TypedArrayPrototype.toLocaleString.call([1, 2]);
    })), NAME, { toLocaleString: $toLocaleString });

    Iterators[NAME] = CORRECT_ITER_NAME ? $nativeIterator : $iterator;
    if (!LIBRARY && !CORRECT_ITER_NAME) hide(TypedArrayPrototype, ITERATOR, $iterator);
  };
} else module.exports = function () { /* empty */ };
});

_typedArray('Float32', 4, function (init) {
  return function Float32Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

/* Functions for turning sparse hashes into arrays and vice versa */
var Lookup = /*#__PURE__*/function () {
  function Lookup() {
    _classCallCheck(this, Lookup);
  }

  _createClass(Lookup, null, [{
    key: "toTable",

    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} hashes
     * @returns {Object}
     */
    value: function toTable(hashes) {
      var hash = hashes.reduce(function (memo, hash) {
        return Object.assign(memo, hash);
      }, {});
      return Lookup.toHash(hash);
    }
    /**
     * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
     * @param {Object} objects2D
     * @returns {Object}
     */

  }, {
    key: "toTable2D",
    value: function toTable2D(objects2D) {
      var table = {};
      var valueIndex = 0;

      for (var i = 0; i < objects2D.length; i++) {
        var objects = objects2D[i];

        for (var j = 0; j < objects.length; j++) {
          var object = objects[j];

          for (var p in object) {
            if (object.hasOwnProperty(p) && !table.hasOwnProperty(p)) {
              table[p] = valueIndex++;
            }
          }
        }
      }

      return table;
    }
  }, {
    key: "toInputTable",
    value: function toInputTable(data) {
      var table = {};
      var tableIndex = 0;

      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        for (var p in data[dataIndex].input) {
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }

      return table;
    }
  }, {
    key: "toInputTable2D",
    value: function toInputTable2D(data) {
      var table = {};
      var tableIndex = 0;

      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        var input = data[dataIndex].input;

        for (var i = 0; i < input.length; i++) {
          var object = input[i];

          for (var p in object) {
            if (!table.hasOwnProperty(p)) {
              table[p] = tableIndex++;
            }
          }
        }
      }

      return table;
    }
  }, {
    key: "toOutputTable",
    value: function toOutputTable(data) {
      var table = {};
      var tableIndex = 0;

      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        for (var p in data[dataIndex].output) {
          if (!table.hasOwnProperty(p)) {
            table[p] = tableIndex++;
          }
        }
      }

      return table;
    }
  }, {
    key: "toOutputTable2D",
    value: function toOutputTable2D(data) {
      var table = {};
      var tableIndex = 0;

      for (var dataIndex = 0; dataIndex < data.length; dataIndex++) {
        var output = data[dataIndex].output;

        for (var i = 0; i < output.length; i++) {
          var object = output[i];

          for (var p in object) {
            if (!table.hasOwnProperty(p)) {
              table[p] = tableIndex++;
            }
          }
        }
      }

      return table;
    }
    /**
     * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
     * @param {Object} hash
     * @returns {Object}
     */

  }, {
    key: "toHash",
    value: function toHash(hash) {
      var lookup = {};
      var index = 0;

      for (var i in hash) {
        lookup[i] = index++;
      }

      return lookup;
    }
    /**
     * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
     * @param {*} lookup
     * @param {*} object
     * @param {*} arrayLength
     * @returns {Float32Array}
     */

  }, {
    key: "toArray",
    value: function toArray(lookup, object, arrayLength) {
      var result = new Float32Array(arrayLength);

      for (var p in lookup) {
        result[lookup[p]] = object.hasOwnProperty(p) ? object[p] : 0;
      }

      return result;
    }
  }, {
    key: "toArrayShort",
    value: function toArrayShort(lookup, object) {
      var result = [];

      for (var p in lookup) {
        if (!object.hasOwnProperty(p)) break;
        result[lookup[p]] = object[p];
      }

      return Float32Array.from(result);
    }
  }, {
    key: "toArrays",
    value: function toArrays(lookup, objects, arrayLength) {
      var result = [];

      for (var i = 0; i < objects.length; i++) {
        result.push(this.toArray(lookup, objects[i], arrayLength));
      }

      return result;
    }
    /**
     * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
     * @param {Object} lookup
     * @param {Array} array
     * @returns {Object}
     */

  }, {
    key: "toObject",
    value: function toObject(lookup, array) {
      var object = {};

      for (var p in lookup) {
        object[p] = array[lookup[p]];
      }

      return object;
    }
  }, {
    key: "toObjectPartial",
    value: function toObjectPartial(lookup, array) {
      var offset = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var limit = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
      var object = {};
      var i = 0;

      for (var p in lookup) {
        if (offset > 0) {
          if (i++ < offset) continue;
        }

        if (limit > 0) {
          if (i++ >= limit) continue;
        }

        object[p] = array[lookup[p] - offset];
      }

      return object;
    }
    /**
     *
     * @param {Array} array
     * @returns {*}
     */

  }, {
    key: "lookupFromArray",
    value: function lookupFromArray(array) {
      var lookup = {};
      var z = 0;
      var i = array.length;

      while (i-- > 0) {
        lookup[array[i]] = z++;
      }

      return lookup;
    }
  }, {
    key: "dataShape",
    value: function dataShape(data) {
      var shape = [];

      if (data.input) {
        shape.push('datum');
        data = data.input;
      } else if (Array.isArray(data)) {
        if (data[0].input) {
          shape.push('array', 'datum');
          data = data[0].input;
        } else {
          shape.push('array');
          data = data[0];
        }
      }

      var p;

      while (data) {
        for (p in data) {
          break;
        }

        if (!data.hasOwnProperty(p)) break;

        if (Array.isArray(data) || data.buffer instanceof ArrayBuffer) {
          shape.push('array');
          data = data[p];
        } else if (_typeof(data) === 'object') {
          shape.push('object');
          data = data[p];
        } else {
          throw new Error('unhandled signature');
        }
      }

      shape.push(_typeof(data));
      return shape;
    }
  }, {
    key: "addKeys",
    value: function addKeys(value, table) {
      if (Array.isArray(value)) return;
      table = table || {};
      var i = Object.keys(table).length;

      for (var p in value) {
        if (!value.hasOwnProperty(p)) continue;
        if (table.hasOwnProperty(p)) continue;
        table[p] = i++;
      }

      return table;
    }
  }]);

  return Lookup;
}();

var lookup = Lookup;

// fast apply, http://jsperf.lnkit.com/fast-apply/5
var _invoke = function (fn, args, that) {
  var un = that === undefined;
  switch (args.length) {
    case 0: return un ? fn()
                      : fn.call(that);
    case 1: return un ? fn(args[0])
                      : fn.call(that, args[0]);
    case 2: return un ? fn(args[0], args[1])
                      : fn.call(that, args[0], args[1]);
    case 3: return un ? fn(args[0], args[1], args[2])
                      : fn.call(that, args[0], args[1], args[2]);
    case 4: return un ? fn(args[0], args[1], args[2], args[3])
                      : fn.call(that, args[0], args[1], args[2], args[3]);
  } return fn.apply(that, args);
};

var arraySlice = [].slice;
var factories = {};

var construct = function (F, len, args) {
  if (!(len in factories)) {
    for (var n = [], i = 0; i < len; i++) n[i] = 'a[' + i + ']';
    // eslint-disable-next-line no-new-func
    factories[len] = Function('F,a', 'return new F(' + n.join(',') + ')');
  } return factories[len](F, args);
};

var _bind = Function.bind || function bind(that /* , ...args */) {
  var fn = _aFunction(this);
  var partArgs = arraySlice.call(arguments, 1);
  var bound = function (/* args... */) {
    var args = partArgs.concat(arraySlice.call(arguments));
    return this instanceof bound ? construct(fn, args.length, args) : _invoke(fn, args, that);
  };
  if (_isObject(fn.prototype)) bound.prototype = fn.prototype;
  return bound;
};

// 26.1.2 Reflect.construct(target, argumentsList [, newTarget])







var rConstruct = (_global.Reflect || {}).construct;

// MS Edge supports only 2 arguments and argumentsList argument is optional
// FF Nightly sets third argument as `new.target`, but does not create `this` from it
var NEW_TARGET_BUG = _fails(function () {
  function F() { /* empty */ }
  return !(rConstruct(function () { /* empty */ }, [], F) instanceof F);
});
var ARGS_BUG = !_fails(function () {
  rConstruct(function () { /* empty */ });
});

_export(_export.S + _export.F * (NEW_TARGET_BUG || ARGS_BUG), 'Reflect', {
  construct: function construct(Target, args /* , newTarget */) {
    _aFunction(Target);
    _anObject(args);
    var newTarget = arguments.length < 3 ? Target : _aFunction(arguments[2]);
    if (ARGS_BUG && !NEW_TARGET_BUG) return rConstruct(Target, args, newTarget);
    if (Target == newTarget) {
      // w/o altered newTarget, optimization for 0-4 arguments
      switch (args.length) {
        case 0: return new Target();
        case 1: return new Target(args[0]);
        case 2: return new Target(args[0], args[1]);
        case 3: return new Target(args[0], args[1], args[2]);
        case 4: return new Target(args[0], args[1], args[2], args[3]);
      }
      // w/o altered newTarget, lot of arguments case
      var $args = [null];
      $args.push.apply($args, args);
      return new (_bind.apply(Target, $args))();
    }
    // with altered newTarget, not support built-in constructors
    var proto = newTarget.prototype;
    var instance = _objectCreate(_isObject(proto) ? proto : Object.prototype);
    var result = Function.apply.call(Target, instance, args);
    return _isObject(result) ? result : instance;
  }
});

// Works with __proto__ only. Old v8 can't work with null proto objects.
/* eslint-disable no-proto */


var check = function (O, proto) {
  _anObject(O);
  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
};
var _setProto = {
  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
    function (test, buggy, set) {
      try {
        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) { buggy = true; }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy) O.__proto__ = proto;
        else set(O, proto);
        return O;
      };
    }({}, false) : undefined),
  check: check
};

var setPrototypeOf = _setProto.set;
var _inheritIfRequired = function (that, target, C) {
  var S = target.constructor;
  var P;
  if (S !== C && typeof S == 'function' && (P = S.prototype) !== C.prototype && _isObject(P) && setPrototypeOf) {
    setPrototypeOf(that, P);
  } return that;
};

var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

var space = '[' + _stringWs + ']';
var non = '\u200b\u0085';
var ltrim = RegExp('^' + space + space + '*');
var rtrim = RegExp(space + space + '*$');

var exporter = function (KEY, exec, ALIAS) {
  var exp = {};
  var FORCE = _fails(function () {
    return !!_stringWs[KEY]() || non[KEY]() != non;
  });
  var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
  if (ALIAS) exp[ALIAS] = fn;
  _export(_export.P + _export.F * FORCE, 'String', exp);
};

// 1 -> String#trimLeft
// 2 -> String#trimRight
// 3 -> String#trim
var trim = exporter.trim = function (string, TYPE) {
  string = String(_defined(string));
  if (TYPE & 1) string = string.replace(ltrim, '');
  if (TYPE & 2) string = string.replace(rtrim, '');
  return string;
};

var _stringTrim = exporter;

var gOPN = _objectGopn.f;
var gOPD$1 = _objectGopd.f;
var dP$2 = _objectDp.f;
var $trim = _stringTrim.trim;
var NUMBER = 'Number';
var $Number = _global[NUMBER];
var Base = $Number;
var proto$1 = $Number.prototype;
// Opera ~12 has broken Object#toString
var BROKEN_COF = _cof(_objectCreate(proto$1)) == NUMBER;
var TRIM = 'trim' in String.prototype;

// 7.1.3 ToNumber(argument)
var toNumber = function (argument) {
  var it = _toPrimitive(argument, false);
  if (typeof it == 'string' && it.length > 2) {
    it = TRIM ? it.trim() : $trim(it, 3);
    var first = it.charCodeAt(0);
    var third, radix, maxCode;
    if (first === 43 || first === 45) {
      third = it.charCodeAt(2);
      if (third === 88 || third === 120) return NaN; // Number('+0x1') should be NaN, old V8 fix
    } else if (first === 48) {
      switch (it.charCodeAt(1)) {
        case 66: case 98: radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
        case 79: case 111: radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
        default: return +it;
      }
      for (var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++) {
        code = digits.charCodeAt(i);
        // parseInt parses a string to a first unavailable symbol
        // but ToNumber should return NaN if a string contains unavailable symbols
        if (code < 48 || code > maxCode) return NaN;
      } return parseInt(digits, radix);
    }
  } return +it;
};

if (!$Number(' 0o1') || !$Number('0b1') || $Number('+0x1')) {
  $Number = function Number(value) {
    var it = arguments.length < 1 ? 0 : value;
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? _fails(function () { proto$1.valueOf.call(that); }) : _cof(that) != NUMBER)
        ? _inheritIfRequired(new Base(toNumber(it)), that, $Number) : toNumber(it);
  };
  for (var keys = _descriptors ? gOPN(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), j = 0, key$1; keys.length > j; j++) {
    if (_has(Base, key$1 = keys[j]) && !_has($Number, key$1)) {
      dP$2($Number, key$1, gOPD$1(Base, key$1));
    }
  }
  $Number.prototype = proto$1;
  proto$1.constructor = $Number;
  _redefine(_global, NUMBER, $Number);
}

// 20.1.2.4 Number.isNaN(number)


_export(_export.S, 'Number', {
  isNaN: function isNaN(number) {
    // eslint-disable-next-line no-self-compare
    return number != number;
  }
});

// 22.1.3.6 Array.prototype.fill(value, start = 0, end = this.length)


_export(_export.P, 'Array', { fill: _arrayFill });

_addToUnscopables('fill');

var gpuInstance = null;
/**
 * Sets up the gpu.js instance
 * @param value Instance of gpu.js
 */

function setup(value) {
  gpuInstance = value;
}
/**
 * Destroys any existing gpu.js instance
 */

function teardown() {
  if (gpuInstance !== null) {
    gpuInstance.destroy().catch(console.log);
  }

  gpuInstance = null;
}
/**
 * Compiles a function into a gpu.js kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */

function makeKernel(fn, settings) {
  var _gpuInstance = gpuInstance;

  if (_gpuInstance === null) {
    _gpuInstance = new require$$0.GPU({
      mode: 'gpu'
    });
    setup(_gpuInstance);
  }

  return _gpuInstance.createKernel(fn, settings).setPipeline(true);
}
function makeKernelMap(map, fn, settings) {
  var _gpuInstance = gpuInstance;

  if (_gpuInstance === null) {
    _gpuInstance = new require$$0.GPU({
      mode: 'gpu'
    });
    setup(_gpuInstance);
  }

  return _gpuInstance.createKernelMap(map, fn, settings).setPipeline(true);
}
/**
 * Compiles a function into a gpu.js dev mode kernel
 * @param fn The function to be compiled
 * @param settings Kernel settings/options
 */
// export function makeDevKernel(
//   fn: ThreadFunction,
//   settings: makeKernelSettings
// ): IKernelRunShortcut {
//   if ('map' in settings) {
//     throw new Error('map kernels are not supported by dev kernels');
//   }
//   const gpu = new GPU({ mode: 'dev' });
//   return gpu.createKernel(fn, settings);
// }

function kernelInput(value, size) {
  return new require$$0.Input(value, size);
}
/**
 * Deletes a gpu.js texture and frees VRAM
 * @param possibleTexture Texture to be deleted
 */

function release(possibleTexture) {
  if (possibleTexture instanceof require$$0.Texture) {
    possibleTexture.delete();
  }
}
/**
 * Cleans ie sets all elements to 0 of a Texture or a js array
 * @param value The value to be cleared
 */

function clear(value) {
  if (value instanceof require$$0.Texture) {
    value.clear();
    return;
  } // array


  if (Array.isArray(value)) {
    if (typeof value[0] === 'number') {
      value.fill(0);
    } else if (typeof value[0][0] === 'number') {
      for (var x = 0; x < value.length; x++) {
        value[x].fill(0);
      }

      return;
    } else if (typeof value[0][0][0] === 'number') {
      // cube
      for (var y = 0; y < value.length; y++) {
        var row = value[y];

        for (var _x = 0; _x < row.length; _x++) {
          row[_x].fill(0);
        }
      }

      return;
    }
  }

  throw new Error('unhandled value');
}
/**
 * Clones a value
 * @param value to be cloned
 */

function clone(value) {
  if (value instanceof require$$0.Texture) {
    return value.clone();
  }

  if (Array.isArray(value)) {
    if (typeof value[0] === 'number') {
      return value.slice(0);
    } else if (typeof value[0][0] === 'number') {
      var matrix = new Array(value.length);

      for (var x = 0; x < value.length; x++) {
        matrix[x] = value[x].slice(0);
      }

      return matrix;
    } else if (typeof value[0][0][0] === 'number') {
      var cube = new Array(value.length);

      for (var y = 0; y < value.length; y++) {
        var row = value[y];

        var _matrix = new Array(row.length);

        for (var _x2 = 0; _x2 < row.length; _x2++) {
          _matrix[_x2] = row[_x2].slice(0);
        }
      }

      return cube;
    }
  }

  throw new Error('unhandled value');
}

var kernel = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setup: setup,
  teardown: teardown,
  makeKernel: makeKernel,
  makeKernelMap: makeKernelMap,
  kernelInput: kernelInput,
  release: release,
  clear: clear,
  clone: clone
});

var defaults = {
  width: 1,
  height: 1,
  depth: null,
  weights: null,
  deltas: null,
  praxis: null,
  praxisOpts: null
};
var BaseLayer = /*#__PURE__*/function () {
  _createClass(BaseLayer, [{
    key: "width",
    get: function get() {
      return this.settings.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.settings.height;
    }
  }, {
    key: "depth",
    get: function get() {
      return this.settings.depth;
    }
  }, {
    key: "weights",
    get: function get() {
      return this.settings.weights;
    },
    set: function set(weights) {
      this.settings.weights = weights;
    }
  }, {
    key: "deltas",
    get: function get() {
      return this.settings.deltas;
    },
    set: function set(deltas) {
      this.settings.deltas = deltas;
    }
  }]);

  function BaseLayer(settings) {
    _classCallCheck(this, BaseLayer);

    _defineProperty(this, "praxis", null);

    _defineProperty(this, "predictKernel", null);

    _defineProperty(this, "compareKernel", null);

    _defineProperty(this, "settings", void 0);

    this.settings = _objectSpread2(_objectSpread2({}, defaults), settings);
    this.setupPraxis();
  }

  _createClass(BaseLayer, [{
    key: "setupPraxis",
    value: function setupPraxis() {
      var _this$settings = this.settings,
          initPraxis = _this$settings.initPraxis,
          praxis = _this$settings.praxis,
          praxisOpts = _this$settings.praxisOpts;

      if (!this.praxis) {
        if (initPraxis) {
          if (!praxisOpts) {
            throw new Error('settings.praxisOpts not included with settings.initPraxis');
          }

          this.praxis = initPraxis(this, praxisOpts);
        } else if (praxis) {
          this.praxis = praxis;
        }
      }
    }
    /*
    get weights() {
      return this._weights;
    }
     set weights(value) {
      if (value) {
        if (value.dimensions) {
          if (value.dimensions[0] !== this.width) {
            throw new Error(`${this.constructor.name}.weights being set with improper value width`);
          }
          if (value.dimensions[1] !== this.height) {
            throw new Error(`${this.constructor.name}.weights being set with improper value height`);
          }
        } else {
          if (value[0].length !== this.width) {
            throw new Error(`${this.constructor.name}.weights being set with improper value width`);
          }
          if (value.length !== this.height) {
            throw new Error(`${this.constructor.name}.weights being set with improper value height`);
          }
        }
      }
      this._weights = value;
    }
     get deltas() {
      return this._deltas;
    }
     set deltas(value) {
      if (value) {
        if (value.dimensions) {
          if (value.dimensions[0] !== this.width) {
            throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
          }
          if (value.dimensions[1] !== this.height) {
            throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
          }
        } else {
          if (value[0].length !== this.width) {
            throw new Error(`${this.constructor.name}.deltas being set with improper value width`);
          }
          if (value.length !== this.height) {
            throw new Error(`${this.constructor.name}.deltas being set with improper value height`);
          }
        }
      }
      this._deltas = value;
    } */

  }, {
    key: "validate",
    value: function validate() {
      if (Number.isNaN(this.height)) {
        throw new Error("".concat(this.constructor.name, " layer height is not a number"));
      }

      if (Number.isNaN(this.width)) {
        throw new Error("".concat(this.constructor.name, " layer width is not a number"));
      }

      if (this.height < 1) {
        throw new Error("".concat(this.constructor.name, " layer height is less than 1"));
      }

      if (this.width < 1) {
        throw new Error("".concat(this.constructor.name, " layer width is less than 1"));
      }
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {}
  }, {
    key: "reuseKernels",
    value: function reuseKernels(layer) {
      if (layer.width !== this.width) {
        throw new Error("".concat(this.constructor.name, " kernel width mismatch ").concat(layer.width, " is not ").concat(this.width));
      }

      if (layer.height !== this.height) {
        throw new Error("".concat(this.constructor.name, " kernel width mismatch ").concat(layer.height, " is not ").concat(this.height));
      }

      if (layer.hasOwnProperty('predictKernel')) {
        if (!layer.predictKernel.immutable) {
          throw new Error("".concat(layer.constructor.name, ".predictKernel is not reusable, set kernel.immutable = true"));
        }

        this.predictKernel = layer.predictKernel;
      }

      if (layer.hasOwnProperty('compareKernel')) {
        if (!layer.compareKernel.immutable) {
          throw new Error("".concat(layer.constructor.name, ".compareKernel is not reusable, set kernel.immutable = true"));
        }

        this.compareKernel = layer.compareKernel;
      }

      this.praxis = layer.praxis;
    }
  }, {
    key: "predict",
    value: function predict(inputs) {}
  }, {
    key: "compare",
    value: function compare() {}
  }, {
    key: "learn",
    value: function learn(learningRate) {
      // TODO: do we need to release here?
      var oldWeights = this.weights;
      if (!this.praxis) throw new Error('this.praxis not defined');
      this.weights = this.praxis.run(this, learningRate);
      release(oldWeights);
      clear(this.deltas);
    }
  }, {
    key: "toArray",
    value: function toArray() {
      return Array.isArray(this.weights) ? this.weights : this.weights.toArray();
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _objectSpread2(_objectSpread2({}, this.settings), {}, {
        weights: Array.isArray(this.weights) ? this.weights : this.weights.toArray(),
        deltas: null,
        praxis: null,
        name: this.constructor.name
      });
    }
  }]);

  return BaseLayer;
}();

var baseLayer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  defaults: defaults,
  BaseLayer: BaseLayer
});

/**
 * Returns an array of zeros
 */
function zeros(size) {
  return new Float32Array(size);
}

var zeros$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  zeros: zeros
});

/**
 * Returns a 2D tensor(matrix) of zeros
 */

function zeros2D(width, height) {
  var result = new Array(height);

  for (var y = 0; y < height; y++) {
    result[y] = zeros(width);
  }

  return result;
}

var zeros2d = /*#__PURE__*/Object.freeze({
  __proto__: null,
  zeros2D: zeros2D
});

/**
 * Returns a 3D tensor of arrays
 */

function zeros3D(width, height, depth) {
  var result = new Array(depth);

  for (var z = 0; z < depth; z++) {
    result[z] = zeros2D(width, height);
  }

  return result;
}

var zeros3d = /*#__PURE__*/Object.freeze({
  __proto__: null,
  zeros3D: zeros3D
});

var Activation = /*#__PURE__*/function (_BaseLayer) {
  _inherits(Activation, _BaseLayer);

  var _super = _createSuper(Activation);

  _createClass(Activation, [{
    key: "width",
    get: function get() {
      return this.inputLayer.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.inputLayer.height;
    }
  }, {
    key: "depth",
    get: function get() {
      return this.inputLayer.depth;
    }
  }]);

  function Activation(inputLayer, settings) {
    var _this;

    _classCallCheck(this, Activation);

    _this = _super.call(this, settings);

    _defineProperty(_assertThisInitialized(_this), "inputLayer", void 0);

    _this.inputLayer = inputLayer;

    var _assertThisInitialize = _assertThisInitialized(_this),
        width = _assertThisInitialize.width,
        height = _assertThisInitialize.height,
        depth = _assertThisInitialize.depth;

    _this.predictKernel = null;
    _this.compareKernel = null;

    _this.validate();

    if (depth > 0) {
      _this.weights = zeros3D(width, height, depth);
      _this.deltas = zeros3D(width, height, depth);
    } else if (height > 0) {
      _this.weights = zeros2D(width, height);
      _this.deltas = zeros2D(width, height);
    }

    _this.setupPraxis();

    return _this;
  }

  return Activation;
}(BaseLayer);

var activation$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Activation: Activation
});

var Operator = /*#__PURE__*/function (_BaseLayer) {
  _inherits(Operator, _BaseLayer);

  var _super = _createSuper(Operator);

  function Operator(inputLayer1, inputLayer2, settings) {
    var _this;

    _classCallCheck(this, Operator);

    _this = _super.call(this, settings);

    _defineProperty(_assertThisInitialized(_this), "inputLayer1", void 0);

    _defineProperty(_assertThisInitialized(_this), "inputLayer2", void 0);

    _this.inputLayer1 = inputLayer1;
    _this.inputLayer2 = inputLayer2;

    _this.validate();

    _this.weights = zeros2D(_this.width, _this.height);
    _this.deltas = zeros2D(_this.width, _this.height);

    _this.setupPraxis();

    return _this;
  }

  return Operator;
}(BaseLayer);

var Internal = function Internal() {
  _classCallCheck(this, Internal);
}; // eslint-disable-next-line @typescript-eslint/no-extraneous-class

var InternalModel = function InternalModel() {
  _classCallCheck(this, InternalModel);
}; // eslint-disable-next-line @typescript-eslint/no-extraneous-class

var EntryPoint = /*#__PURE__*/function (_BaseLayer) {
  _inherits(EntryPoint, _BaseLayer);

  var _super = _createSuper(EntryPoint);

  function EntryPoint() {
    _classCallCheck(this, EntryPoint);

    return _super.apply(this, arguments);
  }

  return EntryPoint;
}(BaseLayer); // eslint-disable-next-line @typescript-eslint/no-extraneous-class

var Filter = /*#__PURE__*/function (_BaseLayer2) {
  _inherits(Filter, _BaseLayer2);

  var _super2 = _createSuper(Filter);

  function Filter() {
    _classCallCheck(this, Filter);

    return _super2.apply(this, arguments);
  }

  return Filter;
}(BaseLayer); // eslint-disable-next-line @typescript-eslint/no-extraneous-class

var Model = /*#__PURE__*/function (_BaseLayer3) {
  _inherits(Model, _BaseLayer3);

  var _super3 = _createSuper(Model);

  function Model() {
    _classCallCheck(this, Model);

    return _super3.apply(this, arguments);
  }

  return Model;
}(BaseLayer); // eslint-disable-next-line @typescript-eslint/no-extraneous-class

var Modifier = /*#__PURE__*/function (_BaseLayer4) {
  _inherits(Modifier, _BaseLayer4);

  var _super4 = _createSuper(Modifier);

  function Modifier() {
    _classCallCheck(this, Modifier);

    return _super4.apply(this, arguments);
  }

  return Modifier;
}(BaseLayer);

var types = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Internal: Internal,
  InternalModel: InternalModel,
  EntryPoint: EntryPoint,
  Filter: Filter,
  Model: Model,
  Modifier: Modifier,
  Activation: Activation
});

/**
 *
 * @param {Base} layer1
 * @param {Base} layer2
 */
function checkSameSize(layer1, layer2) {
  if (layer1.width !== layer2.width) {
    throw new Error("Layer width mismatch of ".concat(layer1.width, " and ").concat(layer2.width));
  }

  if (layer1.height !== layer2.height) {
    throw new Error("Layer height mismatch of ".concat(layer1.height, " and ").concat(layer2.height));
  }
}

var layerSize = {
  checkSameSize: checkSameSize
};

function predict(inputWeights1, inputWeights2) {
  return inputWeights1[this.thread.y][this.thread.x] + inputWeights2[this.thread.y][this.thread.x];
}
var Add = /*#__PURE__*/function (_Operator) {
  _inherits(Add, _Operator);

  var _super = _createSuper(Add);

  function Add() {
    _classCallCheck(this, Add);

    return _super.apply(this, arguments);
  }

  _createClass(Add, [{
    key: "validate",
    value: function validate() {
      _get(_getPrototypeOf(Add.prototype), "validate", this).call(this);

      layerSize.checkSameSize(this.inputLayer1, this.inputLayer2);
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict, {
        output: [this.width, this.height],
        immutable: true
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      release(this.weights);
      this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
      clear(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      // TODO: Do we need release and clone here?
      release(this.inputLayer1.deltas);
      release(this.inputLayer2.deltas);
      this.inputLayer1.deltas = clone(this.deltas);
      this.inputLayer2.deltas = clone(this.deltas);
    }
    /**
     * @abstract
     */

  }, {
    key: "learn",
    value: function learn() {}
  }]);

  return Add;
}(Operator);
function add(inputLayer1, inputLayer2, settings) {
  return new Add(inputLayer1, inputLayer2, settings);
}

var add$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  predict: predict,
  Add: Add,
  add: add
});

var BasePraxis = /*#__PURE__*/function () {
  _createClass(BasePraxis, [{
    key: "width",
    get: function get() {
      return this.layerTemplate.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.layerTemplate.height;
    }
  }, {
    key: "depth",
    get: function get() {
      return this.layerTemplate.depth;
    }
  }]);

  function BasePraxis(layerTemplate, settings) {
    _classCallCheck(this, BasePraxis);

    _defineProperty(this, "settings", void 0);

    _defineProperty(this, "layerTemplate", void 0);

    _defineProperty(this, "kernel", void 0);

    this.layerTemplate = layerTemplate;
    this.settings = _objectSpread2({}, settings);
    this.kernel = null;
  }

  _createClass(BasePraxis, [{
    key: "setupKernels",
    value: function setupKernels() {}
  }, {
    key: "reuseKernels",
    value: function reuseKernels(praxis) {
      if (praxis.width !== this.width) {
        throw new Error("".concat(this.constructor.name, " kernel width mismatch ").concat(praxis.width, " is not ").concat(this.width));
      }

      if (praxis.height !== this.height) {
        throw new Error("".concat(this.constructor.name, " kernel width mismatch ").concat(praxis.height, " is not ").concat(this.height));
      }

      if (praxis.hasOwnProperty('kernel')) {
        this.kernel = praxis.kernel;
      }
    }
  }]);

  return BasePraxis;
}();

var basePraxis = /*#__PURE__*/Object.freeze({
  __proto__: null,
  BasePraxis: BasePraxis
});

function updateChange(value) {
  return value;
}

function update(changes, weights, incomingWeights, inputDeltas) {
  var lastChange = changes[this.thread.y][this.thread.x];
  var inputDelta = inputDeltas[this.thread.y][0];
  var weight = weights[this.thread.y][this.thread.x];
  var incoming = incomingWeights[this.thread.x][0];
  var change = this.constants.learningRate * inputDelta * incoming + this.constants.momentum * lastChange;
  return weight + change;
}

var ArthurDeviationWeights = /*#__PURE__*/function (_BasePraxis) {
  _inherits(ArthurDeviationWeights, _BasePraxis);

  var _super = _createSuper(ArthurDeviationWeights);

  _createClass(ArthurDeviationWeights, [{
    key: "learningRate",
    get: function get() {
      return this.settings.learningRate;
    }
  }, {
    key: "momentum",
    get: function get() {
      return this.settings.momentum;
    }
  }], [{
    key: "defaults",
    get: function get() {
      return {
        learningRate: 0.3,
        momentum: 0.1
      };
    }
  }]);

  function ArthurDeviationWeights(layer, settings) {
    var _this;

    _classCallCheck(this, ArthurDeviationWeights);

    _this = _super.call(this, layer, settings);

    _defineProperty(_assertThisInitialized(_this), "weightsLayer", null);

    _defineProperty(_assertThisInitialized(_this), "incomingLayer", null);

    _defineProperty(_assertThisInitialized(_this), "deltaLayer", null);

    _defineProperty(_assertThisInitialized(_this), "changes", void 0);

    _defineProperty(_assertThisInitialized(_this), "kernelMap", null);

    if (settings) {
      if (settings.weightsLayer) {
        _this.weightsLayer = settings.weightsLayer;
      }

      if (settings.incomingLayer) {
        _this.incomingLayer = settings.incomingLayer;
      }

      if (settings.deltaLayer) {
        _this.deltaLayer = settings.deltaLayer;
      }
    }

    _this.changes = zeros2D(layer.width, layer.height);
    return _this;
  }

  _createClass(ArthurDeviationWeights, [{
    key: "run",
    value: function run() {
      var output = this.kernelMap(this.changes, this.weightsLayer.weights, this.incomingLayer.weights, this.deltaLayer.deltas);
      this.changes = output.changes;
      return output.result;
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.kernelMap = makeKernelMap({
        changes: updateChange
      }, update, {
        output: [this.width, this.height],
        constants: {
          learningRate: this.learningRate,
          momentum: this.momentum
        }
      });
    }
  }]);

  return ArthurDeviationWeights;
}(BasePraxis);
function arthurDeviationWeights(layer, settings) {
  return new ArthurDeviationWeights(layer, settings);
}

var arthurDeviationWeights$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ArthurDeviationWeights: ArthurDeviationWeights,
  arthurDeviationWeights: arthurDeviationWeights
});

function update$1(weights, deltas) {
  return weights[this.thread.y][this.thread.x] + this.constants.learningRate * deltas[this.thread.y][this.thread.x];
}
var ArthurDeviationBiases = /*#__PURE__*/function (_BasePraxis) {
  _inherits(ArthurDeviationBiases, _BasePraxis);

  var _super = _createSuper(ArthurDeviationBiases);

  _createClass(ArthurDeviationBiases, null, [{
    key: "defaults",
    get: function get() {
      return {
        learningRate: 0.3
      };
    }
  }]);

  function ArthurDeviationBiases(layer, settings) {
    var _this;

    _classCallCheck(this, ArthurDeviationBiases);

    _this = _super.call(this, layer, settings);
    _this.kernel = null;
    return _this;
  }

  _createClass(ArthurDeviationBiases, [{
    key: "run",
    value: function run(layer, learningRate) {
      return this.kernel(layer.weights, layer.deltas);
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.kernel = makeKernel(update$1, {
        output: [this.width, this.height],
        constants: {
          learningRate: this.settings.learningRate
        }
      });
    }
  }]);

  return ArthurDeviationBiases;
}(BasePraxis);
function arthurDeviationBiases(layer, settings) {
  return new ArthurDeviationBiases(layer, settings);
}

var arthurDeviationBiases$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  update: update$1,
  ArthurDeviationBiases: ArthurDeviationBiases,
  arthurDeviationBiases: arthurDeviationBiases
});

function randomWeight() {
  return Math.random() * 0.4 - 0.2;
}

function randomFloat(a, b) {
  return Math.random() * (b - a) + a;
} // Random numbers utils

function gaussRandom() {
  if (returnV) {
    returnV = false;
    return vVal;
  }

  var u = 2 * Math.random() - 1;
  var v = 2 * Math.random() - 1;
  var r = u * u + v * v;

  if (r === 0 || r > 1) {
    return gaussRandom();
  }

  var c = Math.sqrt(-2 * Math.log(r) / r);
  vVal = v * c; // cache this

  returnV = true;
  return u * c;
}
var returnV = false;
var vVal = 0;
function randomInteger(a, b) {
  return Math.floor(Math.random() * (b - a) + a);
}
function randomN(mu, std) {
  return mu + gaussRandom() * std;
}

var random = /*#__PURE__*/Object.freeze({
  __proto__: null,
  randomFloat: randomFloat,
  gaussRandom: gaussRandom,
  randomInteger: randomInteger,
  randomN: randomN
});

function randos(size, std) {
  var array = new Float32Array(size);

  if (std) {
    for (var i = 0; i < size; i++) {
      array[i] = randomFloat(-std, std);
    }
  } else {
    for (var _i = 0; _i < size; _i++) {
      array[_i] = randomWeight();
    }
  }

  return array;
}

var randos$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  randos: randos
});

function randos2D(width, height, std) {
  var result = new Array(height);

  for (var y = 0; y < height; y++) {
    result[y] = randos(width, std);
  }

  return result;
}

var randos2d = /*#__PURE__*/Object.freeze({
  __proto__: null,
  randos2D: randos2D
});

var defaults$1 = {
  std: null
};
var Random = /*#__PURE__*/function (_Model) {
  _inherits(Random, _Model);

  var _super = _createSuper(Random);

  function Random(settings) {
    var _this;

    _classCallCheck(this, Random);

    _this = _super.call(this, settings);

    _this.validate();

    if (!_this.weights) {
      // @ts-ignore
      _this.weights = randos2D(_this.width, _this.height, settings.std);
    }

    if (!_this.deltas) {
      // @ts-ignore
      _this.deltas = zeros2D(_this.width, _this.height);
    }

    return _this;
  }

  _createClass(Random, [{
    key: "predict",
    value: function predict() {}
  }, {
    key: "compare",
    value: function compare() {}
  }]);

  return Random;
}(Model);
function random$1(settings) {
  return new Random(settings);
}

var random$2 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  defaults: defaults$1,
  Random: Random,
  random: random$1
});

function predict$1(weights1, weights2) {
  var sum = 0;

  for (var i = 0; i < this.constants.size; i++) {
    sum += weights1[this.thread.y][i] * weights2[i][this.thread.x];
  }

  return sum;
}
function compareFromX(deltas, inputDeltas, inputWeights) {
  var sum = inputDeltas[this.thread.y][this.thread.x];

  for (var i = 0; i < this.constants.size; i++) {
    sum += deltas[this.thread.y][i] * inputWeights[this.thread.x][i];
  }

  return sum;
}
function compareFromY(deltas, inputDeltas, inputWeights) {
  var sum = inputDeltas[this.thread.y][this.thread.x];

  for (var i = 0; i < this.constants.size; i++) {
    sum += deltas[i][this.thread.x] * inputWeights[i][this.thread.y];
  }

  return sum;
}
var Multiply = /*#__PURE__*/function (_Operator) {
  _inherits(Multiply, _Operator);

  var _super = _createSuper(Multiply);

  function Multiply() {
    var _this;

    _classCallCheck(this, Multiply);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _super.call.apply(_super, [this].concat(args));

    _defineProperty(_assertThisInitialized(_this), "compareKernel1", null);

    _defineProperty(_assertThisInitialized(_this), "compareKernel2", null);

    return _this;
  }

  _createClass(Multiply, [{
    key: "validate",
    value: function validate() {
      _get(_getPrototypeOf(Multiply.prototype), "validate", this).call(this);

      if (this.inputLayer1.width !== this.inputLayer2.height) {
        throw new Error("Layer width mismatch of ".concat(this.inputLayer1.width, " and ").concat(this.inputLayer2.height));
      }
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel(predict$1, {
        output: [this.width, this.height],
        constants: {
          size: this.inputLayer2.height
        },
        immutable: true
      });
      this.compareKernel1 = makeKernel(compareFromX, {
        output: [this.inputLayer1.width, this.inputLayer1.height],
        constants: {
          size: this.inputLayer2.width
        },
        immutable: true
      });
      this.compareKernel2 = makeKernel(compareFromY, {
        output: [this.inputLayer2.width, this.inputLayer2.height],
        constants: {
          size: this.inputLayer1.height
        },
        immutable: true
      });
    }
  }, {
    key: "reuseKernels",
    value: function reuseKernels(layer) {
      _get(_getPrototypeOf(Multiply.prototype), "reuseKernels", this).call(this, layer);

      this.compareKernel1 = layer.compareKernel1;
      this.compareKernel2 = layer.compareKernel2;
    }
  }, {
    key: "predict",
    value: function predict() {
      release(this.weights);
      if (!this.predictKernel) throw new Error('this.predictKernel is not set');
      this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
      clear(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      if (!this.compareKernel1) throw new Error('this.compareKernel1 not set');
      if (!this.compareKernel2) throw new Error('this.compareKernel2 not set');
      var inputLayer1Deltas = this.inputLayer1.deltas;
      var inputLayer2Deltas = this.inputLayer2.deltas;
      var newDeltas1 = this.compareKernel1(this.deltas, this.inputLayer1.deltas, this.inputLayer2.weights);
      var newDeltas2 = this.compareKernel2(this.deltas, this.inputLayer2.deltas, this.inputLayer1.weights);
      this.inputLayer2.deltas = newDeltas2;
      this.inputLayer1.deltas = newDeltas1;
      release(inputLayer1Deltas);
      release(inputLayer2Deltas);
    }
  }, {
    key: "setupPraxis",
    value: function setupPraxis() {}
  }, {
    key: "learn",
    value: function learn() {}
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _objectSpread2(_objectSpread2({}, _get(_getPrototypeOf(Multiply.prototype), "toJSON", this).call(this)), {}, {
        width: this.width,
        height: this.height
      });
    }
  }, {
    key: "width",
    get: function get() {
      return this.inputLayer2.width;
    },
    set: function set(width) {
      throw new Error('Cannot set width on Multiply');
    }
  }, {
    key: "height",
    get: function get() {
      return this.inputLayer1.height;
    },
    set: function set(height) {
      throw new Error('Cannot set height on Multiply');
    }
  }]);

  return Multiply;
}(Operator);
function multiply(inputLayer1, inputLayer2, settings) {
  return new Multiply(inputLayer1, inputLayer2, settings);
}

var multiply$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  predict: predict$1,
  compareFromX: compareFromX,
  compareFromY: compareFromY,
  Multiply: Multiply,
  multiply: multiply
});

var Activation$1 = types.Activation;
var makeKernel$1 = kernel.makeKernel,
    release$1 = kernel.release,
    clear$1 = kernel.clear;
var activate$4 = sigmoid.activate,
    measure$4 = sigmoid.measure;

function predict2D(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.y][this.thread.x]));
}

function predict3D(inputs) {
  return 1 / (1 + Math.exp(-inputs[this.thread.z][this.thread.y][this.thread.x]));
}

function compare2D(weights, deltas) {
  var weight = weights[this.thread.y][this.thread.x];
  var delta = deltas[this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

function compare3D(weights, deltas) {
  var weight = weights[this.thread.z][this.thread.y][this.thread.x];
  var delta = deltas[this.thread.z][this.thread.y][this.thread.x];
  return weight * (1 - weight) * delta;
}

var Sigmoid = /*#__PURE__*/function (_Activation) {
  _inherits(Sigmoid, _Activation);

  var _super = _createSuper(Sigmoid);

  function Sigmoid() {
    _classCallCheck(this, Sigmoid);

    return _super.apply(this, arguments);
  }

  _createClass(Sigmoid, [{
    key: "setupKernels",
    value: function setupKernels() {
      if (this.depth > 0) {
        this.predictKernel = makeKernel$1(predict3D, {
          output: [this.width, this.height, this.depth],
          functions: [activate$4],
          immutable: true
        });
        this.compareKernel = makeKernel$1(compare3D, {
          output: [this.width, this.height, this.depth],
          functions: [measure$4],
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$1(predict2D, {
          output: [this.width, this.height],
          functions: [activate$4],
          immutable: true
        });
        this.compareKernel = makeKernel$1(compare2D, {
          output: [this.width, this.height],
          functions: [measure$4],
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      release$1(this.weights);
      this.weights = this.predictKernel(this.inputLayer.weights);
      clear$1(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      release$1(this.inputLayer.deltas);
      this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return Sigmoid;
}(Activation$1);

function sigmoid$1(inputLayer, settings) {
  return new Sigmoid(inputLayer, settings);
}

var sigmoid_1 = {
  Sigmoid: Sigmoid,
  sigmoid: sigmoid$1,
  predict2D: predict2D,
  predict3D: predict3D,
  compare2D: compare2D,
  compare3D: compare3D
};

var arthurDeviationWeights$2 = arthurDeviationWeights$1.arthurDeviationWeights;
var arthurDeviationBiases$2 = arthurDeviationBiases$1.arthurDeviationBiases;
var add$2 = add$1.add;
var random$3 = random$2.random;
var multiply$2 = multiply$1.multiply;
var sigmoid$2 = sigmoid_1.sigmoid;

function arthurFeedForward(settings, inputLayer) {
  var height = settings.height;

  function weightsPraxis(layer, settings) {
    var praxis = arthurDeviationWeights$2(layer, settings);
    praxis.setupKernels();
    return praxis;
  }

  function biasesPraxis(layer, settings) {
    var praxis = arthurDeviationBiases$2(layer, settings);
    praxis.setupKernels();
    return praxis;
  }

  var weightsLayer = random$3({
    name: 'weights',
    height: height,
    width: inputLayer.height,
    praxis: weightsPraxis
  });
  var biasesLayer = random$3({
    name: 'biases',
    height: height,
    praxis: biasesPraxis
  });
  var multiplyLayer = multiply$2(weightsLayer, inputLayer);
  var addLayer = add$2(multiplyLayer, biasesLayer);
  var sigmoidLayer = sigmoid$2(addLayer);
  weightsLayer.praxis.weightsLayer = weightsLayer;
  weightsLayer.praxis.incomingLayer = inputLayer;
  weightsLayer.praxis.deltaLayer = sigmoidLayer;
  return sigmoidLayer;
}

var arthurFeedForward_1 = {
  arthurFeedForward: arthurFeedForward
};

function setStride(layer, settings) {
  var defaults = layer.constructor.defaults;

  if (settings.hasOwnProperty('stride')) {
    layer.strideX = settings.stride;
    layer.strideY = settings.stride;
  } else {
    if (settings.hasOwnProperty('strideX')) {
      layer.strideX = settings.strideX;
    } else {
      layer.strideX = defaults.stride;
    }

    if (settings.hasOwnProperty('strideY')) {
      layer.strideY = settings.strideY;
    } else {
      layer.strideY = defaults.stride;
    }
  }
}

function setPadding(layer, settings) {
  var defaults = layer.constructor.defaults;

  if (settings.hasOwnProperty('padding')) {
    layer.paddingX = settings.padding;
    layer.paddingY = settings.padding;
  } else {
    if (settings.hasOwnProperty('paddingX')) {
      layer.paddingX = settings.paddingX;
    } else {
      layer.paddingX = defaults.padding;
    }

    if (settings.hasOwnProperty('paddingY')) {
      layer.paddingY = settings.paddingY;
    } else {
      layer.paddingY = defaults.padding;
    }
  }
}

var layerSetup = {
  setStride: setStride,
  setPadding: setPadding
};

function randos3D(width, height, depth, std) {
  var result = new Array(depth);

  for (var z = 0; z < depth; z++) {
    result[z] = randos2D(width, height, std);
  }

  return result;
}

var randos3d = /*#__PURE__*/Object.freeze({
  __proto__: null,
  randos3D: randos3D
});

/**
 * Returns an array of a given size with each element filled with a single value
 */
function values(size, value) {
  return new Float32Array(size).fill(value);
}

var values$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  values: values
});

var makeKernel$2 = kernel.makeKernel,
    release$2 = kernel.release,
    clone$1 = kernel.clone,
    clear$2 = kernel.clear;
var setStride$1 = layerSetup.setStride,
    setPadding$1 = layerSetup.setPadding;
var Filter$1 = types.Filter;
var zeros3D$1 = zeros3d.zeros3D;

function predict$2(inputs, filters, biases) {
  var startFilterX = this.constants.paddingX - this.thread.x * this.constants.strideX;
  var startInputX = this.thread.x * this.constants.strideX - this.constants.paddingX;
  var endFilterX = Math.min(this.constants.filterWidth, startFilterX + this.constants.inputWidth);
  var startFilterY = this.constants.paddingY - this.thread.y * this.constants.strideY;
  var startInputY = this.thread.y * this.constants.strideY - this.constants.paddingY;
  var endFilterY = Math.min(this.constants.filterHeight, startFilterY + this.constants.inputHeight);
  var sum = 0;

  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var filterY = Math.max(0, startFilterY), inputY = Math.max(0, startInputY); filterY < endFilterY; filterY++, inputY++) {
      for (var filterX = Math.max(0, startFilterX), inputX = Math.max(0, startInputX); filterX < endFilterX; filterX++, inputX++) {
        sum += filters[z][filterY][filterX] * inputs[z][inputY][inputX];
      }
    }
  }

  return sum + biases[this.thread.z];
}

function compareFilterDeltas(filterDeltas, inputs, deltas) {
  var startDeltaX = Math.max(0, Math.ceil((this.constants.paddingX - this.thread.x) / this.constants.strideX));
  var startInputX = startDeltaX * this.constants.strideX + this.thread.x - this.constants.paddingX;
  var endDeltaX = Math.min(this.constants.deltaWidth, Math.floor((this.constants.inputWidth - 1 - this.thread.x + this.constants.paddingX) / this.constants.strideX) + 1);
  var startDeltaY = Math.max(0, Math.ceil((this.constants.paddingY - this.thread.y) / this.constants.strideY));
  var startInputY = startDeltaY * this.constants.strideY + this.thread.y - this.constants.paddingY;
  var endDeltaY = Math.min(this.constants.deltaHeight, Math.floor((this.constants.inputHeight - 1 - this.thread.y + this.constants.paddingY) / this.constants.strideY) + 1);
  var sum = filterDeltas[this.thread.z][this.thread.y][this.thread.x];

  for (var deltaY = startDeltaY, inputY = startInputY; deltaY < endDeltaY; deltaY++, inputY += this.constants.strideY) {
    for (var deltaX = startDeltaX, inputX = startInputX; deltaX < endDeltaX; deltaX++, inputX += this.constants.strideX) {
      sum += inputs[this.thread.z][inputY][inputX] * deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }

  return sum;
}

function compareInputDeltas(inputDeltas, filters, deltas) {
  var x = this.thread.x + this.constants.paddingX;
  var startDeltaX = x < this.constants.filterWidth ? 0 : Math.floor((x - this.constants.filterWidth + this.constants.strideX) / this.constants.strideX);
  var startFilterX = x - startDeltaX * this.constants.strideX;
  var endDeltaX = Math.min(startDeltaX + Math.floor(startFilterX / this.constants.strideX) + 1, this.constants.deltaWidth);
  var y = this.thread.y + this.constants.paddingY;
  var startDeltaY = y < this.constants.filterHeight ? 0 : Math.floor((y - this.constants.filterHeight + this.constants.strideY) / this.constants.strideY);
  var startFilterY = y - startDeltaY * this.constants.strideY;
  var endDeltaY = Math.min(startDeltaY + Math.floor(startFilterY / this.constants.strideY) + 1, this.constants.deltaHeight);
  var sum = inputDeltas[this.thread.z][this.thread.y][this.thread.x];
  var deltaY = startDeltaY;

  for (var filterY = startFilterY; deltaY < endDeltaY; filterY -= this.constants.strideY, deltaY++) {
    var deltaX = startDeltaX;

    for (var filterX = startFilterX; deltaX < endDeltaX; filterX -= this.constants.strideX, deltaX++) {
      sum += filters[this.thread.z][filterY][filterX] * deltas[this.constants.deltaZ][deltaY][deltaX];
    }
  }

  return sum;
}

function compareBiases(biasDeltas, deltas) {
  var sum = 0;

  for (var y = 0; y < this.constants.deltaHeight; y++) {
    for (var x = 0; x < this.constants.deltaWidth; x++) {
      sum += deltas[this.thread.z][y][x];
    }
  }

  return biasDeltas[this.thread.z][this.thread.y][this.thread.x] + sum;
}

var Convolution = /*#__PURE__*/function (_Filter) {
  _inherits(Convolution, _Filter);

  var _super = _createSuper(Convolution);

  _createClass(Convolution, null, [{
    key: "defaults",
    get: function get() {
      return {
        stride: 0,
        padding: 0,
        bias: 0.1,
        filterCount: 1,
        filterWidth: 0,
        filterHeight: 0
      };
    }
  }]);

  function Convolution(settings, inputLayer) {
    var _this;

    _classCallCheck(this, Convolution);

    _this = _super.call(this, settings);
    _this.stride = null;
    _this.strideX = null;
    _this.strideY = null;
    setStride$1(_assertThisInitialized(_this), settings);
    _this.padding = null;
    _this.paddingX = null;
    _this.paddingY = null;
    setPadding$1(_assertThisInitialized(_this), settings);
    _this.filterCount = settings.filterCount;
    _this.filterWidth = settings.filterWidth;
    _this.filterHeight = settings.filterHeight;
    _this.width = Math.floor((inputLayer.width + _this.paddingX * 2 - _this.filterWidth) / _this.strideX + 1);
    _this.height = Math.floor((inputLayer.height + _this.paddingY * 2 - _this.filterHeight) / _this.strideY + 1);
    _this.depth = _this.filterCount;
    _this.weights = randos3d(_this.width, _this.height, _this.depth);
    _this.deltas = zeros3D$1(_this.width, _this.height, _this.depth);
    _this.biases = values$1(_this.depth, _this.bias);
    _this.biasDeltas = randos$1(_this.depth);
    _this.filters = randos3d(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.filterDeltas = zeros3D$1(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;

    _this.validate();

    return _this;
  }

  _createClass(Convolution, [{
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel$2(predict$2, {
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          inputDepth: this.inputLayer.depth,
          strideX: this.strideX,
          strideY: this.strideY,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterWidth: this.filterWidth,
          filterHeight: this.filterHeight
        },
        output: [this.width, this.height, this.depth],
        immutable: true
      });
      this.compareFilterDeltasKernel = makeKernel$2(compareFilterDeltas, {
        constants: {
          deltasWidth: this.width,
          deltasHeight: this.height,
          deltasDepth: this.depth,
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          inputDepth: this.inputLayer.depth,
          strideX: this.strideX,
          strideY: this.strideY,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterWidth: this.filterWidth,
          filterHeight: this.filterHeight
        },
        output: [this.width, this.height, this.depth],
        immutable: true
      });
      this.compareInputDeltasKernel = makeKernel$2(compareInputDeltas, {
        constants: {
          filterCount: this.filterCount
        },
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth],
        immutable: true
      });
      this.compareBiasesKernel = makeKernel$2(compareBiases, {
        output: [1, 1, this.depth],
        constants: {
          deltaWidth: this.width,
          deltaHeight: this.height
        },
        immutable: true
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
    }
  }, {
    key: "compare",
    value: function compare() {
      var filterDeltas = this.filterDeltas,
          biasDeltas = this.biasDeltas;
      this.filterDeltas = this.compareFilterDeltasKernel(filterDeltas, this.inputLayer.weights, this.deltas);
      release$2(filterDeltas);
      this.biasDeltas = this.compareBiasesKernel(biasDeltas, this.deltas);
      release$2(biasDeltas);
      release$2(this.deltas);
      this.deltas = this.compareInputDeltasKernel(this.filters, this.inputLayer.deltas);
      release$2(this.inputLayer.deltas); // TODO: do we need to clone here?

      this.inputLayer.deltas = clone$1(this.deltas);
    }
  }, {
    key: "learn",
    value: function learn(learningRate) {
      // TODO: handle filters
      // TODO: do we need to release here?
      var oldWeights = this.weights;
      this.weights = this.praxis.run(this, learningRate);
      release$2(oldWeights);
      clear$2(this.deltas);
    }
  }]);

  return Convolution;
}(Filter$1);

function convolution(settings, inputLayer) {
  return new Convolution(settings, inputLayer);
}

var convolution_1 = {
  Convolution: Convolution,
  convolution: convolution,
  predict: predict$2,
  compareFilterDeltas: compareFilterDeltas,
  compareInputDeltas: compareInputDeltas,
  compareBiases: compareBiases
};

var Filter$2 = types.Filter;
var makeKernel$3 = kernel.makeKernel,
    release$3 = kernel.release;

function setDropout(dropout) {
  return dropout;
}

function trainingPredict(inputs) {
  if (setDropout(Math.random()) < this.constants.probability) {
    return 0;
  }

  return inputs[this.thread.y][this.thread.x];
}

function predict$3(inputs) {
  return inputs[this.thread.y][this.thread.x] * this.constants.probability;
}

function compare(dropouts, deltas) {
  if (dropouts[this.thread.y][this.thread.x] === 0) {
    return 0;
  }

  return deltas[this.thread.y][this.thread.x];
}

var Dropout = /*#__PURE__*/function (_Filter) {
  _inherits(Dropout, _Filter);

  var _super = _createSuper(Dropout);

  _createClass(Dropout, null, [{
    key: "defaults",
    get: function get() {
      return {
        width: 1,
        height: 1,
        depth: null,
        probability: 0.5
      };
    }
  }]);

  function Dropout(inputLayer, settings) {
    var _this;

    _classCallCheck(this, Dropout);

    _this = _super.call(this, settings);
    _this.inputLayer = inputLayer;
    _this.height = inputLayer.height;
    _this.width = inputLayer.width;
    _this.dropouts = null;

    _this.validate();

    return _this;
  }

  _createClass(Dropout, [{
    key: "setupKernels",
    value: function setupKernels(isTraining) {
      var output = [this.width, this.height];

      if (isTraining) {
        this.predictKernel = makeKernel$3(trainingPredict, {
          output: output,
          map: {
            dropouts: setDropout
          },
          immutable: true
        });
        this.compareKernel = makeKernel$3(compare, {
          output: output,
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$3(predict$3, {
          output: output,
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      release$3(this.weights);
      release$3(this.dropouts);

      var _this$predictKernel = this.predictKernel(this.inputLayer.weights),
          result = _this$predictKernel.result,
          dropouts = _this$predictKernel.dropouts;

      this.weights = result;
      this.dropouts = dropouts;
    }
  }, {
    key: "compare",
    value: function compare() {
      release$3(this.deltas);
      this.deltas = this.compareKernel(this.dropouts, this.inputLayer.deltas);
    }
  }]);

  return Dropout;
}(Filter$2);

function dropout(settings, inputLayer) {
  return new Dropout(settings, inputLayer);
}

var dropout_1 = {
  Dropout: Dropout,
  dropout: dropout,
  setDropout: setDropout,
  trainingPredict: trainingPredict,
  predict: predict$3,
  compare: compare
};

var random$4 = random$2.random;
var add$3 = add$1.add;
var multiply$3 = multiply$1.multiply;
var sigmoid$3 = sigmoid_1.sigmoid;

function feedForward(settings, input) {
  var height = settings.height,
      praxisOpts = settings.praxisOpts;
  var weights = random$4({
    name: 'weights',
    height: height,
    width: input.height,
    praxisOpts: praxisOpts
  });
  var biases = random$4({
    name: 'biases',
    height: height,
    praxisOpts: praxisOpts
  });
  return sigmoid$3(add$3(multiply$3(weights, input, {
    praxisOpts: praxisOpts
  }), biases, {
    praxisOpts: praxisOpts
  }), {
    praxisOpts: praxisOpts
  });
}

var feedForward_1 = {
  feedForward: feedForward
};

var Filter$3 = types.Filter;
var makeKernel$4 = kernel.makeKernel,
    release$4 = kernel.release;
var zeros$2 = zeros$1.zeros;
var zeros2D$1 = zeros2d.zeros2D;
var zeros3D$2 = zeros3d.zeros3D;

function predict$4(inputs, filters, biases) {
  var output = 0;
  var i = 0;

  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      output += inputs[y][x] * filters[this.thread.x][i];
      i++;
    }
  }

  return output + biases[this.thread.x];
}

function predict3D$1(inputs, filters, biases) {
  var output = 0;
  var i = 0;

  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        output += inputs[z][y][x] * filters[this.thread.x][i];
        i++;
      }
    }
  }

  return output + biases[this.thread.x];
}

function compareInputDeltas$1(inputDeltas, deltas, filters) {
  var sum = 0;
  var filterX = this.thread.x + this.thread.y * this.output.x;

  for (var filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }

  return sum + inputDeltas[this.thread.y][this.thread.x];
}

function compareInputDeltas3D(inputDeltas, deltas, filters) {
  var sum = 0;
  var filterX = this.thread.x + this.thread.y * this.output.x;

  for (var filterY = 0; filterY < this.constants.filterCount; filterY++) {
    sum += filters[filterY][filterX] * deltas[0][filterY];
  }

  return sum + inputDeltas[this.thread.z][this.thread.y][this.thread.x];
}

function compareBiases$1(biases, deltas) {
  return biases[this.thread.x] + deltas[this.thread.y][this.thread.x];
}

function compareFilterDeltas$1(filterDeltas, inputWeights, deltas) {
  return filterDeltas[this.thread.y][this.thread.x] + inputWeights[this.thread.y][this.thread.x] * deltas[this.constants.deltaY][this.constants.deltaX];
}

function compareFilterDeltas3D(filterDeltas, inputWeights, deltas) {
  var inputZ = Math.floor(this.thread.x / (this.constants.inputWidth * this.constants.inputHeight));
  var inputY = Math.floor((this.thread.x - inputZ * this.constants.inputWidth * this.constants.inputHeight) / this.constants.inputWidth);
  var inputX = this.thread.x - this.constants.inputWidth * (inputY + this.constants.inputHeight * inputZ);
  return filterDeltas[this.thread.y][this.thread.x] + inputWeights[inputZ][inputY][inputX] * deltas[0][this.thread.y];
}

var FullyConnected = /*#__PURE__*/function (_Filter) {
  _inherits(FullyConnected, _Filter);

  var _super = _createSuper(FullyConnected);

  _createClass(FullyConnected, null, [{
    key: "defaults",
    get: function get() {
      return {
        bias: 0.1
      };
    }
  }]);

  function FullyConnected(settings, inputLayer) {
    var _this;

    _classCallCheck(this, FullyConnected);

    _this = _super.call(this, settings);
    _this.inputLayer = inputLayer;

    _this.validate();

    _this.compareFilterDeltasKernel = null;
    _this.compareInputDeltasKernel = null;
    _this.compareBiasesKernel = null;
    var connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth;
    _this.biases = values$1(_this.height, _this.bias);
    _this.biasDeltas = zeros$2(_this.height);
    _this.filters = randos2d(connectionCount, _this.height);
    _this.filterDeltas = zeros2D$1(connectionCount, _this.height);

    if (_this.depth > 0) {
      _this.weights = randos3d(_this.width, _this.height);
      _this.deltas = zeros3D$2(_this.width, _this.height);
    } else if (_this.height > 0) {
      _this.weights = randos2d(_this.width, _this.height);
      _this.deltas = zeros2D$1(_this.width, _this.height);
    }

    return _this;
  }

  _createClass(FullyConnected, [{
    key: "validate",
    value: function validate() {
      _get(_getPrototypeOf(FullyConnected.prototype), "validate", this).call(this);

      if (this.depth > 0) throw new Error('depth not supported');
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      var inputLayer = this.inputLayer;
      var connectionCount = inputLayer.width * inputLayer.height * inputLayer.depth;

      if (inputLayer.depth > 0) {
        this.predictKernel = makeKernel$4(predict3D$1, {
          output: [this.width, this.height],
          constants: {
            inputHeight: inputLayer.height,
            inputWidth: inputLayer.width,
            inputDepth: inputLayer.depth
          }
        });
        this.compareFilterDeltasKernel = makeKernel$4(compareFilterDeltas3D, {
          output: [connectionCount, this.height],
          constants: {
            inputWidth: inputLayer.width,
            inputHeight: inputLayer.height
          },
          immutable: true
        });
        this.compareInputDeltasKernel = makeKernel$4(compareInputDeltas3D, {
          output: [inputLayer.width, inputLayer.height, inputLayer.depth],
          constants: {
            filterCount: this.height
          },
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$4(predict$4, {
          output: [this.width, this.height],
          constants: {
            inputHeight: inputLayer.height,
            inputWidth: inputLayer.width
          }
        });
        this.compareFilterDeltasKernel = makeKernel$4(compareFilterDeltas$1, {
          output: [connectionCount, this.height],
          constants: {
            inputWidth: inputLayer.width
          }
        });
        this.compareInputDeltasKernel = makeKernel$4(compareInputDeltas$1, {
          output: [inputLayer.width, inputLayer.height],
          constants: {
            filterCount: this.height
          }
        });
      }

      this.compareBiasesKernel = makeKernel$4(compareBiases$1, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights, this.filters, this.biases);
    }
  }, {
    key: "compare",
    value: function compare() {
      var inputLayerDeltas = this.inputLayer.deltas;
      this.inputLayer.deltas = this.compareInputDeltasKernel(inputLayerDeltas, this.deltas, this.filters);
      release$4(inputLayerDeltas);
      var biasDeltas = this.biasDeltas,
          filterDeltas = this.filterDeltas; // TODO: handle biasDeltas learn

      this.biasDeltas = this.compareBiasesKernel(this.biases, this.deltas); // TODO: handle filterDeltas learn

      this.filterDeltas = this.compareFilterDeltasKernel(filterDeltas, this.inputLayer.weights, this.deltas);
      release$4(biasDeltas);
      release$4(filterDeltas);
    }
  }]);

  return FullyConnected;
}(Filter$3);

function fullyConnected(settings, inputLayer) {
  return new FullyConnected(settings, inputLayer);
}

var fullyConnected_1 = {
  FullyConnected: FullyConnected,
  fullyConnected: fullyConnected,
  predict: predict$4,
  predict3D: predict3D$1,
  compareInputDeltas: compareInputDeltas$1,
  compareInputDeltas3D: compareInputDeltas3D,
  compareBiases: compareBiases$1,
  compareFilterDeltas: compareFilterDeltas$1,
  compareFilterDeltas3D: compareFilterDeltas3D
};

var makeKernel$5 = kernel.makeKernel;
var Modifier$1 = types.Modifier;

function predict$5(weights) {
  return -weights[this.thread.y][this.thread.x];
}

var Negative = /*#__PURE__*/function (_Modifier) {
  _inherits(Negative, _Modifier);

  var _super = _createSuper(Negative);

  function Negative(settings, inputLayer) {
    var _this;

    _classCallCheck(this, Negative);

    _this = _super.call(this, settings);
    _this.inputLayer = inputLayer;

    _this.validate();

    return _this;
  }

  _createClass(Negative, [{
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel$5(predict$5, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
    }
  }]);

  return Negative;
}(Modifier$1);

function negative(settings, inputLayer) {
  return new Negative(settings, inputLayer);
}

var negative_1 = {
  Negative: Negative,
  negative: negative,
  predict: predict$5
};

var makeKernel$6 = kernel.makeKernel,
    release$5 = kernel.release,
    clear$3 = kernel.clear;
var Operator$1 = types.Operator;
var zeros2D$2 = zeros2d.zeros2D;
var checkSameSize$1 = layerSize.checkSameSize;

function predict$6(inputLayerWeights1, inputLayerWeights2) {
  return inputLayerWeights1[this.thread.y][this.thread.x] * inputLayerWeights2[this.thread.y][this.thread.x];
}

function compare$1(weights, deltas) {
  return weights[this.thread.y][this.thread.x] * deltas[this.thread.y][this.thread.x];
}

var MultiplyElement = /*#__PURE__*/function (_Operator) {
  _inherits(MultiplyElement, _Operator);

  var _super = _createSuper(MultiplyElement);

  function MultiplyElement(inputLayer1, inputLayer2) {
    var _this;

    _classCallCheck(this, MultiplyElement);

    _this = _super.call(this);
    _this.inputLayer1 = inputLayer1;
    _this.inputLayer2 = inputLayer2;
    _this.width = inputLayer1.width;
    _this.height = inputLayer1.height;

    _this.validate();

    _this.weights = zeros2D$2(_this.width, _this.height);
    _this.deltas = zeros2D$2(_this.width, _this.height);
    return _this;
  }

  _createClass(MultiplyElement, [{
    key: "validate",
    value: function validate() {
      _get(_getPrototypeOf(MultiplyElement.prototype), "validate", this).call(this);

      checkSameSize$1(this.inputLayer1, this.inputLayer2);
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel$6(predict$6, {
        output: [this.width, this.height],
        immutable: true
      });
      this.compareKernel = makeKernel$6(compare$1, {
        output: [this.width, this.height],
        immutable: true
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      release$5(this.weights);
      this.weights = this.predictKernel(this.inputLayer1.weights, this.inputLayer2.weights);
      clear$3(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      release$5(this.inputLayer1.deltas);
      release$5(this.inputLayer2.deltas);
      this.inputLayer1.deltas = this.compareKernel(this.inputLayer2.weights, this.deltas);
      this.inputLayer2.deltas = this.compareKernel(this.inputLayer1.weights, this.deltas);
    }
  }]);

  return MultiplyElement;
}(Operator$1);

function multiplyElement(inputLayer1, inputLayer2) {
  return new MultiplyElement(inputLayer1, inputLayer2);
}

var multiplyElement_1 = {
  MultiplyElement: MultiplyElement,
  multiplyElement: multiplyElement,
  predict: predict$6,
  compare: compare$1
};

var ones = function ones(size) {
  return new Float32Array(size).fill(1);
};

var ones2d = function ones2D(width, height) {
  var result = new Array(height);

  for (var y = 0; y < height; y++) {
    result[y] = ones(width);
  }

  return result;
};

var zeros2D$3 = zeros2d.zeros2D;
var Model$1 = types.Model;

var Ones = /*#__PURE__*/function (_Model) {
  _inherits(Ones, _Model);

  var _super = _createSuper(Ones);

  function Ones(settings) {
    var _this;

    _classCallCheck(this, Ones);

    _this = _super.call(this, settings);

    _this.validate();

    _this.weights = ones2d(_this.width, _this.height);
    _this.deltas = zeros2D$3(_this.width, _this.height);
    return _this;
  }

  return Ones;
}(Model$1);

function ones$1(settings) {
  return new Ones(settings);
}

var ones_1 = {
  Ones: Ones,
  ones: ones$1
};

var Activation$2 = activation$1.Activation;
var makeKernel$7 = kernel.makeKernel;
var activate$5 = tanh.activate,
    measure$5 = tanh.measure;
var release$6 = kernel.release,
    clear$4 = kernel.clear;

function predict2D$1(inputs) {
  return activate$5(inputs[this.thread.y][this.thread.x]);
}

function predict3D$2(inputs) {
  return activate$5(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare2D$1(weights, errors) {
  return measure$5(weights[this.thread.y][this.thread.x], errors[this.thread.y][this.thread.x]);
}

function compare3D$1(weights, errors) {
  return measure$5(weights[this.thread.z][this.thread.y][this.thread.x], errors[this.thread.z][this.thread.y][this.thread.x]);
}

var Tanh = /*#__PURE__*/function (_Activation) {
  _inherits(Tanh, _Activation);

  var _super = _createSuper(Tanh);

  function Tanh() {
    _classCallCheck(this, Tanh);

    return _super.apply(this, arguments);
  }

  _createClass(Tanh, [{
    key: "setupKernels",
    value: function setupKernels() {
      if (this.depth > 0) {
        this.predictKernel = makeKernel$7(predict3D$2, {
          output: [this.width, this.height, this.depth],
          functions: [activate$5],
          immutable: true
        });
        this.compareKernel = makeKernel$7(compare3D$1, {
          output: [this.width, this.height, this.depth],
          functions: [measure$5],
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$7(predict2D$1, {
          output: [this.width, this.height],
          functions: [activate$5],
          immutable: true
        });
        this.compareKernel = makeKernel$7(compare2D$1, {
          output: [this.width, this.height],
          functions: [measure$5],
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      release$6(this.weights);
      this.weights = this.predictKernel(this.inputLayer.weights);
      clear$4(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      release$6(this.inputLayer.deltas);
      this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return Tanh;
}(Activation$2);

function tanh$1(inputLayer, settings) {
  return new Tanh(inputLayer, settings);
}

var tanh_1 = {
  Tanh: Tanh,
  tanh: tanh$1,
  predict2D: predict2D$1,
  predict3D: predict3D$2,
  compare2D: compare2D$1,
  compare3D: compare3D$1
};

var zeros2D$4 = zeros2d.zeros2D;
var Model$2 = types.Model;

var Zeros = /*#__PURE__*/function (_Model) {
  _inherits(Zeros, _Model);

  var _super = _createSuper(Zeros);

  function Zeros(settings) {
    var _this;

    _classCallCheck(this, Zeros);

    _this = _super.call(this, settings);

    _this.validate();

    _this.weights = zeros2D$4(_this.width, _this.height);
    _this.deltas = zeros2D$4(_this.width, _this.height);
    return _this;
  }

  _createClass(Zeros, [{
    key: "predict",
    value: function predict() {// throw new Error(`${this.constructor.name}-predict is not yet implemented`)
    }
  }, {
    key: "compare",
    value: function compare() {// throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }]);

  return Zeros;
}(Model$2);

function zeros$3(settings) {
  return new Zeros(settings);
}

var zeros_1 = {
  Zeros: Zeros,
  zeros: zeros$3
};

var add$4 = add$1.add;
var negative$1 = negative_1.negative;
var multiply$4 = multiply$1.multiply;
var multiplyElement$1 = multiplyElement_1.multiplyElement;
var ones$2 = ones_1.ones;
var sigmoid$4 = sigmoid_1.sigmoid;
var random$5 = random$2.random;
var tanh$2 = tanh_1.tanh;
var zeros$4 = zeros_1.zeros;

function gru(settings, recurrentInput, input) {
  var height = settings.height;
  var updateGateWeights = random$5({
    height: height,
    width: input.height
  });
  var updateGatePeepholes = random$5({
    width: height,
    height: height
  });
  var updateGateBias = zeros$4({
    height: height
  });
  var updateGate = sigmoid$4(add$4(add$4(multiply$4(updateGateWeights, input), multiply$4(updateGatePeepholes, recurrentInput)), updateGateBias));
  var resetGateWeights = random$5({
    height: height,
    width: input.height
  });
  var resetGatePeepholes = random$5({
    width: height,
    height: height
  });
  var resetGateBias = zeros$4({
    height: height
  });
  var resetGate = sigmoid$4(add$4(add$4(multiply$4(resetGateWeights, input), multiply$4(resetGatePeepholes, recurrentInput)), resetGateBias));
  var cellWeights = random$5({
    height: height,
    width: input.height
  });
  var cellPeepholes = random$5({
    width: height,
    height: height
  });
  var cellBias = zeros$4({
    height: height
  });
  var cell = tanh$2(add$4(add$4(multiply$4(cellWeights, input), multiply$4(cellPeepholes, multiplyElement$1(resetGate, recurrentInput))), cellBias)); // compute hidden state as gated, saturated cell activations
  // negate updateGate

  return add$4(multiplyElement$1(add$4(ones$2(updateGate.rows, updateGate.columns), negative$1(updateGate)), cell), multiplyElement$1(recurrentInput, updateGate));
}

var gru_1 = {
  gru: gru
};

var defaults$2 = {
  weights: null
};
var Input = /*#__PURE__*/function (_EntryPoint) {
  _inherits(Input, _EntryPoint);

  var _super = _createSuper(Input);

  function Input(settings) {
    var _this;

    _classCallCheck(this, Input);

    _this = _super.call(this, _objectSpread2(_objectSpread2({}, defaults$2), settings));

    _defineProperty(_assertThisInitialized(_this), "reshapeInput", null);

    _this.validate();

    _this.reshapeInput = null;
    _this.deltas = zeros2D(_this.width, _this.height);
    return _this;
  }

  _createClass(Input, [{
    key: "setupKernels",
    value: function setupKernels() {
      if (this.width === 1) {
        this.predict = this.predict1D;
        this.reshapeInput = makeKernel(function (value) {
          return value[this.thread.y];
        }, {
          output: [1, this.height],
          immutable: true
        });
      }
    }
  }, {
    key: "reuseKernels",
    value: function reuseKernels(layer) {
      _get(_getPrototypeOf(Input.prototype), "reuseKernels", this).call(this, layer);

      this.reshapeInput = layer.reshapeInput;
    }
  }, {
    key: "predict",
    value: function predict(inputs) {
      if ((Array.isArray(inputs) || inputs instanceof Float32Array) && typeof inputs[0] === 'number' && inputs.length === this.height * this.width) {
        release(this.weights);
        this.weights = kernelInput(inputs, [this.width, this.height]);
      } else if (Array.isArray(inputs) && inputs.length === this.height && (Array.isArray(inputs[0]) || inputs[0] instanceof Float32Array) && inputs[0].length === this.width) {
        this.weights = clone(inputs);
      } else {
        throw new Error('Inputs are not of sized correctly');
      }

      clear(this.deltas);
    }
  }, {
    key: "predict1D",
    value: function predict1D(inputs) {
      if (this.weights) release(this.weights);

      if (this.reshapeInput) {
        this.weights = this.reshapeInput(inputs);
      } else {
        this.weights = inputs;
      }

      clear(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {// throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      return _objectSpread2(_objectSpread2({}, this.settings), {}, {
        weights: null,
        deltas: null
      });
    }
  }]);

  return Input;
}(EntryPoint);
function input(settings) {
  return new Input(settings);
}

var Activation$3 = types.Activation;
var makeKernel$8 = kernel.makeKernel,
    release$7 = kernel.release,
    clear$5 = kernel.clear;
var activate$6 = leakyRelu.activate,
    measure$6 = leakyRelu.measure;

function predict2D$2(inputs) {
  return activate$6(inputs[this.thread.y][this.thread.x]);
}

function predict3D$3(inputs) {
  return activate$6(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare2D$2(weights, deltas) {
  return measure$6(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}

function compare3D$2(weights, deltas) {
  return measure$6(weights[this.thread.z][this.thread.y][this.thread.x], deltas[this.thread.z][this.thread.y][this.thread.x]);
}

var LeakyRelu = /*#__PURE__*/function (_Activation) {
  _inherits(LeakyRelu, _Activation);

  var _super = _createSuper(LeakyRelu);

  function LeakyRelu() {
    _classCallCheck(this, LeakyRelu);

    return _super.apply(this, arguments);
  }

  _createClass(LeakyRelu, [{
    key: "setupKernels",
    value: function setupKernels() {
      var _this$inputLayer = this.inputLayer,
          width = _this$inputLayer.width,
          height = _this$inputLayer.height,
          depth = _this$inputLayer.depth;

      if (this.depth > 0) {
        this.predictKernel = makeKernel$8(predict3D$3, {
          output: [width, height, depth],
          functions: [activate$6],
          immutable: true
        });
        this.compareKernel = makeKernel$8(compare3D$2, {
          output: [width, height, depth],
          functions: [measure$6],
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$8(predict2D$2, {
          output: [width, height],
          functions: [activate$6],
          immutable: true
        });
        this.compareKernel = makeKernel$8(compare2D$2, {
          output: [width, height],
          functions: [measure$6],
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      release$7(this.weights);
      this.weights = this.predictKernel(this.inputLayer.weights);
      clear$5(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      var deltas = this.deltas;
      this.deltas = this.compareKernel(this.weights, deltas);
      release$7(deltas);
    }
  }]);

  return LeakyRelu;
}(Activation$3);

function leakyRelu$1(inputLayer, settings) {
  return new LeakyRelu(inputLayer, settings);
}

var leakyRelu_1 = {
  LeakyRelu: LeakyRelu,
  leakyRelu: leakyRelu$1,
  predict2D: predict2D$2,
  predict3D: predict3D$3,
  compare2D: compare2D$2,
  compare3D: compare3D$2
};

var add$5 = add$1.add;
var multiply$5 = multiply$1.multiply;
var multiplyElement$2 = multiplyElement_1.multiplyElement;
var random$6 = random$2.random;
var sigmoid$5 = sigmoid_1.sigmoid;
var tanh$3 = tanh_1.tanh;
var zeros$5 = zeros_1.zeros;

function lstmCell(settings, input, recurrentInput) {
  var height = settings.height;
  if (recurrentInput.setDimensions) recurrentInput.setDimensions(1, height);
  var inputGateWeights = random$6({
    height: height,
    width: input.height,
    std: 0.08
  });
  var inputGatePeepholes = random$6({
    width: height,
    height: height,
    std: 0.08
  });
  var inputGateBias = zeros$5({
    height: height
  });
  var inputGate = sigmoid$5(add$5(add$5(multiply$5(inputGateWeights, input), multiply$5(inputGatePeepholes, recurrentInput)), inputGateBias));
  var forgetGateWeights = random$6({
    height: height,
    width: input.height,
    std: 0.08
  });
  var forgetGatePeepholes = random$6({
    width: height,
    height: height,
    std: 0.08
  });
  var forgetGateBias = zeros$5({
    height: height
  });
  var forgetGate = sigmoid$5(add$5(add$5(multiply$5(forgetGateWeights, input), multiply$5(forgetGatePeepholes, recurrentInput)), forgetGateBias));
  var outputGateWeights = random$6({
    height: height,
    width: input.height,
    std: 0.08
  });
  var outputGatePeepholes = random$6({
    width: height,
    height: height,
    std: 0.08
  });
  var outputGateBias = zeros$5({
    height: height
  });
  var outputGate = sigmoid$5(add$5(add$5(multiply$5(outputGateWeights, input), multiply$5(outputGatePeepholes, recurrentInput)), outputGateBias));
  var memoryWeights = random$6({
    height: height,
    width: input.height,
    std: 0.08
  });
  var memoryPeepholes = random$6({
    width: height,
    height: height,
    std: 0.08
  });
  var memoryBias = zeros$5({
    height: height
  });
  var memory = tanh$3(add$5(add$5(multiply$5(memoryWeights, input), multiply$5(memoryPeepholes, recurrentInput)), memoryBias)); // compute new cell activation

  var retainCell = multiplyElement$2(forgetGate, recurrentInput); // what do we keep from cell

  var writeCell = multiplyElement$2(inputGate, memory); // what do we write to cell

  var cell = add$5(retainCell, writeCell); // new cell contents
  // compute hidden state as gated, saturated cell activations

  return multiplyElement$2(outputGate, tanh$3(cell));
}

var lstmCell_1 = {
  lstmCell: lstmCell
};

var makeKernel$9 = kernel.makeKernel,
    release$8 = kernel.release,
    clone$2 = kernel.clone,
    clear$6 = kernel.clear;
var zeros$6 = zeros$1.zeros;
var zeros2D$5 = zeros2d.zeros2D; // const { zeros3D } = require('../utilities/zeros-3d');

var Filter$4 = types.Filter;

function compare1D(weights, targetValues) {
  // return targetValues[this.thread.x] - weights[this.thread.y][this.thread.x];
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.x];
}

function compare2D$3(weights, targetValues) {
  // return targetValues[this.thread.y][this.thread.x] - weights[this.thread.y][this.thread.x];
  return weights[this.thread.y][this.thread.x] - targetValues[this.thread.y][this.thread.x];
}

var Target = /*#__PURE__*/function (_Filter) {
  _inherits(Target, _Filter);

  var _super = _createSuper(Target);

  function Target(settings, inputLayer) {
    var _this;

    _classCallCheck(this, Target);

    _this = _super.call(this, settings);
    _this.inputLayer = inputLayer;
    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;

    _this.validate();

    if (_this.depth) {
      throw new Error('Target layer not implemented for depth');
    } else if (_this.height) {
      _this.weights = zeros2D$5(_this.width, _this.height);
      _this.deltas = zeros2D$5(_this.width, _this.height);
      _this.errors = zeros2D$5(_this.width, _this.height);
    } else {
      _this.weights = zeros$6(_this.width);
      _this.deltas = zeros$6(_this.width);
      _this.errors = zeros$6(_this.width);
    }

    return _this;
  }

  _createClass(Target, [{
    key: "setupKernels",
    value: function setupKernels() {
      var compareFn = this.width === 1 ? compare1D : compare2D$3;
      this.compareKernel = makeKernel$9(compareFn, {
        output: [this.width, this.height],
        immutable: true
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      // TODO: should we clone here?
      // NOTE: this looks like it shouldn't be, but the weights are immutable, and this is where they are reused.
      release$8(this.weights);
      this.weights = clone$2(this.inputLayer.weights);
      clear$6(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare(targetValues) {
      // this is where weights attach to deltas
      // deltas will be zero on learn, so save it in error for comparing to mse later
      release$8(this.deltas);
      release$8(this.errors);
      release$8(this.inputLayer.deltas);
      this.deltas = this.compareKernel(this.weights, targetValues);
      this.inputLayer.deltas = clone$2(this.deltas);
      this.errors = clone$2(this.deltas);
    }
  }, {
    key: "setupPraxis",
    value: function setupPraxis() {}
  }]);

  return Target;
}(Filter$4);

function target(settings, inputLayer) {
  return new Target(settings, inputLayer);
}

var target_1 = {
  Target: Target,
  target: target
};

var add$6 = add$1.add;
var multiply$6 = multiply$1.multiply;
var random$7 = random$2.random;
var target$1 = target_1.target;

function output(settings, inputLayer) {
  var height = settings.height;
  var outputGate = random$7({
    height: height,
    width: inputLayer.height,
    name: 'outputGate',
    std: 0.08
  });
  var output = random$7({
    height: height,
    name: 'output',
    std: 0.08
  });
  var outputGateConnector = multiply$6(outputGate, inputLayer, {
    name: 'outputGateConnected'
  });
  return target$1(_objectSpread2({
    name: 'target'
  }, settings), add$6(outputGateConnector, output));
}

var output_1 = {
  output: output
};

var Filter$5 = types.Filter;
var makeKernel$a = kernel.makeKernel,
    release$9 = kernel.release;
var setPadding$2 = layerSetup.setPadding,
    setStride$2 = layerSetup.setStride;
var zeros3D$3 = zeros3d.zeros3D;

function setSwitchY(value) {
  return value;
}

function setSwitchX(value) {
  return value;
}

function predict$7(inputs) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.inputWidth - this.constants.paddingX);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.inputHeight - this.constants.paddingY);
  var largestValue = -Infinity;

  for (var filterY = 0; filterY < this.constants.filterHeight; filterY++) {
    // coordinates in the original input array coordinates
    var inputY = filterY + y;

    for (var filterX = 0; filterX < this.constants.filterWidth; filterX++) {
      var inputX = filterX + x;

      if (inputY >= 0 && inputY < this.constants.inputHeight && inputX >= 0 && inputX < this.constants.inputWidth) {
        var input = inputs[this.thread.z][inputY][inputX];

        if (input > largestValue) {
          largestValue = input;
        }
      }
    }
  }
  return largestValue;
}

function compare$2(deltas, switchY, switchX) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.outputWidth);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.outputHeight);
  var value = 0;

  for (var deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (var deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      var switchXValue = switchX[deltasY][deltasX];
      var switchYValue = switchY[deltasY][deltasX];

      if (switchXValue === x && switchYValue === y) {
        value += deltas[deltasY][deltasX];
      }
    }
  }

  return value;
}

function compare3D$3(deltas, switchY, switchX) {
  var x = Math.floor(this.thread.x / this.output.x * this.constants.outputWidth);
  var y = Math.floor(this.thread.y / this.output.y * this.constants.outputHeight);
  var value = 0;

  for (var deltasY = 0; deltasY < this.constants.inputHeight; deltasY++) {
    for (var deltasX = 0; deltasX < this.constants.inputWidth; deltasX++) {
      var switchXValue = switchX[this.thread.z][deltasY][deltasX];
      var switchYValue = switchY[this.thread.z][deltasY][deltasX];

      if (switchXValue === x && switchYValue === y) {
        value += deltas[this.thread.z][deltasY][deltasX];
      }
    }
  }

  return value;
}

var Pool = /*#__PURE__*/function (_Filter) {
  _inherits(Pool, _Filter);

  var _super = _createSuper(Pool);

  _createClass(Pool, null, [{
    key: "defaults",
    get: function get() {
      return {
        padding: 0,
        bias: 0,
        filterWidth: 0,
        filterHeight: 0,
        filterCount: 0
      };
    }
  }]);

  function Pool(settings, inputLayer) {
    var _this;

    _classCallCheck(this, Pool);

    _this = _super.call(this, settings);
    _this.stride = null;
    _this.strideX = null;
    _this.strideY = null;
    setStride$2(_assertThisInitialized(_this), settings);
    _this.padding = null;
    _this.paddingX = null;
    _this.paddingY = null;
    setPadding$2(_assertThisInitialized(_this), settings);
    _this.filterCount = settings.filterCount;
    _this.filterWidth = settings.filterWidth;
    _this.filterHeight = settings.filterHeight;
    _this.width = Math.floor((inputLayer.width + _this.paddingX * 2 - _this.filterWidth) / _this.strideX + 1);
    _this.height = Math.floor((inputLayer.height + _this.paddingY * 2 - _this.filterHeight) / _this.strideY + 1); // TODO: handle 1 depth?

    _this.depth = _this.filterCount;
    _this.weights = randos3d(_this.width, _this.height, _this.depth);
    _this.deltas = zeros3D$3(_this.width, _this.height, _this.depth);
    _this.filters = randos3d(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.filterDeltas = zeros3D$3(_this.filterWidth, _this.filterHeight, _this.filterCount);
    _this.learnFilters = null;
    _this.learnInputs = null;
    _this.inputLayer = inputLayer;

    _this.validate();

    return _this;
  }

  _createClass(Pool, [{
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel$a(predict$7, {
        output: [this.width, this.height, this.depth],
        map: {
          switchX: setSwitchX,
          switchY: setSwitchY
        },
        constants: {
          inputWidth: this.inputLayer.width,
          inputHeight: this.inputLayer.height,
          paddingX: this.paddingX,
          paddingY: this.paddingY,
          filterHeight: this.filterHeight,
          filterWidth: this.filterWidth
        }
      });
      this.compareKernel = makeKernel$a(compare$2, {
        output: [this.inputLayer.width, this.inputLayer.height, this.inputLayer.depth],
        constants: {
          outputWidth: this.width,
          outputHeight: this.height,
          outputDepth: this.depth,
          paddingX: this.paddingX,
          paddingY: this.paddingY
        }
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      var _this$predictKernel = this.predictKernel(this.inputLayer.weights),
          weights = _this$predictKernel.result,
          switchX = _this$predictKernel.switchX,
          switchY = _this$predictKernel.switchY;

      this.switchX = switchX;
      this.switchY = switchY;
      this.weights = weights;
      return this.weights;
    }
  }, {
    key: "compare",
    value: function compare() {
      // debugger;
      // const depth = this.inputLayer.deltas.length;
      // const height = this.inputLayer.deltas[0].length;
      // const width = this.inputLayer.deltas[0][0].length;
      // const type = typeof this.inputLayer.deltas[0][0][0];
      var inputLayerDeltas = this.inputLayer.deltas;
      this.inputLayer.deltas = this.compareKernel(this.deltas, this.switchX, this.switchY);
      release$9(inputLayerDeltas); // debugger;
      // if (depth !== this.inputLayer.deltas.length) debugger;
      // if (height !== this.inputLayer.deltas[0].length) debugger;
      // if (width !== this.inputLayer.deltas[0][0].length) debugger;
      // if (type !== typeof this.inputLayer.deltas[0][0][0]) debugger;
    }
  }]);

  return Pool;
}(Filter$5);

function pool(settings, inputLayer) {
  return new Pool(settings, inputLayer);
}

var pool_1 = {
  Pool: Pool,
  pool: pool,
  predict: predict$7,
  compare: compare$2,
  compare3D: compare3D$3
};

var Activation$4 = types.Activation;
var makeKernel$b = kernel.makeKernel,
    release$a = kernel.release,
    clear$7 = kernel.clear;
var activate$7 = relu.activate,
    measure$7 = relu.measure; // const { zeros2D } = require('../utilities/zeros-2d');

function predict2D$3(inputs) {
  return activate$7(inputs[this.thread.y][this.thread.x]);
}

function compare2D$4(weights, deltas) {
  return measure$7(weights[this.thread.y][this.thread.x], deltas[this.thread.y][this.thread.x]);
}

function predict3D$4(inputs) {
  return activate$7(inputs[this.thread.z][this.thread.y][this.thread.x]);
}

function compare3D$4(weights, deltas) {
  return measure$7(weights[this.thread.z][this.thread.y][this.thread.x], deltas[this.thread.z][this.thread.y][this.thread.x]);
}

var Relu = /*#__PURE__*/function (_Activation) {
  _inherits(Relu, _Activation);

  var _super = _createSuper(Relu);

  function Relu() {
    _classCallCheck(this, Relu);

    return _super.apply(this, arguments);
  }

  _createClass(Relu, [{
    key: "setupKernels",
    value: function setupKernels() {
      var _this$inputLayer = this.inputLayer,
          width = _this$inputLayer.width,
          height = _this$inputLayer.height,
          depth = _this$inputLayer.depth;

      if (depth > 0) {
        this.predictKernel = makeKernel$b(predict3D$4, {
          output: [width, height, depth],
          functions: [activate$7],
          immutable: true
        });
        this.compareKernel = makeKernel$b(compare3D$4, {
          output: [width, height, depth],
          functions: [measure$7],
          immutable: true
        });
      } else {
        this.predictKernel = makeKernel$b(predict2D$3, {
          output: [width, height],
          functions: [activate$7],
          immutable: true
        });
        this.compareKernel = makeKernel$b(compare2D$4, {
          output: [width, height],
          functions: [measure$7],
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      release$a(this.weights);
      this.weights = this.predictKernel(this.inputLayer.weights);
      clear$7(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      release$a(this.inputLayer.deltas);
      this.inputLayer.deltas = this.compareKernel(this.weights, this.deltas);
    }
  }]);

  return Relu;
}(Activation$4);

function relu$1(inputLayer, settings) {
  return new Relu(inputLayer, settings);
}

var relu_1 = {
  Relu: Relu,
  relu: relu$1,
  predict2D: predict2D$3,
  compare2D: compare2D$4,
  predict3D: predict3D$4,
  compare3D: compare3D$4
};

var relu$2 = relu_1.relu;
var add$7 = add$1.add;
var multiply$7 = multiply$1.multiply;
var random$8 = random$2.random;
var zeros$7 = zeros_1.zeros;

function rnnCell(settings, input, recurrentInput) {
  var height = settings.height;
  if (recurrentInput.setDimensions) recurrentInput.setDimensions(1, height); // wxh

  var weight = random$8({
    name: 'weight',
    height: height,
    width: input.height,
    std: 0.08
  }); // whh

  var transition = random$8({
    name: 'transition',
    height: height,
    width: height,
    std: 0.08
  }); // bhh

  var bias = zeros$7({
    name: 'bias',
    height: height
  });
  return relu$2(add$7(add$7(multiply$7(weight, input), multiply$7(transition, recurrentInput)), bias));
}

var rnnCell_1 = {
  rnnCell: rnnCell
};

var BaseLayer$1 = baseLayer.BaseLayer;

var Regression = /*#__PURE__*/function (_BaseLayer) {
  _inherits(Regression, _BaseLayer);

  var _super = _createSuper(Regression);

  function Regression(settings) {
    var _this;

    _classCallCheck(this, Regression);

    _this = _super.call(this, settings);

    _this.validate();

    return _this;
  }

  _createClass(Regression, [{
    key: "predict",
    value: function predict() {
      this.weights = this.inputs;
    }
  }, {
    key: "learn",
    value: function learn() {// throw new Error(`${this.constructor.name}-learn is not yet implemented`)
    }
  }]);

  return Regression;
}(BaseLayer$1);

function learn(inputs, targets) {
  return inputs[this.thread.x] - targets[this.thread.x];
} // TODO: handle `loss += 0.5*dy*dy;` total and sum in learn


function regression(settings, inputLayer) {
  return new Regression(settings, inputLayer);
}

var regression_1 = {
  Regression: Regression,
  regression: regression,
  learn: learn
};

var makeKernel$c = kernel.makeKernel,
    release$b = kernel.release,
    clone$3 = kernel.clone;
var Filter$6 = types.Filter;
var zeros$8 = zeros$1.zeros;
var zeros2D$6 = zeros2d.zeros2D;
var zeros3D$4 = zeros3d.zeros3D;

function getMaxValue(inputs) {
  var maxInput = -Infinity;

  for (var x = 0; x < this.constants.inputWidth; x++) {
    var input = inputs[x];

    if (input > maxInput) {
      maxInput = input;
    }
  }

  return maxInput;
}

function getMaxValue2D(inputs) {
  var maxInput = -Infinity;

  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      var input = inputs[y][x];

      if (input > maxInput) {
        maxInput = input;
      }
    }
  }

  return maxInput;
}

function getMaxValue3D(inputs) {
  var maxInput = -Infinity;

  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        var input = inputs[z][y][x];

        if (input > maxInput) {
          maxInput = input;
        }
      }
    }
  }

  return maxInput;
}

function getSum(inputs) {
  var sum = 0;

  for (var x = 0; x < this.constants.inputWidth; x++) {
    sum += inputs[x];
  }

  return sum;
}

function getSum2D(inputs) {
  var sum = 0;

  for (var y = 0; y < this.constants.inputHeight; y++) {
    for (var x = 0; x < this.constants.inputWidth; x++) {
      sum += inputs[y][x];
    }
  }

  return sum;
}

function getSum3D(inputs) {
  var sum = 0;

  for (var z = 0; z < this.constants.inputDepth; z++) {
    for (var y = 0; y < this.constants.inputHeight; y++) {
      for (var x = 0; x < this.constants.inputWidth; x++) {
        sum += inputs[z][y][x];
      }
    }
  }

  return sum;
}

function getExponentials(inputs, maxInput) {
  return Math.exp(inputs[this.thread.x] - maxInput[0]);
}

function getExponentials2D(inputs, maxInput) {
  return Math.exp(inputs[this.thread.y][this.thread.x] - maxInput[0]);
}

function getExponentials3D(inputs, maxInput) {
  return Math.exp(inputs[this.thread.z][this.thread.y][this.thread.x] - maxInput[0]);
}

function predict$8(exponentials, exponentialsSum) {
  return exponentials[this.thread.x] / exponentialsSum[0];
}

function predict2D$4(exponentials, exponentialsSum) {
  return exponentials[this.thread.y][this.thread.x] / exponentialsSum[0];
}

function predict3D$5(exponentials, exponentialsSum) {
  return exponentials[this.thread.z][this.thread.y][this.thread.x] / exponentialsSum[0];
}

function compare$3(target, exponentials) {
  var indicator = 0;

  if (this.thread.x === target) {
    indicator = 1;
  }

  return -(indicator - exponentials[this.thread.x]);
}

function compare2D$5(target, exponentials) {
  var indicator = 0;
  var index = this.thread.x + this.thread.y * this.output.x;

  if (index === target) {
    indicator = 1;
  }

  return -(indicator - exponentials[this.thread.y][this.thread.x]);
}

function compare3D$5(target, exponentials) {
  var indicator = 0;
  var index = this.thread.x + this.thread.y * this.output.x + this.thread.z * this.output.x * this.output.y;

  if (index === target) {
    indicator = 1;
  }

  return -(indicator - exponentials[this.thread.z][this.thread.y][this.thread.x]);
}

function loss() {
  return -Math.log();
} // TODO: handle: `return -Math.log(this.es[y]);` in learn


var SoftMax = /*#__PURE__*/function (_Filter) {
  _inherits(SoftMax, _Filter);

  var _super = _createSuper(SoftMax);

  function SoftMax(inputLayer) {
    var _this;

    _classCallCheck(this, SoftMax);

    _this = _super.call(this);
    _this.width = inputLayer.width;
    _this.height = inputLayer.height;
    _this.depth = inputLayer.depth;
    _this.getExponentialsKernel = null;
    _this.getMaxValueKernel = null;
    _this.getSumKernel = null;
    _this.inputLayer = inputLayer;

    _this.validate();

    if (_this.depth > 0) {
      _this.weights = randos3d(_this.width, _this.height, _this.depth);
      _this.deltas = zeros3D$4(_this.width, _this.height, _this.depth);
    } else if (_this.height > 0) {
      _this.weights = randos2d(_this.width, _this.height);
      _this.deltas = zeros2D$6(_this.width, _this.height);
    } else {
      _this.weights = randos$1(_this.width);
      _this.deltas = zeros$8(_this.width);
    }

    return _this;
  }

  _createClass(SoftMax, [{
    key: "setupKernels",
    value: function setupKernels() {
      var width = this.width,
          height = this.height,
          depth = this.depth;

      if (depth > 0) {
        this.getExponentialsKernel = makeKernel$c(getExponentials3D, {
          output: [width, height, depth]
        });
        this.getMaxValueKernel = makeKernel$c(getMaxValue3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.getSumKernel = makeKernel$c(getSum3D, {
          output: [1, 1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height,
            inputDepth: depth
          }
        });
        this.predictKernel = makeKernel$c(predict3D$5, {
          output: [width, height, depth]
        });
        this.compareKernel = makeKernel$c(compare3D$5, {
          output: [width, height, depth],
          immutable: true
        });
      } else {
        this.getExponentialsKernel = makeKernel$c(getExponentials, {
          output: [width, height]
        });
        this.getMaxValueKernel = makeKernel$c(getMaxValue2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.getSumKernel = makeKernel$c(getSum2D, {
          output: [1, 1],
          constants: {
            inputWidth: width,
            inputHeight: height
          }
        });
        this.predictKernel = makeKernel$c(predict2D$4, {
          output: [width, height]
        });
        this.compareKernel = makeKernel$c(compare2D$5, {
          output: [width, height],
          immutable: true
        });
      }
    }
  }, {
    key: "predict",
    value: function predict() {
      var maxValue = this.getMaxValueKernel(this.inputLayer.weights);
      var exponentials = this.getExponentialsKernel(this.inputLayer.weights, maxValue);
      var exponentialsSum = this.getSumKernel(exponentials);
      this.weights = this.predictKernel(exponentials, exponentialsSum);
    }
  }, {
    key: "compare",
    value: function compare(targetValues) {
      var deltas = this.deltas,
          errors = this.errors;
      this.errors = this.compareKernel(targetValues[0], deltas);
      this.deltas = clone$3(this.errors);
      release$b(deltas);
      release$b(errors);
      var inputLayerDeltas = this.inputLayer.deltas;
      this.inputLayer.deltas = clone$3(this.deltas);
      release$b(inputLayerDeltas);
    }
  }]);

  return SoftMax;
}(Filter$6);

function softMax(settings, inputLayer) {
  return new SoftMax(settings, inputLayer);
}

var softMax_1 = {
  SoftMax: SoftMax,
  softMax: softMax,
  getMaxValue: getMaxValue,
  getMaxValue2D: getMaxValue2D,
  getMaxValue3D: getMaxValue3D,
  getSum: getSum,
  getSum2D: getSum2D,
  getSum3D: getSum3D,
  getExponentials: getExponentials,
  getExponentials2D: getExponentials2D,
  getExponentials3D: getExponentials3D,
  predict: predict$8,
  predict2D: predict2D$4,
  predict3D: predict3D$5,
  compare: compare$3,
  compare2D: compare2D$5,
  compare3D: compare3D$5,
  loss: loss
};

var BaseLayer$2 = baseLayer.BaseLayer;

var SVM = /*#__PURE__*/function (_BaseLayer) {
  _inherits(SVM, _BaseLayer);

  var _super = _createSuper(SVM);

  function SVM() {
    _classCallCheck(this, SVM);

    return _super.apply(this, arguments);
  }

  _createClass(SVM, [{
    key: "predict",
    value: function predict() {
      this.weights = this.inputs;
      this.validate();
    }
  }, {
    key: "learn",
    value: function learn() {// throw new Error(`${this.constructor.name}-learn is not yet implemented`)
    }
  }]);

  return SVM;
}(BaseLayer$2); // function learn(target) {
//   if (y === i) {
//     continue;
//   }
//   const ydiff = -yscore + x.w[i] + margin;
//   if (ydiff > 0) {
//     // violating dimension, apply loss
//     x.dw[i] += 1;
//     x.dw[y] -= 1;
//     loss += ydiff;
//   }
// }


function svm(settings, inputLayer) {
  return new SVM(settings, inputLayer);
}

var svm_1 = {
  SVM: SVM,
  svm: svm
};

var Modifier$2 = types.Modifier;
var makeKernel$d = kernel.makeKernel,
    clear$8 = kernel.clear;

function predict$9(array) {
  return array[this.thread.x][this.thread.y];
}

var compare$4 = predict$9;

var Transpose = /*#__PURE__*/function (_Modifier) {
  _inherits(Transpose, _Modifier);

  var _super = _createSuper(Transpose);

  function Transpose(inputLayer) {
    var _this;

    _classCallCheck(this, Transpose);

    _this = _super.call(this);
    _this.inputLayer = inputLayer;
    _this.width = _this.inputLayer.height;
    _this.height = _this.inputLayer.width;

    _this.validate();

    return _this;
  }

  _createClass(Transpose, [{
    key: "setupKernels",
    value: function setupKernels() {
      this.predictKernel = makeKernel$d(predict$9, {
        output: [this.height, this.width]
      });
      this.compareKernel = makeKernel$d(compare$4, {
        output: [this.width, this.height]
      });
    }
  }, {
    key: "predict",
    value: function predict() {
      this.weights = this.predictKernel(this.inputLayer.weights);
      clear$8(this.deltas);
    }
  }, {
    key: "compare",
    value: function compare() {
      // TODO: needs switched to this.compareKernel?
      this.inputLayer.deltas = this.predictKernel(this.deltas);
    }
  }]);

  return Transpose;
}(Modifier$2);

function transpose(inputLayer) {
  return new Transpose(inputLayer);
}

var transpose_1 = {
  Transpose: Transpose,
  transpose: transpose
};

var layerTypes = {
  Activation: Activation,
  Operator: Operator,
  Internal: Internal,
  InternalModel: InternalModel,
  EntryPoint: EntryPoint,
  Filter: Filter,
  Model: Model,
  Modifier: Modifier
};

var layer = /*#__PURE__*/Object.freeze({
  __proto__: null,
  layerTypes: layerTypes,
  Add: Add,
  add: add,
  arthurFeedForward: arthurFeedForward_1.arthurFeedForward,
  BaseLayer: BaseLayer,
  Convolution: convolution_1.Convolution,
  convolution: convolution_1.convolution,
  Dropout: dropout_1.Dropout,
  dropout: dropout_1.dropout,
  feedForward: feedForward_1.feedForward,
  FullyConnected: fullyConnected_1.FullyConnected,
  fullyConnected: fullyConnected_1.fullyConnected,
  gru: gru_1.gru,
  Input: Input,
  input: input,
  LeakyRelu: leakyRelu_1.LeakyRelu,
  leakyRelu: leakyRelu_1.leakyRelu,
  lstmCell: lstmCell_1.lstmCell,
  Multiply: Multiply,
  multiply: multiply,
  MultiplyElement: multiplyElement_1.MultiplyElement,
  multiplyElement: multiplyElement_1.multiplyElement,
  Negative: negative_1.Negative,
  negative: negative_1.negative,
  Ones: ones_1.Ones,
  ones: ones_1.ones,
  output: output_1.output,
  Pool: pool_1.Pool,
  pool: pool_1.pool,
  Random: Random,
  random: random$1,
  rnnCell: rnnCell_1.rnnCell,
  Regression: regression_1.Regression,
  regression: regression_1.regression,
  Relu: relu_1.Relu,
  relu: relu_1.relu,
  Sigmoid: sigmoid_1.Sigmoid,
  sigmoid: sigmoid_1.sigmoid,
  SoftMax: softMax_1.SoftMax,
  softMax: softMax_1.softMax,
  SVM: svm_1.SVM,
  svm: svm_1.svm,
  Tanh: tanh_1.Tanh,
  tanh: tanh_1.tanh,
  Target: target_1.Target,
  target: target_1.target,
  Transpose: transpose_1.Transpose,
  transpose: transpose_1.transpose,
  Zeros: zeros_1.Zeros,
  zeros: zeros_1.zeros
});

var layerFromJson = function layerFromJSON(jsonLayer) {
  if (!layer.hasOwnProperty(jsonLayer.type)) return null;
  var Layer = layer[jsonLayer.type]; // eslint-disable-next-line

  var realLayer = Reflect.construct(Layer, arguments);
  Object.keys(jsonLayer).forEach(function (p) {
    if (p !== 'type') {
      realLayer[p] = jsonLayer[p];
    }
  });
  return realLayer;
};

// TODO: implement and test
var Adam = function Adam() {
  _classCallCheck(this, Adam);
};

function adam() {// gradient = grad_fun(theta)
  //
  //           # Update moment estimates
  // moment1 = beta1 * moment1 + (1 - beta1) * gradient
  // moment2 = beta2 * moment2 + (1 - beta2) * np.square(gradient)
  //
  //           # Yield adapted gradient
  // theta = ( theta - alpha * (1 - beta2**t)**0.5 / (1 - beta1**t) *
  //   moment1 / (epsilon + np.sqrt(moment2)) )
  // yield theta
  // t += 1
  // adam update
  // gsumi[j] = gsumi[j] * this.beta1 + (1- this.beta1) * gij; // update biased first moment estimate
  // xsumi[j] = xsumi[j] * this.beta2 + (1-this.beta2) * gij * gij; // update biased second moment estimate
  // var biasCorr1 = gsumi[j] * (1 - Math.pow(this.beta1, this.k)); // correct bias first moment estimate
  // var biasCorr2 = xsumi[j] * (1 - Math.pow(this.beta2, this.k)); // correct bias second moment estimate
  // var dx =  - this.learning_rate * biasCorr1 / (Math.sqrt(biasCorr2) + this.eps);
  // p[j] += dx;
}

var adam_1 = {
  Adam: Adam,
  adam: adam
};

var makeKernel$e = kernel.makeKernel,
    release$c = kernel.release;
var zeros2D$7 = zeros2d.zeros2D;
var Base$1 = basePraxis.Base;

function getMomentum(delta, decay, previousMomentum) {
  return previousMomentum * decay + (1 - decay) * delta * delta;
}

function clipByValue(value, max, min) {
  if (value > max) {
    return max;
  }

  if (value < min) {
    return min;
  }

  return value;
}
/**
 * @description Momentum Root Mean Square Propagation Function
 * @returns {number}
 */


function update$2(weights, deltas, previousMomenta) {
  var delta = deltas[this.thread.y][this.thread.x];
  var clippedDelta = clipByValue(delta, this.constants.clipValue, -this.constants.clipValue);
  var weight = weights[this.thread.y][this.thread.x];
  var previousMomentum = previousMomenta[this.thread.y][this.thread.x];
  var momentum = getMomentum(delta, this.constants.decayRate, previousMomentum);
  return weight + -this.constants.learningRate * clippedDelta / Math.sqrt(momentum + this.constants.smoothEps) - this.constants.regularizationStrength * weight;
}

function isClippedByValue(value, max, min) {
  if (value > max) {
    return 1;
  }

  if (value < min) {
    return 1;
  }

  return 0;
}

var MomentumRootMeanSquaredPropagation = /*#__PURE__*/function (_Base) {
  _inherits(MomentumRootMeanSquaredPropagation, _Base);

  var _super = _createSuper(MomentumRootMeanSquaredPropagation);

  _createClass(MomentumRootMeanSquaredPropagation, null, [{
    key: "defaults",
    get: function get() {
      return {
        decayRate: 0.999,
        regularizationStrength: 0.0001,
        learningRate: 0.01,
        smoothEps: 1e-8,
        clipValue: 5
      };
    }
  }]);

  function MomentumRootMeanSquaredPropagation(layerTemplate) {
    var _this;

    var settings = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, MomentumRootMeanSquaredPropagation);

    _this = _super.call(this, layerTemplate, settings);
    _this.momenta = zeros2D$7(layerTemplate.width, layerTemplate.height);
    return _this;
  }

  _createClass(MomentumRootMeanSquaredPropagation, [{
    key: "run",
    value: function run(layer) {
      var _this$kernel = this.kernel(layer.weights, layer.deltas, this.momenta),
          momenta = _this$kernel.momenta,
          result = _this$kernel.result;

      release$c(this.momenta);
      this.momenta = momenta;
      return result;
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {
      this.kernel = makeKernel$e(update$2, {
        output: [this.width, this.height],
        constants: {
          clipValue: this.clipValue,
          decayRate: this.decayRate,
          learningRate: this.learningRate,
          regularizationStrength: this.regularizationStrength,
          smoothEps: this.smoothEps
        },
        functions: [clipByValue],
        map: {
          momenta: getMomentum
        },
        immutable: true
      });
    }
  }]);

  return MomentumRootMeanSquaredPropagation;
}(Base$1);

function momentumRootMeanSquaredPropagation(layer, settings) {
  return new MomentumRootMeanSquaredPropagation(layer, settings);
}
/**
 * @description Mathematician friendly name of MomentumRootMeanSquaredPropagation class. For those that are not mere mortals
 * @type {MomentumRootMeanSquaredPropagation}
 */


var MRmsProp = MomentumRootMeanSquaredPropagation;
var mRmsProp = momentumRootMeanSquaredPropagation;
var momentumRootMeanSquaredPropagation_1 = {
  MomentumRootMeanSquaredPropagation: MomentumRootMeanSquaredPropagation,
  momentumRootMeanSquaredPropagation: momentumRootMeanSquaredPropagation,
  MRmsProp: MRmsProp,
  mRmsProp: mRmsProp,
  getMomentum: getMomentum,
  clipByValue: clipByValue,
  isClippedByValue: isClippedByValue
};

var praxis = /*#__PURE__*/Object.freeze({
  __proto__: null,
  Adam: adam_1.Adam,
  adam: adam_1.adam,
  ArthurDeviationBiases: ArthurDeviationBiases,
  arthurDeviationBiases: arthurDeviationBiases,
  ArthurDeviationWeights: ArthurDeviationWeights,
  arthurDeviationWeights: arthurDeviationWeights,
  MomentumRootMeanSquaredPropagation: momentumRootMeanSquaredPropagation_1.MomentumRootMeanSquaredPropagation,
  momentumRootMeanSquaredPropagation: momentumRootMeanSquaredPropagation_1.momentumRootMeanSquaredPropagation,
  MRmsProp: momentumRootMeanSquaredPropagation_1.MRmsProp,
  mRmsProp: momentumRootMeanSquaredPropagation_1.mRmsProp
});

var traverseLayersFrom = function traverseLayersFrom(layer, cb) {
  if (layer.hasOwnProperty('inputLayer')) {
    traverseLayersFrom(layer.inputLayer, cb);
  } else {
    if (layer.hasOwnProperty('inputLayer1')) {
      traverseLayersFrom(layer.inputLayer1, cb);
    }

    if (layer.hasOwnProperty('inputLayer2')) {
      traverseLayersFrom(layer.inputLayer2, cb);
    }
  }

  cb(layer);
};

var flattenLayers = function flattenLayers(layers) {
  var result = layers.slice(0);

  var _loop = function _loop(i) {
    var offset = 0;
    traverseLayersFrom(result[i], function (layer) {
      if (result.indexOf(layer) === -1) {
        result.splice(i + offset, 0, layer);
        offset++;
      }
    });
  };

  for (var i = 0; i < result.length; i++) {
    _loop(i);
  }

  return result;
};

/**
 * 2D Mean Squared Error
 */
function mse2d(errors) {
  var sum = 0;

  for (var y = 0; y < this.constants.height; y++) {
    for (var x = 0; x < this.constants.width; x++) {
      sum += Math.pow(errors[y][x], 2);
    }
  }

  return sum / this.constants.length;
}
var MeanSquaredError =
/** Calculate the mean squared error given an array of errors */

/** Returns the sum of absolute values of previuous error and previous layer errors */

/** Adds two erros */

/** Returns the ratio of sum of errors and length (ie the average) */
function MeanSquaredError(_ref) {
  var width = _ref.width,
      height = _ref.height;

  _classCallCheck(this, MeanSquaredError);

  _defineProperty(this, "calculate", void 0);

  _defineProperty(this, "addAbsolute", void 0);

  _defineProperty(this, "add", void 0);

  _defineProperty(this, "divide", void 0);

  this.calculate = makeKernel(mse2d, {
    output: [1],
    constants: {
      width: width,
      height: height,
      length: width * height
    },
    immutable: true
  });
  this.addAbsolute = makeKernel(function (prevError, prevLayerErrors) {
    return prevError[0] + Math.abs(prevLayerErrors[0][0]);
  }, {
    output: [1],
    immutable: true
  });
  this.add = makeKernel(function (value1, value2) {
    return value1[0] + value2[0];
  }, {
    output: [1],
    immutable: true
  });
  this.divide = makeKernel(function (length, mseSum) {
    var value = mseSum[0];

    if (value > 0) {
      return value / length;
    }

    return 0;
  }, {
    output: [1],
    immutable: true
  });
};

var meanSquaredError = /*#__PURE__*/Object.freeze({
  __proto__: null,
  mse2d: mse2d,
  MeanSquaredError: MeanSquaredError
});

var makeKernel$f = kernel.makeKernel,
    release$d = kernel.release;
var MeanSquaredError$1 = meanSquaredError.MeanSquaredError;
var Model$3 = types.Model;

var FeedForward = /*#__PURE__*/function () {
  _createClass(FeedForward, [{
    key: "_setLogMethod",

    /**
     *
     * @param log
     * if a method is passed in method is used
     * if false passed in nothing is logged
     * @returns error
     */
    value: function _setLogMethod(log) {
      if (typeof log === 'function') {
        this.trainOpts.log = log;
      } else if (log) {
        // eslint-disable-next-line
        this.trainOpts.log = console.log;
      } else {
        this.trainOpts.log = false;
      }
    }
    /**
     *
     * @param opts
     *    Supports all `trainDefaults` properties
     *    also supports:
     *       learningRate: (number)
     */

  }, {
    key: "_updateTrainingOptions",
    value: function _updateTrainingOptions(opts) {
      var _this = this;

      Object.keys(this.constructor.trainDefaults).forEach(function (opt) {
        _this.trainOpts[opt] = opts.hasOwnProperty(opt) ? opts[opt] : _this.trainOpts[opt];
      });

      this.constructor._validateTrainingOptions(this.trainOpts);

      this._setLogMethod(opts.log || this.trainOpts.log);

      if (this.trainOpts.callback && this.trainOpts.callbackPeriod !== this.trainOpts.errorCheckInterval) {
        console.warn("options.callbackPeriod with value of ".concat(this.trainOpts.callbackPeriod, " does not match options.errorCheckInterval with value of ").concat(this.trainOpts.errorCheckInterval, ", if logging error, it will repeat.  These values may need to match"));
      }
    }
  }], [{
    key: "_validateTrainingOptions",

    /**
     *
     * @param options
     * @private
     */
    value: function _validateTrainingOptions(options) {
      var validations = {
        iterations: function iterations(val) {
          return typeof val === 'number' && val > 0;
        },
        errorThresh: function errorThresh(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        log: function log(val) {
          return typeof val === 'function' || typeof val === 'boolean';
        },
        logPeriod: function logPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        learningRate: function learningRate(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        callback: function callback(val) {
          return typeof val === 'function' || val === null;
        },
        callbackPeriod: function callbackPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        timeout: function timeout(val) {
          return typeof val === 'number' && val > 0;
        }
      };
      Object.keys(FeedForward.trainDefaults).forEach(function (key) {
        if (validations.hasOwnProperty(key) && !validations[key](options[key])) {
          throw new Error("[".concat(key, ", ").concat(options[key], "] is out of normal training range, your network will probably not train."));
        }
      });
    }
  }, {
    key: "trainDefaults",
    get: function get() {
      return {
        iterations: 20000,
        errorThresh: 0.005,
        log: false,
        logPeriod: 10,
        learningRate: 0.3,
        callback: null,
        callbackPeriod: 10,
        errorCheckInterval: 100,
        reinforce: false
      };
    }
  }, {
    key: "defaults",
    get: function get() {
      return {
        learningRate: 0.3,
        binaryThresh: 0.5,
        hiddenLayers: null,
        inputLayer: null,
        outputLayer: null,
        praxisOpts: null,
        praxis: function praxis$1(layer, settings) {
          return praxis.momentumRootMeanSquaredPropagation(_objectSpread2({}, layer), layer.praxisOpts || settings);
        }
      };
    }
  }, {
    key: "structure",
    get: function get() {
      return {
        layers: null,
        _inputLayer: null,
        _outputLayer: null,
        _model: null
      };
    }
    /**
     *
     * @param {object} options
     * @constructor
     */

  }]);

  function FeedForward() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, FeedForward);

    this.layers = null;
    this.inputLayer = null;
    this.hiddenLayers = null;
    this.outputLayer = null;
    this.praxisOpts = null;
    this.praxis = null;
    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};

    this._updateTrainingOptions(_objectSpread2(_objectSpread2({}, this.constructor.trainDefaults), options));

    Object.assign(this, this.constructor.structure);
    this._inputLayer = null;
    this._hiddenLayers = null;
    this._outputLayer = null;
  }

  _createClass(FeedForward, [{
    key: "_connectLayers",
    value: function _connectLayers() {
      var layers = [];
      this._inputLayer = this.inputLayer();

      var hiddenLayers = this._connectHiddenLayers(this._inputLayer);

      this._outputLayer = this.outputLayer(hiddenLayers[hiddenLayers.length - 1], hiddenLayers.length);
      layers.push(this._inputLayer);
      layers.push.apply(layers, _toConsumableArray(hiddenLayers));
      layers.push(this._outputLayer);
      this.layers = flattenLayers(layers);
    }
  }, {
    key: "_connectHiddenLayers",
    value: function _connectHiddenLayers(previousLayer) {
      this._hiddenLayers = [];
      var hiddenLayers = [];

      for (var i = 0; i < this.hiddenLayers.length; i++) {
        var hiddenLayer = this.hiddenLayers[i](previousLayer, i);
        hiddenLayers.push(hiddenLayer);

        this._hiddenLayers.push(hiddenLayer);

        previousLayer = hiddenLayer;
      }

      return hiddenLayers;
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this._connectLayers();

      this.initializeLayers(this.layers);
      this._model = this.layers.filter(function (l) {
        return l instanceof Model$3;
      });
    }
  }, {
    key: "initializeLayers",
    value: function initializeLayers(layers) {
      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i]; // TODO: optimize for when training or just running

        layer.setupKernels(true);

        if (layer instanceof Model$3 && layer.hasOwnProperty('praxis') && layer.praxis === null) {
          layer.praxis = this.praxis(layer, layer.praxisOpts || this.praxisOpts);
          layer.praxis.setupKernels();
        }
      }

      var lastLayer = layers[layers.length - 1];
      this.meanSquaredError = new MeanSquaredError$1({
        width: lastLayer.width,
        height: lastLayer.height
      }); // this._getMSE = makeKernel(mse2d, {
      //   output: [1],
      //   constants: {
      //     width: this._outputLayer.width,
      //     height: this._outputLayer.height,
      //     length: this._outputLayer.width * this._outputLayer.height,
      //   }
      // });
      // this._addMSE = makeKernel(function(value1, value2) {
      //   return value1[0] + value2[0];
      // }, {
      //   output: [1]
      // });
      // this._divideMSESum = makeKernel(function(length, mseSum) {
      //   const value = mseSum[0];
      //   if (value > 0) {
      //     return value / length;
      //   }
      //   return 0;
      // }, {
      //   output: [1]
      // });
    }
    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: "run",
    value: function run(input) {
      if (this.inputLookup) {
        input = lookup.toArray(this.inputLookup, input);
      }

      var output = this.runInput(input);

      if (output.toArray) {
        output = output.toArray();
      }

      if (this.outputLookup) {
        output = lookup.toHash(this.outputLookup, output);
      }

      return output;
    }
  }, {
    key: "runInput",
    value: function runInput(input) {
      this.layers[0].predict(input);

      for (var i = 1; i < this.layers.length; i++) {
        this.layers[i].predict();
      }

      return this.layers[this.layers.length - 1].weights;
    }
    /**
     *
     * @param data
     * @param options
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: "train",
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var status;
      var endTime;

      var _this$_prepTraining = this._prepTraining(data, options);

      data = _this$_prepTraining.data;
      status = _this$_prepTraining.status;
      endTime = _this$_prepTraining.endTime;

      while (this._trainingTick(data, status, endTime)) {
      }

      return status;
    }
    /**
     *
     * @param {object} data
     * @param {object} status { iterations: number, error: number }
     * @param {Number} endTime
     */

  }, {
    key: "_trainingTick",
    value: function _trainingTick(data, status, endTime) {
      if (status.iterations >= this.trainOpts.iterations || status.error <= this.trainOpts.errorThresh || Date.now() >= endTime) {
        return false;
      }

      if (this.trainOpts.log && status.iterations % this.trainOpts.logPeriod === 0) {
        status.error = this._calculateTrainingError(data);
        this.trainOpts.log("iterations: ".concat(status.iterations, ", training error: ").concat(status.error));
      } else if (status.iterations % this.trainOpts.errorCheckInterval === 0) {
        status.error = this._calculateTrainingError(data);
      } else {
        this._trainPatterns(data);
      }

      if (this.trainOpts.callback && status.iterations % this.trainOpts.callbackPeriod === 0) {
        this.trainOpts.callback(Object.assign(status));
      }

      status.iterations++;
      return true;
    }
    /**
     *
     * @param data
     * @param options
     * @protected
     * @return { data, status, endTime }
     */

  }, {
    key: "_prepTraining",
    value: function _prepTraining(data, options) {
      this._updateTrainingOptions(options);

      var formattedData = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;
      var status = {
        error: 1,
        iterations: 0
      };
      this.verifyIsInitialized();
      return {
        data: this.transferData(formattedData),
        status: status,
        endTime: endTime
      };
    }
  }, {
    key: "verifyIsInitialized",
    value: function verifyIsInitialized() {
      if (!this._model) {
        this.initialize();
      }
    }
    /**
     *
     * @param data
     * @returns {Number} error
     */

  }, {
    key: "_calculateTrainingError",
    value: function _calculateTrainingError(data) {
      var sum = new Float32Array([0]);

      for (var i = 0; i < data.length; ++i) {
        var prevSum = sum;

        var error = this._trainPattern(data[i].input, data[i].output, true);

        sum = this.meanSquaredError.add(sum, error);
        release$d(error);
        release$d(prevSum);
      }

      var result = this.meanSquaredError.divide(data.length, sum);
      release$d(sum);

      if (result.toArray) {
        var resultArray = result.toArray();
        release$d(result);
        return resultArray[0];
      }

      return result[0];
    }
    /**
     * @param data
     * @private
     */

  }, {
    key: "_trainPatterns",
    value: function _trainPatterns(data) {
      for (var i = 0; i < data.length; ++i) {
        this._trainPattern(data[i].input, data[i].output, false);
      }
    }
    /**
     *
     * @param input
     * @param target
     * @param {Boolean} logErrorRate
     */

  }, {
    key: "_trainPattern",
    value: function _trainPattern(input, target, logErrorRate) {
      // forward propagate
      this.runInput(input); // back propagate

      this._calculateDeltas(target);

      this.adjustWeights();

      if (logErrorRate) {
        return this.meanSquaredError.calculate(this._outputLayer.errors);
      }

      return null;
    }
  }, {
    key: "_calculateDeltas",
    value: function _calculateDeltas(target) {
      for (var i = this.layers.length - 1; i > -1; i--) {
        this.layers[i].compare(target);
      }
    }
    /**
     *
     */

  }, {
    key: "adjustWeights",
    value: function adjustWeights() {
      var _model = this._model;

      for (var i = 0; i < _model.length; i++) {
        _model[i].learn(this.trainOpts.learningRate);
      }
    }
    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: "formatData",
    value: function formatData(data) {
      var _this2 = this;

      if (!Array.isArray(data)) {
        // turn stream datum into array
        var tmp = [];
        tmp.push(data);
        data = tmp;
      } // turn sparse hash input into arrays with 0s as filler


      var inputDatumCheck = data[0].input;

      if (!Array.isArray(inputDatumCheck) && !(inputDatumCheck instanceof Float32Array)) {
        if (!this.inputLookup) {
          this.inputLookup = lookup.buildLookup(data.map(function (value) {
            return value.input;
          }));
        }

        data = data.map(function (datumParam) {
          var array = lookup.toArray(_this2.inputLookup, datumParam.input);
          return _objectSpread2(_objectSpread2({}, datumParam), {}, {
            input: array
          });
        }, this);
      }

      var outputDatumCheck = data[0].output;

      if (!Array.isArray(outputDatumCheck) && !(outputDatumCheck instanceof Float32Array)) {
        if (!this.outputLookup) {
          this.outputLookup = lookup.buildLookup(data.map(function (value) {
            return value.output;
          }));
        }

        data = data.map(function (datumParam) {
          var array = lookup.toArray(_this2.outputLookup, datumParam.output);
          return _objectSpread2(_objectSpread2({}, datumParam), {}, {
            output: array
          });
        }, this);
      }

      return data;
    }
  }, {
    key: "transferData",
    value: function transferData(formattedData) {
      var transferredData = new Array(formattedData.length);
      var transferInput = makeKernel$f(function (value) {
        return value[this.thread.x];
      }, {
        output: [formattedData[0].input.length],
        immutable: true
      });
      var transferOutput = makeKernel$f(function (value) {
        return value[this.thread.x];
      }, {
        output: [formattedData[0].output.length],
        immutable: true
      });

      for (var i = 0; i < formattedData.length; i++) {
        var formattedDatum = formattedData[i];
        transferredData[i] = {
          input: transferInput(formattedDatum.input),
          output: transferOutput(formattedDatum.output)
        };
      }

      return transferredData;
    }
    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array
     *  }
     * }
     */

  }, {
    key: "test",
    value: function test() {
      throw new Error("".concat(this.constructor.name, "-test is not yet implemented"));
    }
    /**
     *
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      if (!this.layers) {
        this.initialize();
      }

      var jsonLayers = [];

      for (var i = 0; i < this.layers.length; i++) {
        var layer = this.layers[i];
        var jsonLayer = layer.toJSON();

        if (layer.hasOwnProperty('inputLayer')) {
          jsonLayer.inputLayerIndex = this.layers.indexOf(layer.inputLayer);
        } else if (layer.hasOwnProperty('inputLayer1') && layer.hasOwnProperty('inputLayer2')) {
          jsonLayer.inputLayer1Index = this.layers.indexOf(layer.inputLayer1);
          jsonLayer.inputLayer2Index = this.layers.indexOf(layer.inputLayer2);
        }

        jsonLayers.push(jsonLayer);
      }

      return {
        type: this.constructor.name,
        sizes: [this._inputLayer.height].concat(this._hiddenLayers.map(function (l) {
          return l.height;
        })).concat([this._outputLayer.height]),
        layers: jsonLayers
      };
    }
    /**
     *
     * @param json
     * @param [getLayer]
     * @returns {FeedForward}
     */

  }, {
    key: "toFunction",

    /**
     *
     * @returns {Function}
     */
    value: function toFunction() {
      throw new Error("".concat(this.constructor.name, "-toFunction is not yet implemented"));
    }
    /**
     * This will create a TrainStream (WriteStream) for us to send the training data to.
     * @param opts training options
     * @returns {TrainStream|*}
     */

  }, {
    key: "createTrainStream",
    value: function createTrainStream() {
      throw new Error("".concat(this.constructor.name, "-createTrainStream is not yet implemented"));
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json, getLayer) {
      var jsonLayers = json.layers;
      var layers = [];
      var inputLayer = layerFromJson(jsonLayers[0]) || getLayer(jsonLayers[0]);
      layers.push(inputLayer);

      for (var i = 1; i < jsonLayers.length; i++) {
        var jsonLayer = jsonLayers[i];

        if (jsonLayer.hasOwnProperty('inputLayerIndex')) {
          var inputLayer1 = layers[jsonLayer.inputLayerIndex];
          layers.push(layerFromJson(jsonLayer, inputLayer1) || getLayer(jsonLayer, inputLayer1));
        } else {
          if (!jsonLayer.hasOwnProperty('inputLayer1Index')) throw new Error('Cannot create network from provided JOSN. inputLayer1Index not defined.');
          if (!jsonLayer.hasOwnProperty('inputLayer2Index')) throw new Error('Cannot create network from provided JOSN. inputLayer2Index not defined.');
          var _inputLayer = layers[jsonLayer.inputLayer1Index];
          var inputLayer2 = layers[jsonLayer.inputLayer2Index];
          if (_inputLayer === undefined) throw new Error("Cannot create network from provided JOSN. layer of index ".concat(jsonLayer.inputLayer1Index, " not found."));
          if (inputLayer2 === undefined) throw new Error("Cannot create network from provided JOSN. layer of index ".concat(jsonLayer.inputLayer2Index, " not found."));
          layers.push(layerFromJson(jsonLayer, inputLayer) || getLayer(jsonLayer, _inputLayer, inputLayer2));
        }
      }

      var net = new FeedForward(json);
      net.layers = layers;
      return net;
    }
  }]);

  return FeedForward;
}();

var feedForward$1 = {
  FeedForward: FeedForward
};

/**
 *
 * @param {*} input
 * @param {brain.NeuralNetwork} net
 * @returns {*}
 */
var likely = function likely(input, net) {
  if (!net) {
    throw new TypeError("Required parameter 'net' is of type ".concat(_typeof(net), ". Must be of type 'brain.NeuralNetwork'"));
  }

  var output = net.run(input);
  var maxProp = null;
  var maxValue = -1;
  Object.keys(output).forEach(function (key) {
    var value = output[key];

    if (value > maxValue) {
      maxProp = key;
      maxValue = value;
    }
  });
  return maxProp;
};

// call something on iterator step with safe closing on error

var _iterCall = function (iterator, fn, value, entries) {
  try {
    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
  // 7.4.6 IteratorClose(iterator, completion)
  } catch (e) {
    var ret = iterator['return'];
    if (ret !== undefined) _anObject(ret.call(iterator));
    throw e;
  }
};

var _forOf = createCommonjsModule(function (module) {
var BREAK = {};
var RETURN = {};
var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
  var f = _ctx(fn, that, entries ? 2 : 1);
  var index = 0;
  var length, step, iterator, result;
  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
  // fast case for arrays with default iterator
  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
    if (result === BREAK || result === RETURN) return result;
  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
    result = _iterCall(iterator, f, step.value, entries);
    if (result === BREAK || result === RETURN) return result;
  }
};
exports.BREAK = BREAK;
exports.RETURN = RETURN;
});

var process = _global.process;
var setTask = _global.setImmediate;
var clearTask = _global.clearImmediate;
var MessageChannel = _global.MessageChannel;
var Dispatch = _global.Dispatch;
var counter = 0;
var queue = {};
var ONREADYSTATECHANGE = 'onreadystatechange';
var defer, channel, port;
var run = function () {
  var id = +this;
  // eslint-disable-next-line no-prototype-builtins
  if (queue.hasOwnProperty(id)) {
    var fn = queue[id];
    delete queue[id];
    fn();
  }
};
var listener = function (event) {
  run.call(event.data);
};
// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
if (!setTask || !clearTask) {
  setTask = function setImmediate(fn) {
    var args = [];
    var i = 1;
    while (arguments.length > i) args.push(arguments[i++]);
    queue[++counter] = function () {
      // eslint-disable-next-line no-new-func
      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
    };
    defer(counter);
    return counter;
  };
  clearTask = function clearImmediate(id) {
    delete queue[id];
  };
  // Node.js 0.8-
  if (_cof(process) == 'process') {
    defer = function (id) {
      process.nextTick(_ctx(run, id, 1));
    };
  // Sphere (JS game engine) Dispatch API
  } else if (Dispatch && Dispatch.now) {
    defer = function (id) {
      Dispatch.now(_ctx(run, id, 1));
    };
  // Browsers with MessageChannel, includes WebWorkers
  } else if (MessageChannel) {
    channel = new MessageChannel();
    port = channel.port2;
    channel.port1.onmessage = listener;
    defer = _ctx(port.postMessage, port, 1);
  // Browsers with postMessage, skip WebWorkers
  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
    defer = function (id) {
      _global.postMessage(id + '', '*');
    };
    _global.addEventListener('message', listener, false);
  // IE8-
  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
    defer = function (id) {
      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
        _html.removeChild(this);
        run.call(id);
      };
    };
  // Rest old browsers
  } else {
    defer = function (id) {
      setTimeout(_ctx(run, id, 1), 0);
    };
  }
}
var _task = {
  set: setTask,
  clear: clearTask
};

var macrotask = _task.set;
var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
var process$1 = _global.process;
var Promise$1 = _global.Promise;
var isNode = _cof(process$1) == 'process';

var _microtask = function () {
  var head, last, notify;

  var flush = function () {
    var parent, fn;
    if (isNode && (parent = process$1.domain)) parent.exit();
    while (head) {
      fn = head.fn;
      head = head.next;
      try {
        fn();
      } catch (e) {
        if (head) notify();
        else last = undefined;
        throw e;
      }
    } last = undefined;
    if (parent) parent.enter();
  };

  // Node.js
  if (isNode) {
    notify = function () {
      process$1.nextTick(flush);
    };
  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
    var toggle = true;
    var node = document.createTextNode('');
    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
    notify = function () {
      node.data = toggle = !toggle;
    };
  // environments with maybe non-completely correct, but existent Promise
  } else if (Promise$1 && Promise$1.resolve) {
    // Promise.resolve without an argument throws an error in LG WebOS 2
    var promise = Promise$1.resolve(undefined);
    notify = function () {
      promise.then(flush);
    };
  // for other environments - macrotask based on:
  // - setImmediate
  // - MessageChannel
  // - window.postMessag
  // - onreadystatechange
  // - setTimeout
  } else {
    notify = function () {
      // strange IE + webpack dev server bug - use .call(global)
      macrotask.call(_global, flush);
    };
  }

  return function (fn) {
    var task = { fn: fn, next: undefined };
    if (last) last.next = task;
    if (!head) {
      head = task;
      notify();
    } last = task;
  };
};

// 25.4.1.5 NewPromiseCapability(C)


function PromiseCapability(C) {
  var resolve, reject;
  this.promise = new C(function ($$resolve, $$reject) {
    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
    resolve = $$resolve;
    reject = $$reject;
  });
  this.resolve = _aFunction(resolve);
  this.reject = _aFunction(reject);
}

var f$5 = function (C) {
  return new PromiseCapability(C);
};

var _newPromiseCapability = {
	f: f$5
};

var _perform = function (exec) {
  try {
    return { e: false, v: exec() };
  } catch (e) {
    return { e: true, v: e };
  }
};

var navigator = _global.navigator;

var _userAgent = navigator && navigator.userAgent || '';

var _promiseResolve = function (C, x) {
  _anObject(C);
  if (_isObject(x) && x.constructor === C) return x;
  var promiseCapability = _newPromiseCapability.f(C);
  var resolve = promiseCapability.resolve;
  resolve(x);
  return promiseCapability.promise;
};

var task = _task.set;
var microtask = _microtask();




var PROMISE = 'Promise';
var TypeError$1 = _global.TypeError;
var process$2 = _global.process;
var versions = process$2 && process$2.versions;
var v8 = versions && versions.v8 || '';
var $Promise = _global[PROMISE];
var isNode$1 = _classof(process$2) == 'process';
var empty = function () { /* empty */ };
var Internal$1, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

var USE_NATIVE = !!function () {
  try {
    // correct subclassing with @@species support
    var promise = $Promise.resolve(1);
    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
      exec(empty, empty);
    };
    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
    return (isNode$1 || typeof PromiseRejectionEvent == 'function')
      && promise.then(empty) instanceof FakePromise
      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
      // we can't detect it synchronously, so just check versions
      && v8.indexOf('6.6') !== 0
      && _userAgent.indexOf('Chrome/66') === -1;
  } catch (e) { /* empty */ }
}();

// helpers
var isThenable = function (it) {
  var then;
  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
};
var notify = function (promise, isReject) {
  if (promise._n) return;
  promise._n = true;
  var chain = promise._c;
  microtask(function () {
    var value = promise._v;
    var ok = promise._s == 1;
    var i = 0;
    var run = function (reaction) {
      var handler = ok ? reaction.ok : reaction.fail;
      var resolve = reaction.resolve;
      var reject = reaction.reject;
      var domain = reaction.domain;
      var result, then, exited;
      try {
        if (handler) {
          if (!ok) {
            if (promise._h == 2) onHandleUnhandled(promise);
            promise._h = 1;
          }
          if (handler === true) result = value;
          else {
            if (domain) domain.enter();
            result = handler(value); // may throw
            if (domain) {
              domain.exit();
              exited = true;
            }
          }
          if (result === reaction.promise) {
            reject(TypeError$1('Promise-chain cycle'));
          } else if (then = isThenable(result)) {
            then.call(result, resolve, reject);
          } else resolve(result);
        } else reject(value);
      } catch (e) {
        if (domain && !exited) domain.exit();
        reject(e);
      }
    };
    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
    promise._c = [];
    promise._n = false;
    if (isReject && !promise._h) onUnhandled(promise);
  });
};
var onUnhandled = function (promise) {
  task.call(_global, function () {
    var value = promise._v;
    var unhandled = isUnhandled(promise);
    var result, handler, console;
    if (unhandled) {
      result = _perform(function () {
        if (isNode$1) {
          process$2.emit('unhandledRejection', value, promise);
        } else if (handler = _global.onunhandledrejection) {
          handler({ promise: promise, reason: value });
        } else if ((console = _global.console) && console.error) {
          console.error('Unhandled promise rejection', value);
        }
      });
      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
    } promise._a = undefined;
    if (unhandled && result.e) throw result.v;
  });
};
var isUnhandled = function (promise) {
  return promise._h !== 1 && (promise._a || promise._c).length === 0;
};
var onHandleUnhandled = function (promise) {
  task.call(_global, function () {
    var handler;
    if (isNode$1) {
      process$2.emit('rejectionHandled', promise);
    } else if (handler = _global.onrejectionhandled) {
      handler({ promise: promise, reason: promise._v });
    }
  });
};
var $reject = function (value) {
  var promise = this;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  promise._v = value;
  promise._s = 2;
  if (!promise._a) promise._a = promise._c.slice();
  notify(promise, true);
};
var $resolve = function (value) {
  var promise = this;
  var then;
  if (promise._d) return;
  promise._d = true;
  promise = promise._w || promise; // unwrap
  try {
    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
    if (then = isThenable(value)) {
      microtask(function () {
        var wrapper = { _w: promise, _d: false }; // wrap
        try {
          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
        } catch (e) {
          $reject.call(wrapper, e);
        }
      });
    } else {
      promise._v = value;
      promise._s = 1;
      notify(promise, false);
    }
  } catch (e) {
    $reject.call({ _w: promise, _d: false }, e); // wrap
  }
};

// constructor polyfill
if (!USE_NATIVE) {
  // 25.4.3.1 Promise(executor)
  $Promise = function Promise(executor) {
    _anInstance(this, $Promise, PROMISE, '_h');
    _aFunction(executor);
    Internal$1.call(this);
    try {
      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
    } catch (err) {
      $reject.call(this, err);
    }
  };
  // eslint-disable-next-line no-unused-vars
  Internal$1 = function Promise(executor) {
    this._c = [];             // <- awaiting reactions
    this._a = undefined;      // <- checked in isUnhandled reactions
    this._s = 0;              // <- state
    this._d = false;          // <- done
    this._v = undefined;      // <- value
    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
    this._n = false;          // <- notify
  };
  Internal$1.prototype = _redefineAll($Promise.prototype, {
    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
    then: function then(onFulfilled, onRejected) {
      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
      reaction.fail = typeof onRejected == 'function' && onRejected;
      reaction.domain = isNode$1 ? process$2.domain : undefined;
      this._c.push(reaction);
      if (this._a) this._a.push(reaction);
      if (this._s) notify(this, false);
      return reaction.promise;
    },
    // 25.4.5.1 Promise.prototype.catch(onRejected)
    'catch': function (onRejected) {
      return this.then(undefined, onRejected);
    }
  });
  OwnPromiseCapability = function () {
    var promise = new Internal$1();
    this.promise = promise;
    this.resolve = _ctx($resolve, promise, 1);
    this.reject = _ctx($reject, promise, 1);
  };
  _newPromiseCapability.f = newPromiseCapability = function (C) {
    return C === $Promise || C === Wrapper
      ? new OwnPromiseCapability(C)
      : newGenericPromiseCapability(C);
  };
}

_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
_setToStringTag($Promise, PROMISE);
_setSpecies(PROMISE);
Wrapper = _core[PROMISE];

// statics
_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
  // 25.4.4.5 Promise.reject(r)
  reject: function reject(r) {
    var capability = newPromiseCapability(this);
    var $$reject = capability.reject;
    $$reject(r);
    return capability.promise;
  }
});
_export(_export.S + _export.F * ( !USE_NATIVE), PROMISE, {
  // 25.4.4.6 Promise.resolve(x)
  resolve: function resolve(x) {
    return _promiseResolve( this, x);
  }
});
_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
  $Promise.all(iter)['catch'](empty);
})), PROMISE, {
  // 25.4.4.1 Promise.all(iterable)
  all: function all(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var resolve = capability.resolve;
    var reject = capability.reject;
    var result = _perform(function () {
      var values = [];
      var index = 0;
      var remaining = 1;
      _forOf(iterable, false, function (promise) {
        var $index = index++;
        var alreadyCalled = false;
        values.push(undefined);
        remaining++;
        C.resolve(promise).then(function (value) {
          if (alreadyCalled) return;
          alreadyCalled = true;
          values[$index] = value;
          --remaining || resolve(values);
        }, reject);
      });
      --remaining || resolve(values);
    });
    if (result.e) reject(result.v);
    return capability.promise;
  },
  // 25.4.4.4 Promise.race(iterable)
  race: function race(iterable) {
    var C = this;
    var capability = newPromiseCapability(C);
    var reject = capability.reject;
    var result = _perform(function () {
      _forOf(iterable, false, function (promise) {
        C.resolve(promise).then(capability.resolve, reject);
      });
    });
    if (result.e) reject(result.v);
    return capability.promise;
  }
});

var thaw_1 = createCommonjsModule(function (module, exports) {
var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.thaw = exports.Thaw = void 0;
/**
 * thaw an array of items
 */
var Thaw = /** @class */ (function () {
    function Thaw(items, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        var _a = __assign(__assign({}, Thaw.defaultSettings), options), each = _a.each, done = _a.done;
        this.i = 0;
        this.isStopped = false;
        this.items = items;
        this.options = options;
        this.tick = function () {
            if (_this.isStopped)
                return;
            _this.timeout = setTimeout(_this.tick, 0);
            if (Thaw.thawing)
                return;
            var item = _this.items[_this.i];
            if (_this.i >= _this.items.length) {
                if (done !== null) {
                    Thaw.thawing = true;
                    done();
                    Thaw.thawing = false;
                }
                _this.isStopped = true;
                clearTimeout(_this.timeout);
                return;
            }
            if (each !== null) {
                Thaw.thawing = true;
                each(item, _this.i);
                Thaw.thawing = false;
            }
            else if (item !== undefined) {
                item();
            }
            _this.i++;
        };
        Thaw.thaws.push(this);
        if (!options.delay) {
            this.tick();
        }
    }
    Object.defineProperty(Thaw, "isThawing", {
        /**
         * returns if Thaw.js is thawing
         */
        get: function () {
            return Thaw.thawing;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Stops all Thaw instances
     */
    Thaw.stopAll = function () {
        for (var i = 0; i < Thaw.thaws.length; i++) {
            Thaw.thaws[i].stop();
        }
    };
    /**
     * readies thaw to continue
     */
    Thaw.prototype.makeReady = function () {
        if (this.isStopped) {
            this.isStopped = false;
            return true;
        }
        return false;
    };
    /**
     * Adds an item to the end of this instance of Thaw and readies Thaw to process it
     */
    Thaw.prototype.add = function (item) {
        this.items.push(item);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Inserts an item just after the current item being processed in Thaw and readies Thaw to process it
     */
    Thaw.prototype.insert = function (item) {
        this.items.splice(this.i, 0, item);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Adds an Array to the end of this instance of Thaw and readies Thaw to process it
     */
    Thaw.prototype.addArray = function (items) {
        this.items = this.items.concat(items);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Inserts an Array just after the current item being processed in Thaw and readies Thaw to process them
     */
    Thaw.prototype.insertArray = function (items) {
        var before = this.items.splice(0, this.i);
        var after = this.items;
        this.items = before.concat(items, after);
        if (this.makeReady()) {
            this.tick();
        }
        return this;
    };
    /**
     * Stops this instance of Thaw
     */
    Thaw.prototype.stop = function () {
        this.isStopped = true;
        clearTimeout(this.timeout);
        if (this.options.done) {
            this.options.done();
        }
        return this;
    };
    Thaw.thawing = false;
    Thaw.thaws = [];
    Thaw.defaultSettings = {
        each: null,
        done: null
    };
    return Thaw;
}());
exports.Thaw = Thaw;
/**
 * simple thaw
 */
function thaw(items, options) {
    return new Thaw(items, options);
}
exports.thaw = thaw;

});

var block = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = void 0;

var Block = /** @class */ (function () {
    function Block(options, count) {
        if (count === void 0) { count = 200; }
        this.index = 0;
        this.thaws = [];
        this.count = count;
        this.options = options;
    }
    /**
     * add an item to the end of items
     */
    Block.prototype.add = function (item) {
        var next = this.next();
        next.add(item);
        return this;
    };
    /**
     * add an Array to the end of items
     */
    Block.prototype.addArray = function (items) {
        var next = this.next();
        next.addArray(items);
        return this;
    };
    /**
     * insert an item into items @ current position
     */
    Block.prototype.insert = function (item) {
        var next = this.next();
        next.insert(item);
        return this;
    };
    /**
     * insert and array into items @ current position
     */
    Block.prototype.insertArray = function (items) {
        var next = this.next();
        next.insertArray(items);
        return this;
    };
    /**
     * Stops all thaws in this block
     */
    Block.prototype.stop = function () {
        for (var i = 0; i < this.thaws.length; i++) {
            this.thaws[i].stop();
        }
        return this;
    };
    /**
     * Get next available in block
     */
    Block.prototype.next = function () {
        var thaw;
        var thaws = this.thaws;
        if (thaws.length < this.count) {
            thaw = new thaw_1.Thaw([], this.options);
            thaws.push(thaw);
        }
        else {
            thaw = thaws[this.index] || null;
        }
        this.index++;
        if (this.index >= this.count) {
            this.index = 0;
        }
        return thaw;
    };
    return Block;
}());
exports.Block = Block;

});

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.Block = exports.thaw = exports.Thaw = void 0;

Object.defineProperty(exports, "Thaw", { enumerable: true, get: function () { return thaw_1.Thaw; } });
Object.defineProperty(exports, "thaw", { enumerable: true, get: function () { return thaw_1.thaw; } });

Object.defineProperty(exports, "Block", { enumerable: true, get: function () { return block.Block; } });
if (typeof window !== 'undefined') {
    // @ts-ignore
    window.Thaw = thaw_1.Thaw;
    // @ts-ignore
    window.thaw = thaw_1.thaw;
    // @ts-ignore
    window.Thaw.Block = block.Block;
}

});

var isEnum = _objectPie.f;
var _objectToArray = function (isEntries) {
  return function (it) {
    var O = _toIobject(it);
    var keys = _objectKeys(O);
    var length = keys.length;
    var i = 0;
    var result = [];
    var key;
    while (length > i) {
      key = keys[i++];
      if (!_descriptors || isEnum.call(O, key)) {
        result.push(isEntries ? [key, O[key]] : O[key]);
      }
    }
    return result;
  };
};

// https://github.com/tc39/proposal-object-values-entries

var $values = _objectToArray(false);

_export(_export.S, 'Object', {
  values: function values(it) {
    return $values(it);
  }
});

/**
 *
 * @param values
 * @returns {*}
 */
var toArray = function toArray(values) {
  if (Array.isArray(values)) {
    return values;
  }

  return new Float32Array(Object.values(values));
};

/**
 *
 * @param values
 * @returns {number}
 */

var max$1 = function max(values) {
  return Math.max.apply(Math, _toConsumableArray(toArray(values)));
};

var mse = function mse(errors) {
  // mean squared error
  var sum = 0;

  for (var i = 0; i < errors.length; i++) {
    sum += Math.pow(errors[i], 2);
  }

  return sum / errors.length;
};

/**
 *
 * @param start
 * @param end
 * @returns {Array}
 */
var range = function range(start, end) {
  var result = [];

  for (; start < end; start++) {
    result.push(start);
  }

  return result;
};

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
}

var lookupTable = LookupTable;

function arraysToFloat32Arrays(arrays) {
  var result = [];

  for (var i = 0; i < arrays.length; i++) {
    result.push(Float32Array.from(arrays[i]));
  }

  return result;
}
function arrayToFloat32Arrays(array) {
  var result = [];

  for (var i = 0; i < array.length; i++) {
    result.push(Float32Array.from([array[i]]));
  }

  return result;
}
function arrayToFloat32Array(array) {
  return Float32Array.from(array);
}
function objectsToFloat32Arrays(objects, table, length) {
  var results = [];

  for (var i = 0; i < objects.length; i++) {
    var object = objects[i];
    var result = new Float32Array(length);

    for (var p in object) {
      if (object.hasOwnProperty(p)) {
        result[table[p]] = object[p];
      }
    }

    results.push(result);
  }

  return results;
}
function objectToFloat32Arrays(object) {
  var result = [];

  for (var p in object) {
    result.push(Float32Array.from([object[p]]));
  }

  return result;
}
function objectToFloat32Array(object, table, length) {
  var result = new Float32Array(length);

  for (var p in object) {
    if (object.hasOwnProperty(p)) {
      result[table[p]] = object[p];
    }
  }

  return result;
}

var cast = /*#__PURE__*/Object.freeze({
  __proto__: null,
  arraysToFloat32Arrays: arraysToFloat32Arrays,
  arrayToFloat32Arrays: arrayToFloat32Arrays,
  arrayToFloat32Array: arrayToFloat32Array,
  objectsToFloat32Arrays: objectsToFloat32Arrays,
  objectToFloat32Arrays: objectToFloat32Arrays,
  objectToFloat32Array: objectToFloat32Array
});

var Thaw = dist.Thaw; // const TrainStream = require('./train-stream');

var zeros$9 = zeros$1.zeros;
var arrayToFloat32Array$1 = cast.arrayToFloat32Array;

function getTypedArrayFn(value, table) {
  if (value.buffer instanceof ArrayBuffer) {
    return null;
  }

  if (Array.isArray(value)) {
    return arrayToFloat32Array$1;
  }

  var _Object$keys = Object.keys(table),
      length = _Object$keys.length;

  return function (v) {
    var array = new Float32Array(length);

    for (var p in table) {
      array[table[p]] = v[p] || 0;
    }

    return array;
  };
}
/**
 * @param {object} options
 * @constructor
 */


var NeuralNetwork = /*#__PURE__*/function () {
  _createClass(NeuralNetwork, null, [{
    key: "trainDefaults",
    get: function get() {
      return {
        iterations: 20000,
        // the maximum times to iterate the training data
        errorThresh: 0.005,
        // the acceptable error percentage from training data
        log: false,
        // true to use console.log, when a function is supplied it is used
        logPeriod: 10,
        // iterations between logging out
        learningRate: 0.3,
        // multiply's against the input and the delta then adds to momentum
        momentum: 0.1,
        // multiply's against the specified "change" then adds to learning rate for change
        callback: null,
        // a periodic call back that can be triggered while training
        callbackPeriod: 10,
        // the number of iterations through the training data between callback calls
        timeout: Infinity,
        // the max number of milliseconds to train for
        praxis: null,
        beta1: 0.9,
        beta2: 0.999,
        epsilon: 1e-8
      };
    }
  }, {
    key: "defaults",
    get: function get() {
      return {
        leakyReluAlpha: 0.01,
        binaryThresh: 0.5,
        hiddenLayers: null,
        // array of ints for the sizes of the hidden layers in the network
        activation: 'sigmoid' // Supported activation types ['sigmoid', 'relu', 'leaky-relu', 'tanh']

      };
    }
  }]);

  function NeuralNetwork() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetwork);

    Object.assign(this, this.constructor.defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(_objectSpread2(_objectSpread2({}, this.constructor.trainDefaults), options));
    this.sizes = null;
    this.outputLayer = null;
    this.biases = null; // weights for bias nodes

    this.weights = null;
    this.outputs = null; // state for training

    this.deltas = null;
    this.changes = null; // for momentum

    this.errors = null;
    this.errorCheckInterval = 1;

    if (!this.constructor.prototype.hasOwnProperty('runInput')) {
      this.runInput = null;
    }

    if (!this.constructor.prototype.hasOwnProperty('calculateDeltas')) {
      this.calculateDeltas = null;
    }

    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;

    if (options.inputSize && options.hiddenLayers && options.outputSize) {
      this.sizes = [options.inputSize].concat(options.hiddenLayers).concat([options.outputSize]);
    }
  }
  /**
   *
   * Expects this.sizes to have been set
   */


  _createClass(NeuralNetwork, [{
    key: "initialize",
    value: function initialize() {
      if (!this.sizes) throw new Error('Sizes must be set before initializing');
      this.outputLayer = this.sizes.length - 1;
      this.biases = []; // weights for bias nodes

      this.weights = [];
      this.outputs = []; // state for training

      this.deltas = [];
      this.changes = []; // for momentum

      this.errors = [];

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        var size = this.sizes[layer];
        this.deltas[layer] = zeros$9(size);
        this.errors[layer] = zeros$9(size);
        this.outputs[layer] = zeros$9(size);

        if (layer > 0) {
          this.biases[layer] = randos$1(size);
          this.weights[layer] = new Array(size);
          this.changes[layer] = new Array(size);

          for (var node = 0; node < size; node++) {
            var prevSize = this.sizes[layer - 1];
            this.weights[layer][node] = randos$1(prevSize);
            this.changes[layer][node] = zeros$9(prevSize);
          }
        }
      }

      this.setActivation();

      if (this.trainOpts.praxis === 'adam') {
        this._setupAdam();
      }
    }
    /**
     *
     * @param activation supported inputs: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
     */

  }, {
    key: "setActivation",
    value: function setActivation(activation) {
      this.activation = activation || this.activation;

      switch (this.activation) {
        case 'sigmoid':
          this.runInput = this.runInput || this._runInputSigmoid;
          this.calculateDeltas = this.calculateDeltas || this._calculateDeltasSigmoid;
          break;

        case 'relu':
          this.runInput = this.runInput || this._runInputRelu;
          this.calculateDeltas = this.calculateDeltas || this._calculateDeltasRelu;
          break;

        case 'leaky-relu':
          this.runInput = this.runInput || this._runInputLeakyRelu;
          this.calculateDeltas = this.calculateDeltas || this._calculateDeltasLeakyRelu;
          break;

        case 'tanh':
          this.runInput = this.runInput || this._runInputTanh;
          this.calculateDeltas = this.calculateDeltas || this._calculateDeltasTanh;
          break;

        default:
          throw new Error("Unknown activation ".concat(this.activation, ". Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'"));
      }
    }
    /**
     *
     * @returns boolean
     */

  }, {
    key: "run",

    /**
     *
     * @param input
     * @returns {*}
     */
    value: function run(input) {
      if (!this.isRunnable) return null;

      if (this.inputLookup) {
        input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
      }

      var output = this.runInput(input).slice(0);

      if (this.outputLookup) {
        output = lookup.toObject(this.outputLookup, output);
      }

      return output;
    }
    /**
     * trains via sigmoid
     * @param input
     * @returns {*}
     */

  }, {
    key: "_runInputSigmoid",
    value: function _runInputSigmoid(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var activeLayer = this.sizes[layer];
        var activeWeights = this.weights[layer];
        var activeBiases = this.biases[layer];
        var activeOutputs = this.outputs[layer];

        for (var node = 0; node < activeLayer; node++) {
          var weights = activeWeights[node];
          var sum = activeBiases[node];

          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          } // sigmoid


          activeOutputs[node] = 1 / (1 + Math.exp(-sum));
        }

        output = input = this.outputs[layer];
      }

      return output;
    }
  }, {
    key: "_runInputRelu",
    value: function _runInputRelu(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var currentSize = this.sizes[layer];
        var currentWeights = this.weights[layer];
        var currentBiases = this.biases[layer];
        var currentOutputs = this.outputs[layer];

        for (var node = 0; node < currentSize; node++) {
          var weights = currentWeights[node];
          var sum = currentBiases[node];

          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          } // relu


          currentOutputs[node] = sum < 0 ? 0 : sum;
        }

        output = input = currentOutputs;
      }

      return output;
    }
  }, {
    key: "_runInputLeakyRelu",
    value: function _runInputLeakyRelu(input) {
      this.outputs[0] = input; // set output state of input layer

      var alpha = this.leakyReluAlpha;
      var output = null;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var currentSize = this.sizes[layer];
        var currentWeights = this.weights[layer];
        var currentBiases = this.biases[layer];
        var currentOutputs = this.outputs[layer];

        for (var node = 0; node < currentSize; node++) {
          var weights = currentWeights[node];
          var sum = currentBiases[node];

          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          } // leaky relu


          currentOutputs[node] = sum < 0 ? 0 : alpha * sum;
        }

        output = input = currentOutputs;
      }

      return output;
    }
  }, {
    key: "_runInputTanh",
    value: function _runInputTanh(input) {
      this.outputs[0] = input; // set output state of input layer

      var output = null;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var currentSize = this.sizes[layer];
        var currentWeights = this.weights[layer];
        var currentBiases = this.biases[layer];
        var currentOutputs = this.outputs[layer];

        for (var node = 0; node < currentSize; node++) {
          var weights = currentWeights[node];
          var sum = currentBiases[node];

          for (var k = 0; k < weights.length; k++) {
            sum += weights[k] * input[k];
          } // tanh


          currentOutputs[node] = Math.tanh(sum);
        }

        output = input = currentOutputs;
      }

      return output;
    }
    /**
     *
     * @param data
     * Verifies network sizes are initialized
     * If they are not it will initialize them based off the data set.
     */

  }, {
    key: "verifyIsInitialized",
    value: function verifyIsInitialized(data) {
      var _this = this;

      if (this.sizes) return;
      this.sizes = [];
      this.sizes.push(data[0].input.length);

      if (!this.hiddenLayers) {
        this.sizes.push(Math.max(3, Math.floor(data[0].input.length / 2)));
      } else {
        this.hiddenLayers.forEach(function (size) {
          _this.sizes.push(size);
        });
      }

      this.sizes.push(data[0].output.length);
      this.initialize();
    }
    /**
     *
     * @param options
     *    Supports all `trainDefaults` properties
     *    also supports:
     *       learningRate: (number),
     *       momentum: (number),
     *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
     */

  }, {
    key: "updateTrainingOptions",
    value: function updateTrainingOptions(options) {
      var trainDefaults = this.constructor.trainDefaults;

      for (var p in trainDefaults) {
        if (!trainDefaults.hasOwnProperty(p)) continue;
        this.trainOpts[p] = options.hasOwnProperty(p) ? options[p] : trainDefaults[p];
      }

      this.validateTrainingOptions(this.trainOpts);
      this.setLogMethod(options.log || this.trainOpts.log);
      this.activation = options.activation || this.activation;
    }
    /**
     *
     * @param options
     */

  }, {
    key: "validateTrainingOptions",
    value: function validateTrainingOptions(options) {
      var validations = {
        iterations: function iterations(val) {
          return typeof val === 'number' && val > 0;
        },
        errorThresh: function errorThresh(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        log: function log(val) {
          return typeof val === 'function' || typeof val === 'boolean';
        },
        logPeriod: function logPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        learningRate: function learningRate(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        momentum: function momentum(val) {
          return typeof val === 'number' && val > 0 && val < 1;
        },
        callback: function callback(val) {
          return typeof val === 'function' || val === null;
        },
        callbackPeriod: function callbackPeriod(val) {
          return typeof val === 'number' && val > 0;
        },
        timeout: function timeout(val) {
          return typeof val === 'number' && val > 0;
        }
      };

      for (var p in validations) {
        if (!validations.hasOwnProperty(p)) continue;
        if (!options.hasOwnProperty(p)) continue;

        if (!validations[p](options[p])) {
          throw new Error("[".concat(p, ", ").concat(options[p], "] is out of normal training range, your network will probably not train."));
        }
      }
    }
    /**
     *
     *  Gets JSON of trainOpts object
     *    NOTE: Activation is stored directly on JSON object and not in the training options
     */

  }, {
    key: "getTrainOptsJSON",
    value: function getTrainOptsJSON() {
      var _this2 = this;

      return Object.keys(this.constructor.trainDefaults).reduce(function (opts, opt) {
        if (opt === 'timeout' && _this2.trainOpts[opt] === Infinity) return opts;
        if (opt === 'callback') return opts;
        if (_this2.trainOpts[opt]) opts[opt] = _this2.trainOpts[opt];
        if (opt === 'log') opts.log = typeof opts.log === 'function';
        return opts;
      }, {});
    }
    /**
     *
     * @param log
     * if a method is passed in method is used
     * if false passed in nothing is logged
     * @returns error
     */

  }, {
    key: "setLogMethod",
    value: function setLogMethod(log) {
      if (typeof log === 'function') {
        this.trainOpts.log = log;
      } else if (log) {
        this.trainOpts.log = this.logTrainingStatus;
      } else {
        this.trainOpts.log = false;
      }
    }
    /**
     *
     * @param status
     * log training status
     */

  }, {
    key: "logTrainingStatus",
    value: function logTrainingStatus(status) {
      console.log("iterations: ".concat(status.iterations, ", training error: ").concat(status.error));
    }
    /**
     *
     * @param data
     * @returns {Number} error
     */

  }, {
    key: "calculateTrainingError",
    value: function calculateTrainingError(data) {
      var sum = 0;

      for (var i = 0; i < data.length; ++i) {
        sum += this.trainPattern(data[i], true);
      }

      return sum / data.length;
    }
    /**
     * @param data
     */

  }, {
    key: "trainPatterns",
    value: function trainPatterns(data) {
      for (var i = 0; i < data.length; ++i) {
        this.trainPattern(data[i]);
      }
    }
    /**
     *
     * @param {object} data
     * @param {object} status { iterations: number, error: number }
     * @param endTime
     */

  }, {
    key: "trainingTick",
    value: function trainingTick(data, status, endTime) {
      var _this$trainOpts = this.trainOpts,
          callback = _this$trainOpts.callback,
          callbackPeriod = _this$trainOpts.callbackPeriod,
          errorThresh = _this$trainOpts.errorThresh,
          iterations = _this$trainOpts.iterations,
          log = _this$trainOpts.log,
          logPeriod = _this$trainOpts.logPeriod;

      if (status.iterations >= iterations || status.error <= errorThresh || Date.now() >= endTime) {
        return false;
      }

      status.iterations++;

      if (log && status.iterations % logPeriod === 0) {
        status.error = this.calculateTrainingError(data);
        log(status);
      } else if (status.iterations % this.errorCheckInterval === 0) {
        status.error = this.calculateTrainingError(data);
      } else {
        this.trainPatterns(data);
      }

      if (callback && status.iterations % callbackPeriod === 0) {
        callback({
          iterations: status.iterations,
          error: status.error
        });
      }

      return true;
    }
    /**
     *
     * @param data
     * @param options
     * @protected
     * @return {object} { data, status, endTime }
     */

  }, {
    key: "prepTraining",
    value: function prepTraining(data, options) {
      this.updateTrainingOptions(options);
      data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;
      var status = {
        error: 1,
        iterations: 0
      };
      this.verifyIsInitialized(data);
      return {
        data: data,
        status: status,
        endTime: endTime
      };
    }
    /**
     *
     * @param data
     * @param options
     * @returns {object} {error: number, iterations: number}
     */

  }, {
    key: "train",
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var status;
      var endTime;

      var _this$prepTraining = this.prepTraining(data, _objectSpread2(_objectSpread2({}, this.trainOpts), options));

      data = _this$prepTraining.data;
      status = _this$prepTraining.status;
      endTime = _this$prepTraining.endTime;

      while (this.trainingTick(data, status, endTime)) {
      }

      return status;
    }
    /**
     *
     * @param data
     * @param options
     * @returns {Promise}
     * @resolves {{error: number, iterations: number}}
     * @rejects {{trainError: string, status: {error: number, iterations: number}}
     */

  }, {
    key: "trainAsync",
    value: function trainAsync(data) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var status;
      var endTime;

      var _this$prepTraining2 = this.prepTraining(data, options);

      data = _this$prepTraining2.data;
      status = _this$prepTraining2.status;
      endTime = _this$prepTraining2.endTime;
      return new Promise(function (resolve, reject) {
        try {
          var thawedTrain = new Thaw(new Array(_this3.trainOpts.iterations), {
            delay: true,
            each: function each() {
              return _this3.trainingTick(data, status, endTime) || thawedTrain.stop();
            },
            done: function done() {
              return resolve(status);
            }
          });
          thawedTrain.tick();
        } catch (trainError) {
          console.log(JSON.stringify(trainError));
          reject(new Error({
            trainError: trainError,
            status: status
          }));
        }
      });
    }
    /**
     *
     * @param {object} value
     * @param {boolean} [logErrorRate]
     */

  }, {
    key: "trainPattern",
    value: function trainPattern(value, logErrorRate) {
      // forward propagate
      this.runInput(value.input); // back propagate

      this.calculateDeltas(value.output);
      this.adjustWeights();

      if (logErrorRate) {
        return mse(this.errors[this.outputLayer]);
      }

      return null;
    }
    /**
     *
     * @param target
     */

  }, {
    key: "_calculateDeltasSigmoid",
    value: function _calculateDeltasSigmoid(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        var activeSize = this.sizes[layer];
        var activeOutput = this.outputs[layer];
        var activeError = this.errors[layer];
        var activeDeltas = this.deltas[layer];
        var nextLayer = this.weights[layer + 1];

        for (var node = 0; node < activeSize; node++) {
          var output = activeOutput[node];
          var error = 0;

          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            var deltas = this.deltas[layer + 1];

            for (var k = 0; k < deltas.length; k++) {
              error += deltas[k] * nextLayer[k][node];
            }
          }

          activeError[node] = error;
          activeDeltas[node] = error * output * (1 - output);
        }
      }
    }
    /**
     *
     * @param target
     */

  }, {
    key: "_calculateDeltasRelu",
    value: function _calculateDeltasRelu(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        var currentSize = this.sizes[layer];
        var currentOutputs = this.outputs[layer];
        var nextWeights = this.weights[layer + 1];
        var nextDeltas = this.deltas[layer + 1];
        var currentErrors = this.errors[layer];
        var currentDeltas = this.deltas[layer];

        for (var node = 0; node < currentSize; node++) {
          var output = currentOutputs[node];
          var error = 0;

          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            for (var k = 0; k < nextDeltas.length; k++) {
              error += nextDeltas[k] * nextWeights[k][node];
            }
          }

          currentErrors[node] = error;
          currentDeltas[node] = output > 0 ? error : 0;
        }
      }
    }
    /**
     *
     * @param target
     */

  }, {
    key: "_calculateDeltasLeakyRelu",
    value: function _calculateDeltasLeakyRelu(target) {
      var alpha = this.leakyReluAlpha;

      for (var layer = this.outputLayer; layer >= 0; layer--) {
        var currentSize = this.sizes[layer];
        var currentOutputs = this.outputs[layer];
        var nextDeltas = this.deltas[layer + 1];
        var nextWeights = this.weights[layer + 1];
        var currentErrors = this.errors[layer];
        var currentDeltas = this.deltas[layer];

        for (var node = 0; node < currentSize; node++) {
          var output = currentOutputs[node];
          var error = 0;

          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            for (var k = 0; k < nextDeltas.length; k++) {
              error += nextDeltas[k] * nextWeights[k][node];
            }
          }

          currentErrors[node] = error;
          currentDeltas[node] = output > 0 ? error : alpha * error;
        }
      }
    }
    /**
     *
     * @param target
     */

  }, {
    key: "_calculateDeltasTanh",
    value: function _calculateDeltasTanh(target) {
      for (var layer = this.outputLayer; layer >= 0; layer--) {
        var currentSize = this.sizes[layer];
        var currentOutputs = this.outputs[layer];
        var nextDeltas = this.deltas[layer + 1];
        var nextWeights = this.weights[layer + 1];
        var currentErrors = this.errors[layer];
        var currentDeltas = this.deltas[layer];

        for (var node = 0; node < currentSize; node++) {
          var output = currentOutputs[node];
          var error = 0;

          if (layer === this.outputLayer) {
            error = target[node] - output;
          } else {
            for (var k = 0; k < nextDeltas.length; k++) {
              error += nextDeltas[k] * nextWeights[k][node];
            }
          }

          currentErrors[node] = error;
          currentDeltas[node] = (1 - output * output) * error;
        }
      }
    }
    /**
     *
     * Changes weights of networks
     */

  }, {
    key: "adjustWeights",
    value: function adjustWeights() {
      var _this$trainOpts2 = this.trainOpts,
          learningRate = _this$trainOpts2.learningRate,
          momentum = _this$trainOpts2.momentum;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var incoming = this.outputs[layer - 1];
        var activeSize = this.sizes[layer];
        var activeDelta = this.deltas[layer];
        var activeChanges = this.changes[layer];
        var activeWeights = this.weights[layer];
        var activeBiases = this.biases[layer];

        for (var node = 0; node < activeSize; node++) {
          var delta = activeDelta[node];

          for (var k = 0; k < incoming.length; k++) {
            var change = activeChanges[node][k];
            change = learningRate * delta * incoming[k] + momentum * change;
            activeChanges[node][k] = change;
            activeWeights[node][k] += change;
          }

          activeBiases[node] += learningRate * delta;
        }
      }
    }
  }, {
    key: "_setupAdam",
    value: function _setupAdam() {
      this.biasChangesLow = [];
      this.biasChangesHigh = [];
      this.changesLow = [];
      this.changesHigh = [];
      this.iterations = 0;

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        var size = this.sizes[layer];

        if (layer > 0) {
          this.biasChangesLow[layer] = zeros$9(size);
          this.biasChangesHigh[layer] = zeros$9(size);
          this.changesLow[layer] = new Array(size);
          this.changesHigh[layer] = new Array(size);

          for (var node = 0; node < size; node++) {
            var prevSize = this.sizes[layer - 1];
            this.changesLow[layer][node] = zeros$9(prevSize);
            this.changesHigh[layer][node] = zeros$9(prevSize);
          }
        }
      }

      this.adjustWeights = this._adjustWeightsAdam;
    }
  }, {
    key: "_adjustWeightsAdam",
    value: function _adjustWeightsAdam() {
      this.iterations++;
      var iterations = this.iterations;
      var _this$trainOpts3 = this.trainOpts,
          beta1 = _this$trainOpts3.beta1,
          beta2 = _this$trainOpts3.beta2,
          epsilon = _this$trainOpts3.epsilon,
          learningRate = _this$trainOpts3.learningRate;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var incoming = this.outputs[layer - 1];
        var currentSize = this.sizes[layer];
        var currentDeltas = this.deltas[layer];
        var currentChangesLow = this.changesLow[layer];
        var currentChangesHigh = this.changesHigh[layer];
        var currentWeights = this.weights[layer];
        var currentBiases = this.biases[layer];
        var currentBiasChangesLow = this.biasChangesLow[layer];
        var currentBiasChangesHigh = this.biasChangesHigh[layer];

        for (var node = 0; node < currentSize; node++) {
          var delta = currentDeltas[node];

          for (var k = 0; k < incoming.length; k++) {
            var gradient = delta * incoming[k];
            var changeLow = currentChangesLow[node][k] * beta1 + (1 - beta1) * gradient;
            var changeHigh = currentChangesHigh[node][k] * beta2 + (1 - beta2) * gradient * gradient;
            var momentumCorrection = changeLow / (1 - Math.pow(beta1, iterations));
            var gradientCorrection = changeHigh / (1 - Math.pow(beta2, iterations));
            currentChangesLow[node][k] = changeLow;
            currentChangesHigh[node][k] = changeHigh;
            currentWeights[node][k] += learningRate * momentumCorrection / (Math.sqrt(gradientCorrection) + epsilon);
          }

          var biasGradient = currentDeltas[node];
          var biasChangeLow = currentBiasChangesLow[node] * beta1 + (1 - beta1) * biasGradient;
          var biasChangeHigh = currentBiasChangesHigh[node] * beta2 + (1 - beta2) * biasGradient * biasGradient;
          var biasMomentumCorrection = currentBiasChangesLow[node] / (1 - Math.pow(beta1, iterations));
          var biasGradientCorrection = currentBiasChangesHigh[node] / (1 - Math.pow(beta2, iterations));
          currentBiasChangesLow[node] = biasChangeLow;
          currentBiasChangesHigh[node] = biasChangeHigh;
          currentBiases[node] += learningRate * biasMomentumCorrection / (Math.sqrt(biasGradientCorrection) + epsilon);
        }
      }
    }
    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: "formatData",
    value: function formatData(data) {
      if (!Array.isArray(data)) {
        // turn stream datum into array
        data = [data];
      }

      if (!Array.isArray(data[0].input)) {
        if (this.inputLookup) {
          this.inputLookupLength = Object.keys(this.inputLookup).length;
        } else {
          var inputLookup = new lookupTable(data, 'input');
          this.inputLookup = inputLookup.table;
          this.inputLookupLength = inputLookup.length;
        }
      }

      if (!Array.isArray(data[0].output)) {
        if (this.outputLookup) {
          this.outputLookupLength = Object.keys(this.outputLookup).length;
        } else {
          var _lookup = new lookupTable(data, 'output');

          this.outputLookup = _lookup.table;
          this.outputLookupLength = _lookup.length;
        }
      }

      if (typeof this._formatInput === 'undefined') {
        this._formatInput = getTypedArrayFn(data[0].input, this.inputLookup);
        this._formatOutput = getTypedArrayFn(data[0].output, this.outputLookup);
      } // turn sparse hash input into arrays with 0s as filler


      if (this._formatInput && this._formatOutput) {
        var result = [];

        for (var i = 0; i < data.length; i++) {
          result.push({
            input: this._formatInput(data[i].input),
            output: this._formatOutput(data[i].output)
          });
        }

        return result;
      }

      if (this._formatInput) {
        var _result = [];

        for (var _i = 0; _i < data.length; _i++) {
          _result.push({
            input: this._formatInput(data[_i].input),
            output: data[_i].output
          });
        }

        return _result;
      }

      if (this._formatOutput) {
        var _result2 = [];

        for (var _i2 = 0; _i2 < data.length; _i2++) {
          _result2.push({
            input: data[_i2].input,
            output: this._formatOutput(data[_i2].output)
          });
        }

        return _result2;
      }

      return data;
    }
  }, {
    key: "addFormat",
    value: function addFormat(data) {
      this.inputLookup = lookup.addKeys(data.input, this.inputLookup);

      if (this.inputLookup) {
        this.inputLookupLength = Object.keys(this.inputLookup).length;
      }

      this.outputLookup = lookup.addKeys(data.output, this.outputLookup);

      if (this.outputLookup) {
        this.outputLookupLength = Object.keys(this.outputLookup).length;
      }
    }
    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array,
     *  }
     * }
     */

  }, {
    key: "test",
    value: function test(data) {
      var _this4 = this;

      data = this.formatData(data); // for binary classification problems with one output node

      var isBinary = data[0].output.length === 1; // for classification problems

      var misclasses = []; // run each pattern through the trained network and collect
      // error and misclassification statistics

      var errorSum = 0;

      if (isBinary) {
        var falsePos = 0;
        var falseNeg = 0;
        var truePos = 0;
        var trueNeg = 0;

        var _loop = function _loop(i) {
          var output = _this4.runInput(data[i].input);

          var target = data[i].output;
          var actual = output[0] > _this4.binaryThresh ? 1 : 0;
          var expected = target[0];

          if (actual !== expected) {
            var misclass = data[i];
            misclasses.push({
              input: misclass.input,
              output: misclass.output,
              actual: actual,
              expected: expected
            });
          }

          if (actual === 0 && expected === 0) {
            trueNeg++;
          } else if (actual === 1 && expected === 1) {
            truePos++;
          } else if (actual === 0 && expected === 1) {
            falseNeg++;
          } else if (actual === 1 && expected === 0) {
            falsePos++;
          }

          errorSum += mse(output.map(function (value, i) {
            return target[i] - value;
          }));
        };

        for (var i = 0; i < data.length; i++) {
          _loop(i);
        }

        return {
          error: errorSum / data.length,
          misclasses: misclasses,
          total: data.length,
          trueNeg: trueNeg,
          truePos: truePos,
          falseNeg: falseNeg,
          falsePos: falsePos,
          precision: truePos > 0 ? truePos / (truePos + falsePos) : 0,
          recall: truePos > 0 ? truePos / (truePos + falseNeg) : 0,
          accuracy: (trueNeg + truePos) / data.length
        };
      }

      var _loop2 = function _loop2(_i3) {
        var output = _this4.runInput(data[_i3].input);

        var target = data[_i3].output;
        var actual = output.indexOf(max$1(output));
        var expected = target.indexOf(max$1(target));

        if (actual !== expected) {
          var misclass = data[_i3];
          misclasses.push({
            input: misclass.input,
            output: misclass.output,
            actual: actual,
            expected: expected
          });
        }

        errorSum += mse(output.map(function (value, i) {
          return target[i] - value;
        }));
      };

      for (var _i3 = 0; _i3 < data.length; _i3++) {
        _loop2(_i3);
      }

      return {
        error: errorSum / data.length,
        misclasses: misclasses,
        total: data.length
      };
    }
    /**
     *
     * @returns
     *  {
     *    layers: [
     *      {
     *        x: {},
     *        y: {}
     *      },
     *      {
     *        '0': {
     *          bias: -0.98771313,
     *          weights: {
     *            x: 0.8374838,
     *            y: 1.245858
     *          },
     *        '1': {
     *          bias: 3.48192004,
     *          weights: {
     *            x: 1.7825821,
     *            y: -2.67899
     *          }
     *        }
     *      },
     *      {
     *        f: {
     *          bias: 0.27205739,
     *          weights: {
     *            '0': 1.3161821,
     *            '1': 2.00436
     *          }
     *        }
     *      }
     *    ]
     *  }
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      if (this.sizes === null) {
        this.initialize();
      }

      var layers = [];

      for (var layer = 0; layer <= this.outputLayer; layer++) {
        layers[layer] = {};
        var nodes = void 0; // turn any internal arrays back into hashes for readable json

        if (layer === 0 && this.inputLookup) {
          nodes = Object.keys(this.inputLookup);
        } else if (this.outputLookup && layer === this.outputLayer) {
          nodes = Object.keys(this.outputLookup);
        } else {
          nodes = range(0, this.sizes[layer]);
        }

        for (var j = 0; j < nodes.length; j++) {
          var node = nodes[j];
          layers[layer][node] = {};

          if (layer > 0) {
            layers[layer][node].bias = this.biases[layer][j];
            layers[layer][node].weights = {};

            for (var k in layers[layer - 1]) {
              var index = k;

              if (layer === 1 && this.inputLookup) {
                index = this.inputLookup[k];
              }

              layers[layer][node].weights[k] = this.weights[layer][j][index];
            }
          }
        }
      }

      return {
        sizes: this.sizes.slice(0),
        layers: layers,
        outputLookup: this.outputLookup !== null,
        inputLookup: this.inputLookup !== null,
        activation: this.activation,
        trainOpts: this.getTrainOptsJSON()
      };
    }
    /**
     *
     * @param json
     * @returns {NeuralNetwork}
     */

  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      Object.assign(this, this.constructor.defaults, json);
      this.sizes = json.sizes;
      this.initialize();

      for (var i = 0; i <= this.outputLayer; i++) {
        var layer = json.layers[i];

        if (i === 0 && (!layer[0] || json.inputLookup)) {
          this.inputLookup = lookup.toHash(layer);
          this.inputLookupLength = Object.keys(this.inputLookup).length;
        } else if (i === this.outputLayer && (!layer[0] || json.outputLookup)) {
          this.outputLookup = lookup.toHash(layer);
        }

        if (i > 0) {
          var nodes = Object.keys(layer);
          this.sizes[i] = nodes.length;

          for (var j in nodes) {
            if (nodes.hasOwnProperty(j)) {
              var node = nodes[j];
              this.biases[i][j] = layer[node].bias;
              this.weights[i][j] = toArray(layer[node].weights);
            }
          }
        }
      }

      if (json.hasOwnProperty('trainOpts')) {
        this.updateTrainingOptions(json.trainOpts);
      }

      return this;
    }
    /**
     * @param {Function} [cb]
     * @returns {Function}
     */

  }, {
    key: "toFunction",
    value: function toFunction(cb) {
      var activation = this.activation;
      var leakyReluAlpha = this.leakyReluAlpha;
      var needsVar = false;

      function nodeHandle(layers, layerNumber, nodeKey) {
        if (layerNumber === 0) {
          return typeof nodeKey === 'string' ? "(input['".concat(nodeKey, "']||0)") : "(input[".concat(nodeKey, "]||0)");
        }

        var layer = layers[layerNumber];
        var node = layer[nodeKey];
        var result = ['(', node.bias];

        for (var w in node.weights) {
          if (node.weights[w] < 0) {
            result.push("".concat(node.weights[w], "*").concat(nodeHandle(layers, layerNumber - 1, w)));
          } else {
            result.push("+".concat(node.weights[w], "*").concat(nodeHandle(layers, layerNumber - 1, w)));
          }
        }

        result.push(')');

        switch (activation) {
          case 'sigmoid':
            return "1/(1+1/Math.exp(".concat(result.join(''), "))");

          case 'relu':
            {
              needsVar = true;
              return "((v=".concat(result.join(''), ")<0?0:v)");
            }

          case 'leaky-relu':
            {
              needsVar = true;
              return "((v=".concat(result.join(''), ")<0?0:").concat(leakyReluAlpha, "*v)");
            }

          case 'tanh':
            return "Math.tanh(".concat(result.join(''), ")");

          default:
            throw new Error("Unknown activation ".concat(this.activation, ". Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'"));
        }
      }

      var _this$toJSON = this.toJSON(),
          layers = _this$toJSON.layers;

      var layersAsMath = [];
      var result;

      for (var i in layers[layers.length - 1]) {
        layersAsMath.push(nodeHandle(layers, layers.length - 1, i));
      }

      if (this.outputLookup) {
        result = "{".concat(Object.keys(this.outputLookup).map(function (key, i) {
          return "'".concat(key, "':").concat(layersAsMath[i]);
        }), "}");
      } else {
        result = "[".concat(layersAsMath.join(','), "]");
      }

      var source = "".concat(needsVar ? 'var v;' : '', "return ").concat(result, ";"); // eslint-disable-next-line no-new-func

      return new Function('input', cb ? cb(source) : source);
    }
  }, {
    key: "isRunnable",
    get: function get() {
      var _this5 = this;

      if (!this.runInput) {
        console.error('Activation function has not been initialized, did you run train()?');
        return false;
      }

      var checkFns = ['sizes', 'outputLayer', 'biases', 'weights', 'outputs', 'deltas', 'changes', 'errors'].filter(function (c) {
        return _this5[c] === null;
      });

      if (checkFns.length > 0) {
        console.error("Some settings have not been initialized correctly, did you run train()? Found issues with: ".concat(checkFns.join(', ')));
        return false;
      }

      return true;
    }
  }]);

  return NeuralNetwork;
}();

var neuralNetwork = NeuralNetwork;

// true  -> String#at
// false -> String#codePointAt
var _stringAt = function (TO_STRING) {
  return function (that, pos) {
    var s = String(_defined(that));
    var i = _toInteger(pos);
    var l = s.length;
    var a, b;
    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
    a = s.charCodeAt(i);
    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
      ? TO_STRING ? s.charAt(i) : a
      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
  };
};

var $at = _stringAt(true);

// 21.1.3.27 String.prototype[@@iterator]()
_iterDefine(String, 'String', function (iterated) {
  this._t = String(iterated); // target
  this._i = 0;                // next index
// 21.1.5.2.1 %StringIteratorPrototype%.next()
}, function () {
  var O = this._t;
  var index = this._i;
  var point;
  if (index >= O.length) return { value: undefined, done: true };
  point = $at(O, index);
  this._i += point.length;
  return { value: point, done: false };
});

var _createProperty = function (object, index, value) {
  if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
  else object[index] = value;
};

_export(_export.S + _export.F * !_iterDetect(function (iter) { Array.from(iter); }), 'Array', {
  // 22.1.2.1 Array.from(arrayLike, mapfn = undefined, thisArg = undefined)
  from: function from(arrayLike /* , mapfn = undefined, thisArg = undefined */) {
    var O = _toObject(arrayLike);
    var C = typeof this == 'function' ? this : Array;
    var aLen = arguments.length;
    var mapfn = aLen > 1 ? arguments[1] : undefined;
    var mapping = mapfn !== undefined;
    var index = 0;
    var iterFn = core_getIteratorMethod(O);
    var length, result, step, iterator;
    if (mapping) mapfn = _ctx(mapfn, aLen > 2 ? arguments[2] : undefined, 2);
    // if object isn't iterable or it's array with default iterator - use simple case
    if (iterFn != undefined && !(C == Array && _isArrayIter(iterFn))) {
      for (iterator = iterFn.call(O), result = new C(); !(step = iterator.next()).done; index++) {
        _createProperty(result, index, mapping ? _iterCall(iterator, mapfn, [step.value, index], true) : step.value);
      }
    } else {
      length = _toLength(O.length);
      for (result = new C(length); length > index; index++) {
        _createProperty(result, index, mapping ? mapfn(O[index], index) : O[index]);
      }
    }
    result.length = index;
    return result;
  }
});

var GPU = require$$0__default['default'].GPU,
    alias = require$$0__default['default'].alias,
    gpuUtils = require$$0__default['default'].utils;
var release$e = kernel.release;

function weightedSumSigmoid(weights, biases, inputs) {
  var sum = biases[this.thread.x];

  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  } // sigmoid


  return 1 / (1 + Math.exp(-sum));
}

function weightedSumRelu(weights, biases, inputs) {
  var sum = biases[this.thread.x];

  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  } // relu


  return sum < 0 ? 0 : sum;
}

function weightedSumLeakyRelu(weights, biases, inputs) {
  var sum = biases[this.thread.x];

  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  } // leaky relu


  return sum < 0 ? 0 : 0.01 * sum;
}

function weightedSumTanh(weights, biases, inputs) {
  var sum = biases[this.thread.x];

  for (var k = 0; k < this.constants.size; k++) {
    sum += weights[this.thread.x][k] * inputs[k];
  } // tanh


  return Math.tanh(sum);
}

function calcErrorOutput(output, targets) {
  return targets[this.thread.x] - output;
}

function calcDeltasSigmoid(error, output) {
  // sigmoid derivative
  return error * output * (1 - output);
}

function calcDeltasRelu(error, output) {
  // relu derivative
  return output > 0 ? error : 0;
}

function calcDeltasLeakyRelu(error, output) {
  // leaky relu derivative
  return output > 0 ? error : 0.01 * error;
}

function calcDeltasTanh(error, output) {
  // tanh derivative
  return (1 - output * output) * error;
}

function calcError(nextWeights, nextDeltas) {
  var error = 0;

  for (var k = 0; k < this.constants.size; k++) {
    error += nextDeltas[k] * nextWeights[k][this.thread.x];
  }

  return error;
}

function calcChanges(previousChanges, deltas, previousOutputs) {
  return this.constants.learningRate * deltas[this.thread.y] * previousOutputs[this.thread.x] + this.constants.momentum * previousChanges[this.thread.y][this.thread.x];
}

function addWeights(change, weights) {
  return change + weights[this.thread.y][this.thread.x];
}

function addBiases(biases, deltas) {
  return biases[this.thread.x] + deltas[this.thread.x] * this.constants.learningRate;
} // mean squared error, reimplemented for GPU


function mse$1(errors) {
  var sum = 0;

  for (var i = 0; i < this.constants.size; i++) {
    sum += Math.pow(errors[i], 2);
  }

  return sum / this.constants.size;
}
/**
 *
 * @param {object} options
 * @constructor
 */


var NeuralNetworkGPU = /*#__PURE__*/function (_NeuralNetwork) {
  _inherits(NeuralNetworkGPU, _NeuralNetwork);

  var _super = _createSuper(NeuralNetworkGPU);

  function NeuralNetworkGPU() {
    var _this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, NeuralNetworkGPU);

    _this = _super.call(this, options);
    _this.forwardPropagate = [];
    _this.backwardPropagate = [];
    _this.changesPropagate = [];
    _this.biasesPropagate = [];
    _this.errorCheckInterval = 100;
    _this.gpu = new GPU({
      mode: options.mode
    });
    return _this;
  }
  /**
   *
   */


  _createClass(NeuralNetworkGPU, [{
    key: "initialize",
    value: function initialize() {
      _get(_getPrototypeOf(NeuralNetworkGPU.prototype), "initialize", this).call(this);

      this.buildRunInput();
      this.buildCalculateDeltas();
      this.buildGetChanges();
      this.buildChangeBiases();
      this.buildGetMSE();
    }
  }, {
    key: "setActivation",
    value: function setActivation() {}
    /**
     *
     * @param value
     * @param logErrorRate
     */

  }, {
    key: "trainPattern",
    value: function trainPattern(value, logErrorRate) {
      // forward propagate
      this.runInput(value.input); // back propagate

      this.calculateDeltas(value.output);
      this.adjustWeights();

      if (logErrorRate) {
        return this.getMSE(this.errors[this.outputLayer]);
      }

      return null;
    }
  }, {
    key: "calculateTrainingError",
    value: function calculateTrainingError(data) {
      var sum = new Float32Array([0]);

      for (var i = 0; i < data.length; ++i) {
        var prevSum = sum;
        var error = this.trainPattern(data[i], true);
        sum = this._addMSE(sum, error);
        release$e(error);
        release$e(prevSum);
      }

      var result = this._divideMSESum(data.length, sum)[0];

      release$e(sum);
      return result;
    }
  }, {
    key: "adjustWeights",
    value: function adjustWeights() {
      this.getChanges();
      this.changeBiases();
    }
  }, {
    key: "buildRunInput",
    value: function buildRunInput() {
      var weightedSum = null;

      switch (this.activation) {
        case 'sigmoid':
          weightedSum = weightedSumSigmoid;
          break;

        case 'relu':
          weightedSum = weightedSumRelu;
          break;

        case 'leaky-relu':
          weightedSum = weightedSumLeakyRelu;
          break;

        case 'tanh':
          weightedSum = weightedSumTanh;
          break;

        default:
          throw new Error("Unknown activation ".concat(this.activation, ". Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'"));
      }

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.forwardPropagate[layer] = this.gpu.createKernel(weightedSum, {
          output: [this.sizes[layer]],
          pipeline: true,
          constants: {
            size: this.sizes[layer - 1]
          },
          immutable: true
        });
      }

      this.texturizeInputData = this.gpu.createKernel(function (value) {
        return value[this.thread.x];
      }, {
        output: [this.sizes[1]],
        pipeline: true,
        immutable: true
      });
    }
    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: "runInput",
    value: function runInput(input) {
      var output;
      this.outputs[0] = input;

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        release$e(this.outputs[layer]);
        this.outputs[layer] = this.forwardPropagate[layer](this.weights[layer], this.biases[layer], input);
        output = input = this.outputs[layer];
      }

      return output;
    }
  }, {
    key: "buildCalculateDeltas",
    value: function buildCalculateDeltas() {
      var calcDeltas = null;

      switch (this.activation) {
        case 'sigmoid':
          calcDeltas = calcDeltasSigmoid;
          break;

        case 'relu':
          calcDeltas = calcDeltasRelu;
          break;

        case 'leaky-relu':
          calcDeltas = calcDeltasLeakyRelu;
          break;

        case 'tanh':
          calcDeltas = calcDeltasTanh;
          break;

        default:
          throw new Error("Unknown activation ".concat(this.activation, ". Available activations are: 'sigmoid', 'relu', 'leaky-relu', 'tanh'"));
      }

      calcDeltas = alias(gpuUtils.getMinifySafeName(function () {
        return calcDeltas;
      }), calcDeltas);
      this.gpu.addFunction(calcDeltas);

      for (var layer = this.outputLayer; layer > 0; layer--) {
        if (layer === this.outputLayer) {
          this.backwardPropagate[this.outputLayer] = this.gpu.createKernelMap({
            error: calcErrorOutput
          }, function (outputs, targets) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcErrorOutput(output, targets), output);
          }, {
            output: [this.sizes[this.outputLayer]],
            pipeline: true,
            immutable: true
          });
        } else {
          this.backwardPropagate[layer] = this.gpu.createKernelMap({
            error: calcError
          }, function (nextWeights, outputs, nextDeltas) {
            var output = outputs[this.thread.x];
            return calcDeltas(calcError(nextWeights, nextDeltas), output);
          }, {
            output: [this.sizes[layer]],
            pipeline: true,
            constants: {
              size: this.deltas[layer + 1].length
            },
            immutable: true
          });
        }
      }
    }
  }, {
    key: "calculateDeltas",
    value: function calculateDeltas(target) {
      for (var layer = this.outputLayer; layer > 0; layer--) {
        var output = void 0;
        release$e(this.deltas[layer]);
        release$e(this.errors[layer]);

        if (layer === this.outputLayer) {
          output = this.backwardPropagate[layer](this.outputs[layer], target);
        } else {
          output = this.backwardPropagate[layer](this.weights[layer + 1], this.outputs[layer], this.deltas[layer + 1]);
        }

        this.deltas[layer] = output.result;
        this.errors[layer] = output.error;
      }
    }
  }, {
    key: "buildGetChanges",
    value: function buildGetChanges() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.changesPropagate[layer] = this.gpu.createKernelMap({
          weights: addWeights,
          changes: calcChanges
        }, function (previousOutputs, deltas, weights, changes) {
          var change = calcChanges(changes, deltas, previousOutputs);
          return addWeights(change, weights);
        }, {
          output: [this.sizes[layer - 1], this.sizes[layer]],
          pipeline: true,
          constants: {
            size: this.outputs[layer - 1].length,
            learningRate: this.trainOpts.learningRate,
            momentum: this.trainOpts.momentum
          },
          immutable: true
        });
      }
    }
  }, {
    key: "getChanges",
    value: function getChanges() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var weights = this.weights[layer];
        var changes = this.changes[layer];
        var output = this.changesPropagate[layer](this.outputs[layer - 1], this.deltas[layer], weights, changes);
        release$e(weights);
        release$e(changes);
        this.weights[layer] = output.weights;
        this.changes[layer] = output.changes;
        release$e(output.result);
      }
    }
  }, {
    key: "buildChangeBiases",
    value: function buildChangeBiases() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        this.biasesPropagate[layer] = this.gpu.createKernel(addBiases, {
          output: [this.sizes[layer]],
          pipeline: true,
          constants: {
            learningRate: this.trainOpts.learningRate
          },
          immutable: true
        });
      }
    }
  }, {
    key: "changeBiases",
    value: function changeBiases() {
      for (var layer = 1; layer <= this.outputLayer; layer++) {
        var biases = this.biases[layer];
        this.biases[layer] = this.biasesPropagate[layer](biases, this.deltas[layer]);
        release$e(biases);
      }
    }
  }, {
    key: "buildGetMSE",
    value: function buildGetMSE() {
      this.getMSE = this.gpu.createKernel(mse$1, {
        output: [1],
        constants: {
          size: this.sizes[this.outputLayer]
        },
        pipeline: true,
        immutable: true
      });
      this._addMSE = this.gpu.createKernel(function (value1, value2) {
        return value1[0] + value2[0];
      }, {
        output: [1],
        pipeline: true,
        immutable: true
      });
      this._divideMSESum = this.gpu.createKernel(function (length, mseSum) {
        var value = mseSum[0];

        if (value > 0) {
          return value / length;
        }

        return 0;
      }, {
        output: [1]
      });
    }
    /**
     *
     * @param input
     * @returns {*}
     */

  }, {
    key: "run",
    value: function run(input) {
      if (!this.isRunnable) return null;

      if (this.inputLookup) {
        input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
      }

      var outputTextures = this.runInput(input);
      var output = outputTextures.toArray ? outputTextures.toArray() : outputTextures;

      if (this.outputLookup) {
        output = lookup.toObject(this.outputLookup, output);
      }

      return output;
    }
    /**
     *
     * @param data
     * @param options
     * @protected
     * @return { data, status, endTime }
     */

  }, {
    key: "prepTraining",
    value: function prepTraining(data, options) {
      var _this2 = this;

      this.updateTrainingOptions(options);
      data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;
      var status = {
        error: 1,
        iterations: 0
      };
      this.verifyIsInitialized(data);
      var texturizeOutputData = this.gpu.createKernel(function (value) {
        return value[this.thread.x];
      }, {
        output: [data[0].output.length],
        pipeline: true,
        immutable: true
      });
      return {
        data: data.map(function (set) {
          return {
            input: _this2.texturizeInputData(set.input),
            output: texturizeOutputData(set.output)
          };
        }),
        status: status,
        endTime: endTime
      };
    }
  }, {
    key: "toFunction",
    value: function toFunction() {
      throw new Error("".concat(this.constructor.name, "-toFunction is not yet implemented"));
    }
  }, {
    key: "toJSON",
    value: function toJSON() {
      var _this3 = this;

      if (!this.weights[1].toArray) {
        // in fallback mode
        return _get(_getPrototypeOf(NeuralNetworkGPU.prototype), "toJSON", this).call(this);
      } // in GPU mode


      var weights = [];
      var biases = [];

      for (var layer = 1; layer <= this.outputLayer; layer++) {
        weights[layer] = Array.from(this.weights[layer].toArray());
        biases[layer] = Array.from(this.biases[layer].toArray());
      } // pseudo lo-fi decorator


      return neuralNetwork.prototype.toJSON.call({
        activation: this.activation,
        inputLookup: this.inputLookup,
        outputLookup: this.outputLookup,
        outputLayer: this.outputLayer,
        sizes: this.sizes,
        getTrainOptsJSON: function getTrainOptsJSON() {
          return _this3.getTrainOptsJSON();
        },
        weights: weights,
        biases: biases
      });
    }
  }]);

  return NeuralNetworkGPU;
}(neuralNetwork);

var neuralNetworkGpu = NeuralNetworkGPU;

var Internal$2 = types.Internal; // const zeros2D = require('../utilities/zeros-2d');

var release$f = kernel.release;

var RecurrentConnection = /*#__PURE__*/function (_Internal) {
  _inherits(RecurrentConnection, _Internal);

  var _super = _createSuper(RecurrentConnection);

  function RecurrentConnection() {
    _classCallCheck(this, RecurrentConnection);

    return _super.apply(this, arguments);
  }

  _createClass(RecurrentConnection, [{
    key: "setLayer",
    value: function setLayer(layer) {
      this.layer = layer;
    }
  }, {
    key: "predict",
    value: function predict() {// throw new Error(`${this.constructor.name}-predict is not yet implemented`)
    }
  }, {
    key: "compare",
    value: function compare() {// throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: "learn",
    value: function learn() {
      throw new Error('no longer using');
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {// throw new Error(
      //   `${this.constructor.name}-setupKernels is not yet implemented`
      // )
    }
  }, {
    key: "reuseKernels",
    value: function reuseKernels() {// throw new Error(
      //   `${this.constructor.name}-reuseKernels is not yet implemented`
      // )
    }
  }, {
    key: "width",
    get: function get() {
      return this.layer.width;
    },
    set: function set(value) {
      throw new Error("".concat(this.constructor.name, "-width is not yet implemented"));
    }
  }, {
    key: "height",
    get: function get() {
      return this.layer.height;
    },
    set: function set(value) {
      throw new Error("".concat(this.constructor.name, "-height is not yet implemented"));
    }
  }, {
    key: "deltas",
    get: function get() {
      return this.layer.deltas;
    },
    set: function set(deltas) {
      release$f(this.layer.deltas);
      this.layer.deltas = deltas;
    }
  }, {
    key: "weights",
    get: function get() {
      return this.layer.weights;
    },
    set: function set(weights) {
      release$f(this.layer.weights);
      this.layer.weights = weights;
    }
  }]);

  return RecurrentConnection;
}(Internal$2);

var recurrentConnection = {
  RecurrentConnection: RecurrentConnection
};

var Internal$3 = types.Internal;
var BaseLayer$3 = baseLayer.BaseLayer;
var release$g = kernel.release; // const { zeros2D } = require('../utilities/zeros-2d');

var RecurrentInput = /*#__PURE__*/function (_Internal) {
  _inherits(RecurrentInput, _Internal);

  var _super = _createSuper(RecurrentInput);

  function RecurrentInput(recurrentInput) {
    var _this;

    _classCallCheck(this, RecurrentInput);

    _this = _super.call(this);
    _this.recurrentInput = recurrentInput;

    _this.validate();

    return _this;
  }

  _createClass(RecurrentInput, [{
    key: "validate",
    value: function validate() {
      BaseLayer$3.prototype.validate.call(this);

      if (this.width !== this.recurrentInput.width) {
        throw new Error("".concat(this.constructor.name, " layer width ").concat(this.width, " and ").concat(this.recurrentInput.constructor.name, " width (").concat(this.recurrentInput.width, ") are not same"));
      }

      if (this.height !== this.recurrentInput.height) {
        throw new Error("".concat(this.constructor.name, " layer height ").concat(this.height, " and ").concat(this.recurrentInput.constructor.name, " width (").concat(this.recurrentInput.height, ") are not same"));
      }
    }
  }, {
    key: "setDimensions",
    value: function setDimensions() {
      throw new Error('should just listen');
    }
  }, {
    key: "predict",
    value: function predict() {// throw new Error(`${this.constructor.name}-predict is not yet implemented`)
    }
  }, {
    key: "compare",
    value: function compare() {// throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: "learn",
    value: function learn() {// throw new Error(`${this.constructor.name}-learn is not yet implemented`)
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {// throw new Error(
      //   `${this.constructor.name}-setupKernels is not yet implemented`
      // )
    }
  }, {
    key: "reuseKernels",
    value: function reuseKernels() {// throw new Error(
      //   `${this.constructor.name}-reuseKernels is not yet implemented`
      // )
    }
  }, {
    key: "width",
    get: function get() {
      return this.recurrentInput.width;
    }
  }, {
    key: "height",
    get: function get() {
      return this.recurrentInput.height;
    }
  }, {
    key: "deltas",
    get: function get() {
      return this.recurrentInput.deltas;
    },
    set: function set(deltas) {
      var recurrentInputDeltas = this.recurrentInput.deltas;
      this.recurrentInput.deltas = deltas;
      release$g(recurrentInputDeltas);
    }
  }, {
    key: "weights",
    get: function get() {
      return this.recurrentInput.weights;
    },
    set: function set(weights) {
      var recurrentInputWeights = this.recurrentInput.weights;
      this.recurrentInput.weights = weights;
      release$g(recurrentInputWeights);
    }
  }]);

  return RecurrentInput;
}(Internal$3);

var recurrentInput = {
  RecurrentInput: RecurrentInput
};

var zeros2D$8 = zeros2d.zeros2D;
var Internal$4 = types.Internal;
var release$h = kernel.release,
    clear$9 = kernel.clear;

var RecurrentZeros = /*#__PURE__*/function (_Internal) {
  _inherits(RecurrentZeros, _Internal);

  var _super = _createSuper(RecurrentZeros);

  function RecurrentZeros() {
    _classCallCheck(this, RecurrentZeros);

    return _super.apply(this, arguments);
  }

  _createClass(RecurrentZeros, [{
    key: "setDimensions",
    value: function setDimensions(width, height) {
      this.praxis = null;
      this.width = width;
      this.height = height;
      this.weights = zeros2D$8(width, height);
      this.deltas = zeros2D$8(width, height);
    }
  }, {
    key: "setupKernels",
    value: function setupKernels() {// throw new Error(
      //   `${this.constructor.name}-setupKernels is not yet implemented`
      // )
    }
  }, {
    key: "reuseKernels",
    value: function reuseKernels() {// throw new Error(
      //   `${this.constructor.name}-reuseKernels is not yet implemented`
      // )
    }
  }, {
    key: "predict",
    value: function predict() {// throw new Error(`${this.constructor.name}-predict is not yet implemented`)
    }
  }, {
    key: "compare",
    value: function compare() {// throw new Error(`${this.constructor.name}-compare is not yet implemented`)
    }
  }, {
    key: "learn",
    value: function learn(learningRate) {
      var oldWeights = this.weights;
      this.weights = this.praxis.run(this, learningRate); // this.deltas = deltas;

      release$h(oldWeights);
      clear$9(this.deltas);
    }
  }, {
    key: "validate",
    value: function validate() {
      throw new Error("".concat(this.constructor.name, "-validate is not yet implemented"));
    }
  }, {
    key: "reset",
    value: function reset() {
      throw new Error("".concat(this.constructor.name, "-reset is not yet implemented"));
    }
  }]);

  return RecurrentZeros;
}(Internal$4);

function recurrentZeros() {
  return new RecurrentZeros();
}

var recurrentZeros_1 = {
  RecurrentZeros: RecurrentZeros,
  recurrentZeros: recurrentZeros
};

var RecurrentConnection$1 = recurrentConnection.RecurrentConnection;
var RecurrentInput$1 = recurrentInput.RecurrentInput;
var RecurrentZeros$1 = recurrentZeros_1.RecurrentZeros;
var Model$4 = types.Model,
    InternalModel$1 = types.InternalModel; // const { Target } = require('./layer/target');

var FeedForward$1 = feedForward$1.FeedForward;
var release$i = kernel.release,
    clone$4 = kernel.clone;

var Recurrent = /*#__PURE__*/function (_FeedForward) {
  _inherits(Recurrent, _FeedForward);

  var _super = _createSuper(Recurrent);

  function Recurrent() {
    _classCallCheck(this, Recurrent);

    return _super.apply(this, arguments);
  }

  _createClass(Recurrent, [{
    key: "_connectLayers",
    value: function _connectLayers() {
      var inputLayer = this.inputLayer();

      var hiddenLayers = this._connectHiddenLayers(inputLayer);

      var outputLayer = this.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
      return {
        inputLayer: inputLayer,
        hiddenLayers: hiddenLayers,
        outputLayer: outputLayer
      };
    }
  }, {
    key: "_connectLayersDeep",
    value: function _connectLayersDeep() {
      var layers = [];
      var previousLayers = this._layerSets[this._layerSets.length - 1];
      var usedHiddenLayerOutputIndex = 0;

      function findInputLayer(inputLayer) {
        var index = previousLayers.indexOf(inputLayer);
        if (index < 0) throw new Error('unable to find layer');
        return layers[index];
      }

      function layerSettings(layer) {
        return _objectSpread2(_objectSpread2({}, layer), {}, {
          weights: null,
          deltas: null,
          errors: null,
          praxis: null
        });
      }

      for (var i = 0; i < previousLayers.length; i++) {
        var previousLayer = previousLayers[i];
        var layer = null;

        switch (Object.getPrototypeOf(previousLayer.constructor).name) {
          case 'Activation':
            {
              layer = new previousLayer.constructor(findInputLayer(previousLayer.inputLayer));
              break;
            }

          case 'EntryPoint':
            {
              layer = new previousLayer.constructor(layerSettings(previousLayer));
              break;
            }

          case 'Filter':
            {
              layer = new previousLayer.constructor(layerSettings(previousLayer.inputLayer), findInputLayer(previousLayer.inputLayer));
              break;
            }

          case 'Internal':
            {
              var previousHiddenLayerOutput = previousLayers[this._hiddenLayerOutputIndices[usedHiddenLayerOutputIndex++]];

              switch (previousLayer.constructor.name) {
                case 'RecurrentConnection':
                  throw new Error('unfinished');

                case 'RecurrentInput':
                  layer = new RecurrentInput$1(previousHiddenLayerOutput);
                  break;

                case 'RecurrentZeros':
                default:
                  layer = new RecurrentInput$1(previousHiddenLayerOutput);
                  break;
              }

              break;
            }

          case 'InternalModel':
          case 'Model':
            {
              layer = previousLayer;
              break;
            }

          case 'Modifier':
            {
              layer = new previousLayer.constructor(findInputLayer(previousLayer.inputLayer));
              break;
            }

          case 'Operator':
            {
              layer = new previousLayer.constructor(findInputLayer(previousLayer.inputLayer1), findInputLayer(previousLayer.inputLayer2), layerSettings(previousLayer));
              break;
            }

          default:
            throw new Error("hidden layer ".concat(previousLayer.constructor.name, " extends unknown hidden layer ").concat(Object.getPrototypeOf(previousLayer.constructor).name));
        }

        layers.push(layer);
      }

      return layers;
    }
  }, {
    key: "_connectHiddenLayers",
    value: function _connectHiddenLayers(previousLayer) {
      var hiddenLayers = [];

      for (var i = 0; i < this.hiddenLayers.length; i++) {
        var recurrentInput = new RecurrentZeros$1();
        var hiddenLayer = this.hiddenLayers[i](previousLayer, recurrentInput, i);
        previousLayer = hiddenLayer;
        hiddenLayers.push(hiddenLayer);
      }

      return hiddenLayers;
    }
  }, {
    key: "initialize",
    value: function initialize() {
      this.layers = [];
      this._outputConnection = new RecurrentConnection$1();

      var _this$_connectLayers = this._connectLayers(),
          inputLayer = _this$_connectLayers.inputLayer,
          hiddenLayers = _this$_connectLayers.hiddenLayers,
          outputLayer = _this$_connectLayers.outputLayer;

      var layerSet = flattenLayers([inputLayer].concat(_toConsumableArray(hiddenLayers), [outputLayer]));
      this._hiddenLayerOutputIndices = hiddenLayers.map(function (l) {
        return layerSet.indexOf(l);
      });
      this._layerSets = [layerSet];
      this._model = layerSet.filter(function (l) {
        return l instanceof Model$4 || l instanceof InternalModel$1;
      });
      this.initializeLayers(layerSet);
    }
  }, {
    key: "initializeDeep",
    value: function initializeDeep() {
      var layers = this._connectLayersDeep();

      for (var i = 0; i < layers.length; i++) {
        var layer = layers[i];
        layer.reuseKernels(this._layerSets[0][i]);
      }

      this._layerSets.push(layers);
    }
  }, {
    key: "run",
    value: function run(input) {
      while (this._layerSets.length <= input.length) {
        this.initializeDeep();
      }

      return _get(_getPrototypeOf(Recurrent.prototype), "run", this).call(this, input);
    }
  }, {
    key: "runInput",
    value: function runInput(input) {
      while (this._layerSets.length < input.length) {
        this.initializeDeep();
      }

      var max = input.length - 1; // last output will be compared with last index

      for (var x = 0; x <= max; x++) {
        var layerSet = this._layerSets[x];
        layerSet[0].predict([new Float32Array([input[x]])]);

        for (var i = 1; i < layerSet.length; i++) {
          layerSet[i].predict();
        }
      }

      var lastLayerUsed = this._layerSets[max];
      var result = lastLayerUsed[lastLayerUsed.length - 1].weights;
      this.end();
      return result;
    }
  }, {
    key: "end",
    value: function end() {
      var x = this._layerSets.length - 1;
      var lastLayerSet = this._layerSets[x];
      lastLayerSet[0].predict([new Float32Array([0])]);

      for (var i = 1; i < lastLayerSet.length; i++) {
        lastLayerSet[i].predict();
      }
    }
  }, {
    key: "transferData",
    value: function transferData(formattedData) {
      return formattedData;
    }
  }, {
    key: "_prepTraining",
    value: function _prepTraining(data, options) {
      var stats = _get(_getPrototypeOf(Recurrent.prototype), "_prepTraining", this).call(this, data, options);

      this.verifyIsInitialized(data);
      return stats;
    }
    /**
     *
     * @param data
     * @returns {Number} error
     */

  }, {
    key: "_calculateTrainingError",
    value: function _calculateTrainingError(data) {
      var sum = new Float32Array(1);

      for (var i = 0; i < data.length; ++i) {
        var prevSum = sum;

        var error = this._trainPattern(data[i], true);

        sum = this.meanSquaredError.add(sum, error);
        release$i(error);
        release$i(prevSum);
      }

      var result = this.meanSquaredError.divide(data.length, sum);
      release$i(sum);

      if (result.toArray) {
        var resultArray = result.toArray();
        return resultArray[0];
      }

      return result[0];
    }
  }, {
    key: "formatData",
    value: function formatData(data) {
      return data;
    }
  }, {
    key: "_calculateDeltas",
    value: function _calculateDeltas(target) {
      var lastLayerSet = this._layerSets[this._layerSets.length - 1]; // Iterate from the second to last layer backwards, propagating 0's

      for (var i = lastLayerSet.length - 2; i >= 0; i--) {
        lastLayerSet[i].compare();
      }

      for (var x = target.length - 2; x >= 0; x--) {
        var layerSet = this._layerSets[x];
        layerSet[layerSet.length - 1].compare(new Float32Array([target[x + 1]]));

        for (var _i = layerSet.length - 2; _i >= 0; _i--) {
          layerSet[_i].compare();
        }
      }
    }
  }, {
    key: "adjustWeights",
    value: function adjustWeights() {
      var _model = this._model;

      for (var i = 0; i < _model.length; i++) {
        _model[i].learn();
      }
    }
    /**
     * @param data
     * @private
     */

  }, {
    key: "_trainPatterns",
    value: function _trainPatterns(data) {
      for (var i = 0; i < data.length; ++i) {
        this._trainPattern(data[i], false);
      }
    }
    /**
     *
     * @param {number[]} input
     * @param {Boolean} [logErrorRate]
     */

  }, {
    key: "_trainPattern",
    value: function _trainPattern(input, logErrorRate) {
      // forward propagate
      this.runInput(input); // back propagate

      this._calculateDeltas(input);

      this.adjustWeights();

      if (logErrorRate) {
        var meanSquaredError = this.meanSquaredError;
        var error = new Float32Array(1);

        for (var i = 0, max = input.length - 1; i < max; i++) {
          var layerSet = this._layerSets[i];
          var lastLayer = layerSet[layerSet.length - 1];
          var prevError = error;
          error = meanSquaredError.addAbsolute(prevError, lastLayer.errors);
          release$i(prevError);
        }

        return clone$4(meanSquaredError.divide(input.length, error));
      }

      return null;
    }
  }], [{
    key: "structure",
    get: function get() {
      return {
        /**
         *
         * _inputLayers are a 1 dimensional array of input layers defined once
         * @type Object[]
         * @private
         */
        _inputLayers: null,

        /**
         * _hiddenLayers are a 1 dimensional array of hidden layers defined from results from settings.hiddenLayers
         * @type Object[]
         * @private
         */
        _hiddenLayers: null,

        /**
         * _hiddenLayerSets are a 2 dimensional array of hidden layers defined for each recursion
         * @type Object[][]
         * @private
         */
        _hiddenLayerSets: null,

        /**
         * a 2 dimensional array of layers defined for each recursion
         */
        _layerSets: null,
        _hiddenLayerOutputIndices: null,

        /**
         * _outputLayers are a 1 dimensional array of output layers defined once
         * @type Object[]
         * @private
         */
        _outputLayers: null,
        _outputConnection: null,
        _previousInputs: null,
        _model: null,
        _recurrentIndices: null
      };
    }
  }]);

  return Recurrent;
}(FeedForward$1);

var recurrent = {
  Recurrent: Recurrent
};

var zeros$a = zeros$1.zeros;
/**
 * A matrix
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @constructor
 */

var Matrix = /*#__PURE__*/function () {
  function Matrix(rows, columns) {
    _classCallCheck(this, Matrix);

    if (rows === undefined) return;
    if (columns === undefined) return;
    this.rows = rows;
    this.columns = columns;
    this.weights = zeros$a(rows * columns);
    this.deltas = zeros$a(rows * columns);
  }
  /**
   *
   * @param {Number} row
   * @param {Number} col
   * @returns {Float32Array|Array}
   */


  _createClass(Matrix, [{
    key: "getWeights",
    value: function getWeights(row, col) {
      // slow but careful accessor function
      // we want row-major order
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('get accessor is skewed');
      return this.weights[ix];
    }
    /**
     *
     * @param {Number} row
     * @param {Number} col
     * @param v
     * @returns {Matrix}
     */

  }, {
    key: "setWeight",
    value: function setWeight(row, col, v) {
      // slow but careful accessor function
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
      this.weights[ix] = v;
    }
    /**
     *
     * @param {Number} row
     * @param {Number} col
     * @param v
     * @returns {Matrix}
     */

  }, {
    key: "setDeltas",
    value: function setDeltas(row, col, v) {
      // slow but careful accessor function
      var ix = this.columns * row + col;
      if (ix < 0 && ix >= this.weights.length) throw new Error('set accessor is skewed');
      this.deltas[ix] = v;
    }
    /**
     *
     * @returns {{rows: *, columns: *, weights: Array}}
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      return {
        rows: this.rows,
        columns: this.columns,
        weights: this.weights.slice(0)
      };
    }
  }, {
    key: "weightsToArray",
    value: function weightsToArray() {
      var deltas = [];
      var row = 0;
      var column = 0;

      for (var i = 0; i < this.weights.length; i++) {
        if (column === 0) {
          deltas.push([]);
        }

        deltas[row].push(this.weights[i]);
        column++;

        if (column >= this.columns) {
          column = 0;
          row++;
        }
      }

      return deltas;
    }
  }, {
    key: "deltasToArray",
    value: function deltasToArray() {
      var deltas = [];
      var row = 0;
      var column = 0;

      for (var i = 0; i < this.deltas.length; i++) {
        if (column === 0) {
          deltas.push([]);
        }

        deltas[row].push(this.deltas[i]);
        column++;

        if (column >= this.columns) {
          column = 0;
          row++;
        }
      }

      return deltas;
    }
  }], [{
    key: "fromJSON",
    value: function fromJSON(json) {
      var matrix = new Matrix(json.rows, json.columns);

      for (var i = 0, max = json.rows * json.columns; i < max; i++) {
        matrix.weights[i] = json.weights[i]; // copy over weights
      }

      return matrix;
    }
    /**
     *
     * @param weightRows
     * @param [deltasRows]
     * @returns {Matrix}
     */

  }, {
    key: "fromArray",
    value: function fromArray(weightRows, deltasRows) {
      var rows = weightRows.length;
      var columns = weightRows[0].length;
      var m = new Matrix(rows, columns);
      deltasRows = deltasRows || weightRows;

      for (var rowIndex = 0; rowIndex < rows; rowIndex++) {
        var weightValues = weightRows[rowIndex];
        var deltasValues = deltasRows[rowIndex];

        for (var columnIndex = 0; columnIndex < columns; columnIndex++) {
          m.setWeight(rowIndex, columnIndex, weightValues[columnIndex]);
          m.setDeltas(rowIndex, columnIndex, deltasValues[columnIndex]);
        }
      }

      return m;
    }
  }]);

  return Matrix;
}();

var matrix = Matrix;

var randomFloat$1 = random.randomFloat;
/** return Matrix but filled with random numbers from gaussian
 * @param {Number} [rows]
 * @param {Number} [columns]
 * @param std
 * @constructor
 */

var RandomMatrix = /*#__PURE__*/function (_Matrix) {
  _inherits(RandomMatrix, _Matrix);

  var _super = _createSuper(RandomMatrix);

  function RandomMatrix(rows, columns, std) {
    var _this;

    _classCallCheck(this, RandomMatrix);

    _this = _super.call(this, rows, columns);
    _this.rows = rows;
    _this.columns = columns;
    _this.std = std;

    for (var i = 0, max = _this.weights.length; i < max; i++) {
      _this.weights[i] = randomFloat$1(-std, std);
    }

    return _this;
  }

  return RandomMatrix;
}(matrix);

var randomMatrix = RandomMatrix;

var at = _stringAt(true);

 // `AdvanceStringIndex` abstract operation
// https://tc39.github.io/ecma262/#sec-advancestringindex
var _advanceStringIndex = function (S, index, unicode) {
  return index + (unicode ? at(S, index).length : 1);
};

var builtinExec = RegExp.prototype.exec;

 // `RegExpExec` abstract operation
// https://tc39.github.io/ecma262/#sec-regexpexec
var _regexpExecAbstract = function (R, S) {
  var exec = R.exec;
  if (typeof exec === 'function') {
    var result = exec.call(R, S);
    if (typeof result !== 'object') {
      throw new TypeError('RegExp exec method returned something other than an Object or null');
    }
    return result;
  }
  if (_classof(R) !== 'RegExp') {
    throw new TypeError('RegExp#exec called on incompatible receiver');
  }
  return builtinExec.call(R, S);
};

// 21.2.5.3 get RegExp.prototype.flags

var _flags = function () {
  var that = _anObject(this);
  var result = '';
  if (that.global) result += 'g';
  if (that.ignoreCase) result += 'i';
  if (that.multiline) result += 'm';
  if (that.unicode) result += 'u';
  if (that.sticky) result += 'y';
  return result;
};

var nativeExec = RegExp.prototype.exec;
// This always refers to the native implementation, because the
// String#replace polyfill uses ./fix-regexp-well-known-symbol-logic.js,
// which loads this file before patching the method.
var nativeReplace = String.prototype.replace;

var patchedExec = nativeExec;

var LAST_INDEX = 'lastIndex';

var UPDATES_LAST_INDEX_WRONG = (function () {
  var re1 = /a/,
      re2 = /b*/g;
  nativeExec.call(re1, 'a');
  nativeExec.call(re2, 'a');
  return re1[LAST_INDEX] !== 0 || re2[LAST_INDEX] !== 0;
})();

// nonparticipating capturing group, copied from es5-shim's String#split patch.
var NPCG_INCLUDED = /()??/.exec('')[1] !== undefined;

var PATCH = UPDATES_LAST_INDEX_WRONG || NPCG_INCLUDED;

if (PATCH) {
  patchedExec = function exec(str) {
    var re = this;
    var lastIndex, reCopy, match, i;

    if (NPCG_INCLUDED) {
      reCopy = new RegExp('^' + re.source + '$(?!\\s)', _flags.call(re));
    }
    if (UPDATES_LAST_INDEX_WRONG) lastIndex = re[LAST_INDEX];

    match = nativeExec.call(re, str);

    if (UPDATES_LAST_INDEX_WRONG && match) {
      re[LAST_INDEX] = re.global ? match.index + match[0].length : lastIndex;
    }
    if (NPCG_INCLUDED && match && match.length > 1) {
      // Fix browsers whose `exec` methods don't consistently return `undefined`
      // for NPCG, like IE8. NOTE: This doesn' work for /(.?)?/
      // eslint-disable-next-line no-loop-func
      nativeReplace.call(match[0], reCopy, function () {
        for (i = 1; i < arguments.length - 2; i++) {
          if (arguments[i] === undefined) match[i] = undefined;
        }
      });
    }

    return match;
  };
}

var _regexpExec = patchedExec;

_export({
  target: 'RegExp',
  proto: true,
  forced: _regexpExec !== /./.exec
}, {
  exec: _regexpExec
});

var SPECIES$3 = _wks('species');

var REPLACE_SUPPORTS_NAMED_GROUPS = !_fails(function () {
  // #replace needs built-in support for named groups.
  // #match works fine because it just return the exec results, even if it has
  // a "grops" property.
  var re = /./;
  re.exec = function () {
    var result = [];
    result.groups = { a: '7' };
    return result;
  };
  return ''.replace(re, '$<a>') !== '7';
});

var SPLIT_WORKS_WITH_OVERWRITTEN_EXEC = (function () {
  // Chrome 51 has a buggy "split" implementation when RegExp#exec !== nativeExec
  var re = /(?:)/;
  var originalExec = re.exec;
  re.exec = function () { return originalExec.apply(this, arguments); };
  var result = 'ab'.split(re);
  return result.length === 2 && result[0] === 'a' && result[1] === 'b';
})();

var _fixReWks = function (KEY, length, exec) {
  var SYMBOL = _wks(KEY);

  var DELEGATES_TO_SYMBOL = !_fails(function () {
    // String methods call symbol-named RegEp methods
    var O = {};
    O[SYMBOL] = function () { return 7; };
    return ''[KEY](O) != 7;
  });

  var DELEGATES_TO_EXEC = DELEGATES_TO_SYMBOL ? !_fails(function () {
    // Symbol-named RegExp methods call .exec
    var execCalled = false;
    var re = /a/;
    re.exec = function () { execCalled = true; return null; };
    if (KEY === 'split') {
      // RegExp[@@split] doesn't call the regex's exec method, but first creates
      // a new one. We need to return the patched regex when creating the new one.
      re.constructor = {};
      re.constructor[SPECIES$3] = function () { return re; };
    }
    re[SYMBOL]('');
    return !execCalled;
  }) : undefined;

  if (
    !DELEGATES_TO_SYMBOL ||
    !DELEGATES_TO_EXEC ||
    (KEY === 'replace' && !REPLACE_SUPPORTS_NAMED_GROUPS) ||
    (KEY === 'split' && !SPLIT_WORKS_WITH_OVERWRITTEN_EXEC)
  ) {
    var nativeRegExpMethod = /./[SYMBOL];
    var fns = exec(
      _defined,
      SYMBOL,
      ''[KEY],
      function maybeCallNative(nativeMethod, regexp, str, arg2, forceStringMethod) {
        if (regexp.exec === _regexpExec) {
          if (DELEGATES_TO_SYMBOL && !forceStringMethod) {
            // The native String method already delegates to @@method (this
            // polyfilled function), leasing to infinite recursion.
            // We avoid it by directly calling the native @@method method.
            return { done: true, value: nativeRegExpMethod.call(regexp, str, arg2) };
          }
          return { done: true, value: nativeMethod.call(str, regexp, arg2) };
        }
        return { done: false };
      }
    );
    var strfn = fns[0];
    var rxfn = fns[1];

    _redefine(String.prototype, KEY, strfn);
    _hide(RegExp.prototype, SYMBOL, length == 2
      // 21.2.5.8 RegExp.prototype[@@replace](string, replaceValue)
      // 21.2.5.11 RegExp.prototype[@@split](string, limit)
      ? function (string, arg) { return rxfn.call(string, this, arg); }
      // 21.2.5.6 RegExp.prototype[@@match](string)
      // 21.2.5.9 RegExp.prototype[@@search](string)
      : function (string) { return rxfn.call(string, this); }
    );
  }
};

var max$2 = Math.max;
var min$2 = Math.min;
var floor$1 = Math.floor;
var SUBSTITUTION_SYMBOLS = /\$([$&`']|\d\d?|<[^>]*>)/g;
var SUBSTITUTION_SYMBOLS_NO_NAMED = /\$([$&`']|\d\d?)/g;

var maybeToString = function (it) {
  return it === undefined ? it : String(it);
};

// @@replace logic
_fixReWks('replace', 2, function (defined, REPLACE, $replace, maybeCallNative) {
  return [
    // `String.prototype.replace` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.replace
    function replace(searchValue, replaceValue) {
      var O = defined(this);
      var fn = searchValue == undefined ? undefined : searchValue[REPLACE];
      return fn !== undefined
        ? fn.call(searchValue, O, replaceValue)
        : $replace.call(String(O), searchValue, replaceValue);
    },
    // `RegExp.prototype[@@replace]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@replace
    function (regexp, replaceValue) {
      var res = maybeCallNative($replace, regexp, this, replaceValue);
      if (res.done) return res.value;

      var rx = _anObject(regexp);
      var S = String(this);
      var functionalReplace = typeof replaceValue === 'function';
      if (!functionalReplace) replaceValue = String(replaceValue);
      var global = rx.global;
      if (global) {
        var fullUnicode = rx.unicode;
        rx.lastIndex = 0;
      }
      var results = [];
      while (true) {
        var result = _regexpExecAbstract(rx, S);
        if (result === null) break;
        results.push(result);
        if (!global) break;
        var matchStr = String(result[0]);
        if (matchStr === '') rx.lastIndex = _advanceStringIndex(S, _toLength(rx.lastIndex), fullUnicode);
      }
      var accumulatedResult = '';
      var nextSourcePosition = 0;
      for (var i = 0; i < results.length; i++) {
        result = results[i];
        var matched = String(result[0]);
        var position = max$2(min$2(_toInteger(result.index), S.length), 0);
        var captures = [];
        // NOTE: This is equivalent to
        //   captures = result.slice(1).map(maybeToString)
        // but for some reason `nativeSlice.call(result, 1, result.length)` (called in
        // the slice polyfill when slicing native arrays) "doesn't work" in safari 9 and
        // causes a crash (https://pastebin.com/N21QzeQA) when trying to debug it.
        for (var j = 1; j < result.length; j++) captures.push(maybeToString(result[j]));
        var namedCaptures = result.groups;
        if (functionalReplace) {
          var replacerArgs = [matched].concat(captures, position, S);
          if (namedCaptures !== undefined) replacerArgs.push(namedCaptures);
          var replacement = String(replaceValue.apply(undefined, replacerArgs));
        } else {
          replacement = getSubstitution(matched, S, position, captures, namedCaptures, replaceValue);
        }
        if (position >= nextSourcePosition) {
          accumulatedResult += S.slice(nextSourcePosition, position) + replacement;
          nextSourcePosition = position + matched.length;
        }
      }
      return accumulatedResult + S.slice(nextSourcePosition);
    }
  ];

    // https://tc39.github.io/ecma262/#sec-getsubstitution
  function getSubstitution(matched, str, position, captures, namedCaptures, replacement) {
    var tailPos = position + matched.length;
    var m = captures.length;
    var symbols = SUBSTITUTION_SYMBOLS_NO_NAMED;
    if (namedCaptures !== undefined) {
      namedCaptures = _toObject(namedCaptures);
      symbols = SUBSTITUTION_SYMBOLS;
    }
    return $replace.call(replacement, symbols, function (match, ch) {
      var capture;
      switch (ch.charAt(0)) {
        case '$': return '$';
        case '&': return matched;
        case '`': return str.slice(0, position);
        case "'": return str.slice(tailPos);
        case '<':
          capture = namedCaptures[ch.slice(1, -1)];
          break;
        default: // \d\d?
          var n = +ch;
          if (n === 0) return match;
          if (n > m) {
            var f = floor$1(n / 10);
            if (f === 0) return match;
            if (f <= m) return captures[f - 1] === undefined ? ch.charAt(1) : captures[f - 1] + ch.charAt(1);
            return match;
          }
          capture = captures[n - 1];
      }
      return capture === undefined ? '' : capture;
    });
  }
});

// 21.2.5.3 get RegExp.prototype.flags()
if (_descriptors && /./g.flags != 'g') _objectDp.f(RegExp.prototype, 'flags', {
  configurable: true,
  get: _flags
});

var TO_STRING = 'toString';
var $toString = /./[TO_STRING];

var define = function (fn) {
  _redefine(RegExp.prototype, TO_STRING, fn, true);
};

// 21.2.5.14 RegExp.prototype.toString()
if (_fails(function () { return $toString.call({ source: 'a', flags: 'b' }) != '/a/b'; })) {
  define(function toString() {
    var R = _anObject(this);
    return '/'.concat(R.source, '/',
      'flags' in R ? R.flags : !_descriptors && R instanceof RegExp ? _flags.call(R) : undefined);
  });
// FF44- RegExp#toString has a wrong name
} else if ($toString.name != TO_STRING) {
  define(function toString() {
    return $toString.call(this);
  });
}

// 7.2.8 IsRegExp(argument)


var MATCH = _wks('match');
var _isRegexp = function (it) {
  var isRegExp;
  return _isObject(it) && ((isRegExp = it[MATCH]) !== undefined ? !!isRegExp : _cof(it) == 'RegExp');
};

var $min = Math.min;
var $push = [].push;
var $SPLIT = 'split';
var LENGTH = 'length';
var LAST_INDEX$1 = 'lastIndex';
var MAX_UINT32 = 0xffffffff;

// babel-minify transpiles RegExp('x', 'y') -> /x/y and it causes SyntaxError
var SUPPORTS_Y = !_fails(function () { RegExp(MAX_UINT32, 'y'); });

// @@split logic
_fixReWks('split', 2, function (defined, SPLIT, $split, maybeCallNative) {
  var internalSplit;
  if (
    'abbc'[$SPLIT](/(b)*/)[1] == 'c' ||
    'test'[$SPLIT](/(?:)/, -1)[LENGTH] != 4 ||
    'ab'[$SPLIT](/(?:ab)*/)[LENGTH] != 2 ||
    '.'[$SPLIT](/(.?)(.?)/)[LENGTH] != 4 ||
    '.'[$SPLIT](/()()/)[LENGTH] > 1 ||
    ''[$SPLIT](/.?/)[LENGTH]
  ) {
    // based on es5-shim implementation, need to rework it
    internalSplit = function (separator, limit) {
      var string = String(this);
      if (separator === undefined && limit === 0) return [];
      // If `separator` is not a regex, use native split
      if (!_isRegexp(separator)) return $split.call(string, separator, limit);
      var output = [];
      var flags = (separator.ignoreCase ? 'i' : '') +
                  (separator.multiline ? 'm' : '') +
                  (separator.unicode ? 'u' : '') +
                  (separator.sticky ? 'y' : '');
      var lastLastIndex = 0;
      var splitLimit = limit === undefined ? MAX_UINT32 : limit >>> 0;
      // Make `global` and avoid `lastIndex` issues by working with a copy
      var separatorCopy = new RegExp(separator.source, flags + 'g');
      var match, lastIndex, lastLength;
      while (match = _regexpExec.call(separatorCopy, string)) {
        lastIndex = separatorCopy[LAST_INDEX$1];
        if (lastIndex > lastLastIndex) {
          output.push(string.slice(lastLastIndex, match.index));
          if (match[LENGTH] > 1 && match.index < string[LENGTH]) $push.apply(output, match.slice(1));
          lastLength = match[0][LENGTH];
          lastLastIndex = lastIndex;
          if (output[LENGTH] >= splitLimit) break;
        }
        if (separatorCopy[LAST_INDEX$1] === match.index) separatorCopy[LAST_INDEX$1]++; // Avoid an infinite loop
      }
      if (lastLastIndex === string[LENGTH]) {
        if (lastLength || !separatorCopy.test('')) output.push('');
      } else output.push(string.slice(lastLastIndex));
      return output[LENGTH] > splitLimit ? output.slice(0, splitLimit) : output;
    };
  // Chakra, V8
  } else if ('0'[$SPLIT](undefined, 0)[LENGTH]) {
    internalSplit = function (separator, limit) {
      return separator === undefined && limit === 0 ? [] : $split.call(this, separator, limit);
    };
  } else {
    internalSplit = $split;
  }

  return [
    // `String.prototype.split` method
    // https://tc39.github.io/ecma262/#sec-string.prototype.split
    function split(separator, limit) {
      var O = defined(this);
      var splitter = separator == undefined ? undefined : separator[SPLIT];
      return splitter !== undefined
        ? splitter.call(separator, O, limit)
        : internalSplit.call(String(O), separator, limit);
    },
    // `RegExp.prototype[@@split]` method
    // https://tc39.github.io/ecma262/#sec-regexp.prototype-@@split
    //
    // NOTE: This cannot be properly polyfilled in engines that don't support
    // the 'y' flag.
    function (regexp, limit) {
      var res = maybeCallNative(internalSplit, regexp, this, limit, internalSplit !== $split);
      if (res.done) return res.value;

      var rx = _anObject(regexp);
      var S = String(this);
      var C = _speciesConstructor(rx, RegExp);

      var unicodeMatching = rx.unicode;
      var flags = (rx.ignoreCase ? 'i' : '') +
                  (rx.multiline ? 'm' : '') +
                  (rx.unicode ? 'u' : '') +
                  (SUPPORTS_Y ? 'y' : 'g');

      // ^(? + rx + ) is needed, in combination with some S slicing, to
      // simulate the 'y' flag.
      var splitter = new C(SUPPORTS_Y ? rx : '^(?:' + rx.source + ')', flags);
      var lim = limit === undefined ? MAX_UINT32 : limit >>> 0;
      if (lim === 0) return [];
      if (S.length === 0) return _regexpExecAbstract(splitter, S) === null ? [S] : [];
      var p = 0;
      var q = 0;
      var A = [];
      while (q < S.length) {
        splitter.lastIndex = SUPPORTS_Y ? q : 0;
        var z = _regexpExecAbstract(splitter, SUPPORTS_Y ? S : S.slice(q));
        var e;
        if (
          z === null ||
          (e = $min(_toLength(splitter.lastIndex + (SUPPORTS_Y ? 0 : q)), S.length)) === p
        ) {
          q = _advanceStringIndex(S, q, unicodeMatching);
        } else {
          A.push(S.slice(p, q));
          if (A.length === lim) return A;
          for (var i = 1; i <= z.length - 1; i++) {
            A.push(z[i]);
            if (A.length === lim) return A;
          }
          q = p = e;
        }
      }
      A.push(S.slice(p));
      return A;
    }
  ];
});

// 20.2.2.22 Math.log2(x)


_export(_export.S, 'Math', {
  log2: function log2(x) {
    return Math.log(x) / Math.LN2;
  }
});

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
var cloneNegative = function cloneNegative(product, left) {
  product.rows = parseInt(left.rows, 10);
  product.columns = parseInt(left.columns, 10);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);

  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = -left.weights[i];
    product.deltas[i] = 0;
  }
};

/**
 * add {left} and {right} matrix weights into {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var add$8 = function add(product, left, right) {
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = left.weights[i] + right.weights[i];
    product.deltas[i] = 0;
  }
};

/**
 * adds {from} deltas to {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var addB = function addB(product, left, right) {
  for (var i = 0; i < product.deltas.length; i++) {
    left.deltas[i] = product.deltas[i];
    right.deltas[i] = product.deltas[i];
  }
};

/**
 * makes matrix weights and deltas all ones
 * @param {Matrix} product
 */
var allOnes = function allOnes(product) {
  for (var i = 0; i < product.weights.length; i++) {
    product.weights[i] = 1;
    product.deltas[i] = 0;
  }
};

/**
 * multiply {left} and {right} matrix weights to {into}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var multiply$8 = function multiply(product, left, right) {
  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns; // loop over rows of left

  for (var leftRow = 0; leftRow < leftRows; leftRow++) {
    var leftRowBase = leftColumns * leftRow;
    var rightRowBase = rightColumns * leftRow; // loop over cols of right

    for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {
      // dot product loop
      var dot = 0; // loop over columns of left

      for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        var rightColumnBase = rightColumns * leftColumn;
        var leftIndex = leftRowBase + leftColumn;
        var rightIndex = rightColumnBase + rightColumn;
        dot += left.weights[leftIndex] * right.weights[rightIndex];
        left.deltas[leftIndex] = 0;
        right.deltas[rightIndex] = 0;
      }

      product.weights[rightRowBase + rightColumn] = dot;
    }
  }
};

/**
 * multiplies {from} deltas to {left} and {right}
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var multiplyB = function multiplyB(product, left, right) {
  var leftRows = left.rows;
  var leftColumns = left.columns;
  var rightColumns = right.columns; // loop over rows of left

  for (var leftRowRoot = 0; leftRowRoot < leftRows; leftRowRoot++) {
    var leftRowBase = leftColumns * leftRowRoot;
    var rightRowBase = rightColumns * leftRowRoot; // loop over cols of right

    for (var rightColumn = 0; rightColumn < rightColumns; rightColumn++) {
      // loop over columns of left
      for (var leftColumn = 0; leftColumn < leftColumns; leftColumn++) {
        var rightColumnBase = rightColumns * leftColumn;
        var leftRow = leftRowBase + leftColumn;
        var rightRow = rightColumnBase + rightColumn;
        var backPropagateValue = product.deltas[rightRowBase + rightColumn];
        left.deltas[leftRow] += right.weights[rightRow] * backPropagateValue;
        right.deltas[rightRow] += left.weights[leftRow] * backPropagateValue;
      }
    }
  }
};

/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var multiplyElement$3 = function multiplyElement(product, left, right) {
  var weights = left.weights;

  for (var i = 0; i < weights.length; i++) {
    product.weights[i] = left.weights[i] * right.weights[i];
    product.deltas[i] = 0;
  }
};

/**
 * multiplies {left} and {right} weight by {from} deltas into {left} and {right} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Matrix} right
 */
var multiplyElementB = function multiplyElementB(product, left, right) {
  for (var i = 0; i < left.weights.length; i++) {
    left.deltas[i] = right.weights[i] * product.deltas[i];
    right.deltas[i] = left.weights[i] * product.deltas[i];
  }
};

/**
 *
 * relu {m} weights to {into} weights
 * @param {Matrix} product
 * @param {Matrix} left
 */
var relu$3 = function relu(product, left) {
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.max(0, left.weights[i]); // relu

    product.deltas[i] = 0;
  }
};

/**
 * adds {from} deltas to {m} deltas when {m} weights are above other a threshold of 0
 * @param {Matrix} product
 * @param {Matrix} left
 */
var reluB = function reluB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    left.deltas[i] = left.weights[i] > 0 ? product.deltas[i] : 0;
  }
};

/**
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowPluckIndex
 */
var rowPluck = function rowPluck(product, left, rowPluckIndex) {
  var columns = left.columns;
  var rowBase = columns * rowPluckIndex;

  for (var column = 0; column < columns; column++) {
    product.weights[column] = left.weights[rowBase + column];
    product.deltas[column] = 0;
  }
};

/**
 * adds {from} deltas into {m} deltas
 * @param {Matrix} product
 * @param {Matrix} left
 * @param {Number} rowIndex
 */
var rowPluckB = function rowPluckB(product, left, rowIndex) {
  var columns = left.columns;
  var rowBase = columns * rowIndex;

  for (var column = 0; column < columns; column++) {
    left.deltas[rowBase + column] = product.deltas[column];
  }
};

/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
var sigmoid$6 = function sigmoid(product, left) {
  // sigmoid nonlinearity
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = 1 / (1 + Math.exp(-left.weights[i]));
    product.deltas[i] = 0;
  }
}; // function sig(x) {

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
var sigmoidB = function sigmoidB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    var mwi = product.weights[i];
    left.deltas[i] = mwi * (1 - mwi) * product.deltas[i];
  }
};

/**
 * @param {Matrix} product
 * @param {Matrix} left
 */
var tanh$4 = function tanh(product, left) {
  // tanh nonlinearity
  for (var i = 0; i < left.weights.length; i++) {
    product.weights[i] = Math.tanh(left.weights[i]);
    product.deltas[i] = 0;
  }
};

/**
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
var tanhB = function tanhB(product, left) {
  for (var i = 0; i < product.deltas.length; i++) {
    // grad for z = tanh(x) is (1 - z^2)
    var mwi = product.weights[i];
    left.deltas[i] = (1 - mwi * mwi) * product.deltas[i];
  }
};

/**
 *
 * @param {Matrix} m
 * @returns {Matrix}
 */

var softmax = function softmax(m) {
  var result = new matrix(m.rows, m.columns); // probability volume

  var maxVal = -999999;

  for (var i = 0; i < m.weights.length; i++) {
    if (m.weights[i] > maxVal) {
      maxVal = m.weights[i];
    }
  }

  var s = 0;

  for (var _i = 0; _i < m.weights.length; _i++) {
    result.weights[_i] = Math.exp(m.weights[_i] - maxVal);
    s += result.weights[_i];
  }

  for (var _i2 = 0; _i2 < m.weights.length; _i2++) {
    result.weights[_i2] /= s;
  } // no backward pass here needed
  // since we will use the computed probabilities outside
  // to set gradients directly on m


  return result;
};

// const copy = require('./copy');

var Equation = /*#__PURE__*/function () {
  function Equation() {
    _classCallCheck(this, Equation);

    this.inputRow = 0;
    this.inputValue = null;
    this.states = [];
  }
  /**
   * connects two matrices together by add
   * @param {Matrix} left
   * @param {Matrix} right
   * @returns {Matrix}
   */


  _createClass(Equation, [{
    key: "add",
    value: function add(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }

      var product = new matrix(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: add$8,
        backpropagationFn: addB
      });
      return product;
    }
    /**
     *
     * @param {Number} rows
     * @param {Number} columns
     * @returns {Matrix}
     */

  }, {
    key: "allOnes",
    value: function allOnes$1(rows, columns) {
      var product = new matrix(rows, columns);
      this.states.push({
        left: product,
        product: product,
        forwardFn: allOnes
      });
      return product;
    }
    /**
     *
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: "cloneNegative",
    value: function cloneNegative$1(m) {
      var product = new matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: cloneNegative
      });
      return product;
    }
    /**
     * connects two matrices together by subtract
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: "subtract",
    value: function subtract(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }

      return this.add(this.add(this.allOnes(left.rows, left.columns), this.cloneNegative(left)), right);
    }
    /**
     * connects two matrices together by multiply
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: "multiply",
    value: function multiply(left, right) {
      if (left.columns !== right.rows) {
        throw new Error('misaligned matrices');
      }

      var product = new matrix(left.rows, right.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: multiply$8,
        backpropagationFn: multiplyB
      });
      return product;
    }
    /**
     * connects two matrices together by multiplyElement
     * @param {Matrix} left
     * @param {Matrix} right
     * @returns {Matrix}
     */

  }, {
    key: "multiplyElement",
    value: function multiplyElement(left, right) {
      if (left.weights.length !== right.weights.length) {
        throw new Error('misaligned matrices');
      }

      var product = new matrix(left.rows, left.columns);
      this.states.push({
        left: left,
        right: right,
        product: product,
        forwardFn: multiplyElement$3,
        backpropagationFn: multiplyElementB
      });
      return product;
    }
    /**
     * connects a matrix to relu
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: "relu",
    value: function relu(m) {
      var product = new matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: relu$3,
        backpropagationFn: reluB
      });
      return product;
    }
    /**
     * copy a matrix
     * @param {Matrix} input
     * @returns {Matrix}
     */

  }, {
    key: "input",
    value: function input(_input) {
      var _this = this;

      this.states.push({
        product: _input,
        forwardFn: function forwardFn(product) {
          product.weights = _input.weights = _this.inputValue;
        }
      });
      return _input;
    }
    /**
     * connects a matrix via a row
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: "inputMatrixToRow",
    value: function inputMatrixToRow(m) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var self = this;
      var product = new matrix(m.columns, 1);
      this.states.push({
        left: m,

        get right() {
          return self.inputRow;
        },

        product: product,
        forwardFn: rowPluck,
        backpropagationFn: rowPluckB
      });
      return product;
    }
    /**
     * connects a matrix to sigmoid
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: "sigmoid",
    value: function sigmoid(m) {
      var product = new matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: sigmoid$6,
        backpropagationFn: sigmoidB
      });
      return product;
    }
    /**
     * connects a matrix to tanh
     * @param {Matrix} m
     * @returns {Matrix}
     */

  }, {
    key: "tanh",
    value: function tanh(m) {
      var product = new matrix(m.rows, m.columns);
      this.states.push({
        left: m,
        product: product,
        forwardFn: tanh$4,
        backpropagationFn: tanhB
      });
      return product;
    }
    /**
     *
     * @param m
     * @returns {Matrix}
     */

  }, {
    key: "observe",
    value: function observe(m) {
      this.states.push({
        forwardFn: function forwardFn() {},
        backpropagationFn: function backpropagationFn() {}
      });
      return m;
    }
    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: "runIndex",
    value: function runIndex() {
      var rowIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.inputRow = rowIndex;
      var state;

      for (var i = 0, max = this.states.length; i < max; i++) {
        state = this.states[i];

        if (!state.hasOwnProperty('forwardFn')) {
          continue;
        }

        state.forwardFn(state.product, state.left, state.right);
      }

      return state.product;
    }
    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: "runInput",
    value: function runInput(inputValue) {
      this.inputValue = inputValue;
      var state;

      for (var i = 0, max = this.states.length; i < max; i++) {
        state = this.states[i];

        if (!state.hasOwnProperty('forwardFn')) {
          continue;
        }

        state.forwardFn(state.product, state.left, state.right);
      }

      return state.product;
    }
    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: "backpropagate",
    value: function backpropagate() {
      var i = this.states.length;
      var state;

      while (i-- > 0) {
        state = this.states[i];

        if (!state.hasOwnProperty('backpropagationFn')) {
          continue;
        } // console.log('backfn', state.backpropagationFn.name);
        // console.log('before', state.product.deltas);


        state.backpropagationFn(state.product, state.left, state.right); // console.log('after', state.product.deltas);
      }

      return state.product;
    }
    /**
     * @patam {Number} [rowIndex]
     * @output {Matrix}
     */

  }, {
    key: "backpropagateIndex",
    value: function backpropagateIndex() {
      var rowIndex = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      this.inputRow = rowIndex;
      var i = this.states.length;
      var state;

      while (i-- > 0) {
        state = this.states[i];

        if (!state.hasOwnProperty('backpropagationFn')) {
          continue;
        }

        state.backpropagationFn(state.product, state.left, state.right);
      }

      return state.product;
    }
  }, {
    key: "predictTarget",
    value: function predictTarget(input, target) {
      var output = this.runInput(input);
      var errorSum = 0;

      for (var i = 0; i < output.weights.length; i++) {
        var error = output.weights[i] - target[i]; // set gradients into log probabilities

        errorSum += Math.abs(error); // write gradients into log probabilities

        output.deltas[i] = error;
      }

      return errorSum;
    }
  }, {
    key: "predictTargetIndex",
    value: function predictTargetIndex(input, target) {
      var output = this.runIndex(input); // set gradients into log probabilities

      var logProbabilities = output; // interpret output as log probabilities

      var probabilities = softmax(output); // compute the softmax probabilities
      // write gradients into log probabilities

      logProbabilities.deltas = probabilities.weights.slice(0);
      logProbabilities.deltas[target] -= 1; // accumulate base 2 log prob and do smoothing

      return -Math.log2(probabilities.weights[target]);
    }
  }]);

  return Equation;
}();

var equation = Equation;

var randomFloat$2 = random.randomFloat;
/**
 *
 * @param {Matrix} m
 * @returns {number}
 */

var sampleI = function sampleI(m) {
  // sample argmax from w, assuming w are
  // probabilities that sum to one
  var r = randomFloat$2(0, 1);
  var x = 0;
  var i = 0;
  var w = m.weights;

  while (true) {
    x += w[i];

    if (x > r) {
      return i;
    }

    i++;
  }
};

/**
 *
 * @param {Matrix} m
 * @returns {number}
 */
var maxI = function maxI(m) {
  // argmax of array w
  var weights = m.weights;
  var maxv = weights[0];
  var maxix = 0;

  for (var i = 1; i < weights.length; i++) {
    var v = weights[i];
    if (v < maxv) continue;
    maxix = i;
    maxv = v;
  }

  return maxix;
};

/*
 *
 * @param {Matrix} product
 * @param {Matrix} left
 */
var copy = function copy(product, left) {
  product.rows = parseInt(left.rows, 10);
  product.columns = parseInt(left.columns, 10);
  product.weights = left.weights.slice(0);
  product.deltas = left.deltas.slice(0);
};

var _meta = createCommonjsModule(function (module) {
var META = _uid('meta');


var setDesc = _objectDp.f;
var id = 0;
var isExtensible = Object.isExtensible || function () {
  return true;
};
var FREEZE = !_fails(function () {
  return isExtensible(Object.preventExtensions({}));
});
var setMeta = function (it) {
  setDesc(it, META, { value: {
    i: 'O' + ++id, // object ID
    w: {}          // weak collections IDs
  } });
};
var fastKey = function (it, create) {
  // return primitive with prefix
  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return 'F';
    // not necessary to add metadata
    if (!create) return 'E';
    // add missing metadata
    setMeta(it);
  // return object ID
  } return it[META].i;
};
var getWeak = function (it, create) {
  if (!_has(it, META)) {
    // can't set metadata to uncaught frozen object
    if (!isExtensible(it)) return true;
    // not necessary to add metadata
    if (!create) return false;
    // add missing metadata
    setMeta(it);
  // return hash weak collections IDs
  } return it[META].w;
};
// add metadata on freeze-family methods calling
var onFreeze = function (it) {
  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
  return it;
};
var meta = module.exports = {
  KEY: META,
  NEED: false,
  fastKey: fastKey,
  getWeak: getWeak,
  onFreeze: onFreeze
};
});

var _validateCollection = function (it, TYPE) {
  if (!_isObject(it) || it._t !== TYPE) throw TypeError('Incompatible receiver, ' + TYPE + ' required!');
  return it;
};

var dP$3 = _objectDp.f;









var fastKey = _meta.fastKey;

var SIZE = _descriptors ? '_s' : 'size';

var getEntry = function (that, key) {
  // fast case
  var index = fastKey(key);
  var entry;
  if (index !== 'F') return that._i[index];
  // frozen object case
  for (entry = that._f; entry; entry = entry.n) {
    if (entry.k == key) return entry;
  }
};

var _collectionStrong = {
  getConstructor: function (wrapper, NAME, IS_MAP, ADDER) {
    var C = wrapper(function (that, iterable) {
      _anInstance(that, C, NAME, '_i');
      that._t = NAME;         // collection type
      that._i = _objectCreate(null); // index
      that._f = undefined;    // first entry
      that._l = undefined;    // last entry
      that[SIZE] = 0;         // size
      if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
    });
    _redefineAll(C.prototype, {
      // 23.1.3.1 Map.prototype.clear()
      // 23.2.3.2 Set.prototype.clear()
      clear: function clear() {
        for (var that = _validateCollection(this, NAME), data = that._i, entry = that._f; entry; entry = entry.n) {
          entry.r = true;
          if (entry.p) entry.p = entry.p.n = undefined;
          delete data[entry.i];
        }
        that._f = that._l = undefined;
        that[SIZE] = 0;
      },
      // 23.1.3.3 Map.prototype.delete(key)
      // 23.2.3.4 Set.prototype.delete(value)
      'delete': function (key) {
        var that = _validateCollection(this, NAME);
        var entry = getEntry(that, key);
        if (entry) {
          var next = entry.n;
          var prev = entry.p;
          delete that._i[entry.i];
          entry.r = true;
          if (prev) prev.n = next;
          if (next) next.p = prev;
          if (that._f == entry) that._f = next;
          if (that._l == entry) that._l = prev;
          that[SIZE]--;
        } return !!entry;
      },
      // 23.2.3.6 Set.prototype.forEach(callbackfn, thisArg = undefined)
      // 23.1.3.5 Map.prototype.forEach(callbackfn, thisArg = undefined)
      forEach: function forEach(callbackfn /* , that = undefined */) {
        _validateCollection(this, NAME);
        var f = _ctx(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
        var entry;
        while (entry = entry ? entry.n : this._f) {
          f(entry.v, entry.k, this);
          // revert to the last existing entry
          while (entry && entry.r) entry = entry.p;
        }
      },
      // 23.1.3.7 Map.prototype.has(key)
      // 23.2.3.7 Set.prototype.has(value)
      has: function has(key) {
        return !!getEntry(_validateCollection(this, NAME), key);
      }
    });
    if (_descriptors) dP$3(C.prototype, 'size', {
      get: function () {
        return _validateCollection(this, NAME)[SIZE];
      }
    });
    return C;
  },
  def: function (that, key, value) {
    var entry = getEntry(that, key);
    var prev, index;
    // change existing entry
    if (entry) {
      entry.v = value;
    // create new entry
    } else {
      that._l = entry = {
        i: index = fastKey(key, true), // <- index
        k: key,                        // <- key
        v: value,                      // <- value
        p: prev = that._l,             // <- previous entry
        n: undefined,                  // <- next entry
        r: false                       // <- removed
      };
      if (!that._f) that._f = entry;
      if (prev) prev.n = entry;
      that[SIZE]++;
      // add to index
      if (index !== 'F') that._i[index] = entry;
    } return that;
  },
  getEntry: getEntry,
  setStrong: function (C, NAME, IS_MAP) {
    // add .keys, .values, .entries, [@@iterator]
    // 23.1.3.4, 23.1.3.8, 23.1.3.11, 23.1.3.12, 23.2.3.5, 23.2.3.8, 23.2.3.10, 23.2.3.11
    _iterDefine(C, NAME, function (iterated, kind) {
      this._t = _validateCollection(iterated, NAME); // target
      this._k = kind;                     // kind
      this._l = undefined;                // previous
    }, function () {
      var that = this;
      var kind = that._k;
      var entry = that._l;
      // revert to the last existing entry
      while (entry && entry.r) entry = entry.p;
      // get next entry
      if (!that._t || !(that._l = entry = entry ? entry.n : that._t._f)) {
        // or finish the iteration
        that._t = undefined;
        return _iterStep(1);
      }
      // return step by kind
      if (kind == 'keys') return _iterStep(0, entry.k);
      if (kind == 'values') return _iterStep(0, entry.v);
      return _iterStep(0, [entry.k, entry.v]);
    }, IS_MAP ? 'entries' : 'values', !IS_MAP, true);

    // add [@@species], 23.1.2.2, 23.2.2.2
    _setSpecies(NAME);
  }
};

var _collection = function (NAME, wrapper, methods, common, IS_MAP, IS_WEAK) {
  var Base = _global[NAME];
  var C = Base;
  var ADDER = IS_MAP ? 'set' : 'add';
  var proto = C && C.prototype;
  var O = {};
  var fixMethod = function (KEY) {
    var fn = proto[KEY];
    _redefine(proto, KEY,
      KEY == 'delete' ? function (a) {
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'has' ? function has(a) {
        return IS_WEAK && !_isObject(a) ? false : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'get' ? function get(a) {
        return IS_WEAK && !_isObject(a) ? undefined : fn.call(this, a === 0 ? 0 : a);
      } : KEY == 'add' ? function add(a) { fn.call(this, a === 0 ? 0 : a); return this; }
        : function set(a, b) { fn.call(this, a === 0 ? 0 : a, b); return this; }
    );
  };
  if (typeof C != 'function' || !(IS_WEAK || proto.forEach && !_fails(function () {
    new C().entries().next();
  }))) {
    // create collection constructor
    C = common.getConstructor(wrapper, NAME, IS_MAP, ADDER);
    _redefineAll(C.prototype, methods);
    _meta.NEED = true;
  } else {
    var instance = new C();
    // early implementations not supports chaining
    var HASNT_CHAINING = instance[ADDER](IS_WEAK ? {} : -0, 1) != instance;
    // V8 ~  Chromium 40- weak-collections throws on primitives, but should return false
    var THROWS_ON_PRIMITIVES = _fails(function () { instance.has(1); });
    // most early implementations doesn't supports iterables, most modern - not close it correctly
    var ACCEPT_ITERABLES = _iterDetect(function (iter) { new C(iter); }); // eslint-disable-line no-new
    // for early implementations -0 and +0 not the same
    var BUGGY_ZERO = !IS_WEAK && _fails(function () {
      // V8 ~ Chromium 42- fails only with 5+ elements
      var $instance = new C();
      var index = 5;
      while (index--) $instance[ADDER](index, index);
      return !$instance.has(-0);
    });
    if (!ACCEPT_ITERABLES) {
      C = wrapper(function (target, iterable) {
        _anInstance(target, C, NAME);
        var that = _inheritIfRequired(new Base(), target, C);
        if (iterable != undefined) _forOf(iterable, IS_MAP, that[ADDER], that);
        return that;
      });
      C.prototype = proto;
      proto.constructor = C;
    }
    if (THROWS_ON_PRIMITIVES || BUGGY_ZERO) {
      fixMethod('delete');
      fixMethod('has');
      IS_MAP && fixMethod('get');
    }
    if (BUGGY_ZERO || HASNT_CHAINING) fixMethod(ADDER);
    // weak collections should not contains .clear method
    if (IS_WEAK && proto.clear) delete proto.clear;
  }

  _setToStringTag(C, NAME);

  O[NAME] = C;
  _export(_export.G + _export.W + _export.F * (C != Base), O);

  if (!IS_WEAK) common.setStrong(C, NAME, IS_MAP);

  return C;
};

var SET = 'Set';

// 23.2 Set Objects
var es6_set = _collection(SET, function (get) {
  return function Set() { return get(this, arguments.length > 0 ? arguments[0] : undefined); };
}, {
  // 23.2.3.1 Set.prototype.add(value)
  add: function add(value) {
    return _collectionStrong.def(_validateCollection(this, SET), value = value === 0 ? 0 : value, value);
  }
}, _collectionStrong);

/**
 *
 * @param {String[]|Number[]} values
 * @param maxThreshold
 * @constructor
 */
var DataFormatter = /*#__PURE__*/function () {
  function DataFormatter(values) {
    var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

    _classCallCheck(this, DataFormatter);

    if (values === undefined) return;
    this.values = values; // go over all characters and keep track of all unique ones seen
    // count up all characters

    this.indexTable = {};
    this.characterTable = {};
    this.characters = [];
    this.specialIndexes = [];
    this.buildCharactersFromIterable(values);
    this.buildTables(maxThreshold);
  }

  _createClass(DataFormatter, [{
    key: "buildCharactersFromIterable",
    value: function buildCharactersFromIterable(values) {
      var tempCharactersTable = {};

      for (var dataFormatterIndex = 0, dataFormatterLength = values.length; dataFormatterIndex < dataFormatterLength; dataFormatterIndex++) {
        var characters = values[dataFormatterIndex];

        if (characters.hasOwnProperty('length')) {
          for (var characterIndex = 0, charactersLength = characters.length; characterIndex < charactersLength; characterIndex++) {
            var character = characters[characterIndex];
            if (tempCharactersTable.hasOwnProperty(character)) continue;
            tempCharactersTable[character] = true;
            this.characters.push(character);
          }
        } else {
          var _character = values[dataFormatterIndex];
          if (tempCharactersTable.hasOwnProperty(_character)) continue;
          tempCharactersTable[dataFormatterIndex] = true;
          this.characters.push(_character);
        }
      }
    }
  }, {
    key: "buildTables",
    value: function buildTables(maxThreshold) {
      // filter by count threshold and create pointers
      var charactersLength = this.characters.length;

      for (var characterIndex = 0; characterIndex < charactersLength; characterIndex++) {
        var character = this.characters[characterIndex];

        if (characterIndex >= maxThreshold) {
          // add character to dataFormatter
          this.indexTable[character] = characterIndex;
          this.characterTable[characterIndex] = character;
        }
      }
    }
  }, {
    key: "toIndexes",
    value: function toIndexes(value) {
      var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var result = [];
      var indexTable = this.indexTable;

      for (var i = 0, max = value.length; i < max; i++) {
        var character = value[i];
        var index = indexTable[character];

        if (index === undefined) {
          if (indexTable.unrecognized) {
            index = indexTable.unrecognized;
          } else {
            throw new Error("unrecognized character \"".concat(character, "\""));
          }
        }

        if (index < maxThreshold) continue;
        result.push(index);
      }

      return result;
    }
  }, {
    key: "toIndexesInputOutput",
    value: function toIndexesInputOutput(value1) {
      var value2 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var maxThreshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      var result = null;

      if (typeof value1 === 'string') {
        result = this.toIndexes(value1.split('').concat(['stop-input', 'start-output']), maxThreshold);
      } else if (typeof value1 === 'number') {
        result = this.toIndexes(value1.toString().split('').concat(['stop-input', 'start-output']), maxThreshold);
      } else {
        result = this.toIndexes(value1.concat(['stop-input', 'start-output']), maxThreshold);
      }

      if (value2 === null) return result;

      if (typeof value2 === 'string') {
        return result.concat(this.toIndexes(value2.split(''), maxThreshold));
      } else {
        return result.concat(this.toIndexes(value2, maxThreshold));
      }
    }
  }, {
    key: "toCharacters",
    value: function toCharacters(indices) {
      var maxThreshold = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var result = [];
      var indexTable = this.indexTable,
          characterTable = this.characterTable;

      for (var i = 0, max = indices.length; i < max; i++) {
        var index = indices[i];
        if (index < maxThreshold) continue;
        var character = characterTable[index];

        if (character === undefined) {
          if (indexTable.unrecognized) {
            character = characterTable[indexTable.unrecognized];
          } else {
            throw new Error("unrecognized index \"".concat(index, "\""));
          }
        } else if (character !== null) {
          result.push(character);
        }
      }

      return result;
    }
  }, {
    key: "toString",
    value: function toString(indices, maxThreshold) {
      return this.toCharacters(indices, maxThreshold).join('');
    }
  }, {
    key: "addInputOutput",
    value: function addInputOutput() {
      this.addSpecial('stop-input');
      this.addSpecial('start-output');
    }
  }, {
    key: "addUnrecognized",
    value: function addUnrecognized() {
      this.addSpecial('unrecognized');
    }
  }, {
    key: "addSpecial",
    value: function addSpecial(special) {
      var character = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      var specialIndex = this.indexTable[special] = this.characters.length;
      this.characterTable[specialIndex] = character;
      this.specialIndexes.push(this.characters.length);
      this.characters.push(special);
    }
  }, {
    key: "countSpecial",
    value: function countSpecial(output) {
      var sum = 0;

      for (var i = 0; i < this.specialIndexes; i++) {
        var index = -1;

        while (index = output.indexOf(this.specialIndexes[i], index) > -1) {
          sum++;
        }
      }

      return sum;
    }
  }, {
    key: "toFunctionString",
    value: function toFunctionString() {
      return "\nvar characterTable = ".concat(JSON.stringify(this.characterTable), ";\nvar indexTable = ").concat(JSON.stringify(this.indexTable), ";\nvar characters = ").concat(JSON.stringify(this.characters), ";\nvar dataFormatter = {\n  toIndexes: ").concat(this.toIndexes.toString(), ",\n  toIndexesInputOutput: ").concat(this.toIndexesInputOutput.toString(), ",\n  toCharacters: ").concat(this.toCharacters.toString(), ",\n};");
    }
  }], [{
    key: "fromAllPrintable",
    value: function fromAllPrintable(maxThreshold) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['\n'];

      for (var i = 32; i <= 126; i++) {
        values.push(String.fromCharCode(i));
      }

      return new DataFormatter(values, maxThreshold);
    }
  }, {
    key: "fromAllPrintableInputOutput",
    value: function fromAllPrintableInputOutput(maxThreshold) {
      var values = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ['\n'];
      var dataFormatter = DataFormatter.fromAllPrintable(maxThreshold, values);
      dataFormatter.addInputOutput();
      return dataFormatter;
    }
  }, {
    key: "fromStringInputOutput",
    value: function fromStringInputOutput(string, maxThreshold) {
      var _String$prototype;

      var values = (_String$prototype = String.prototype).concat.apply(_String$prototype, _toConsumableArray(new Set(string)));

      var dataFormatter = new DataFormatter(values, maxThreshold);
      dataFormatter.addInputOutput();
      return dataFormatter;
    }
  }, {
    key: "fromArrayInputOutput",
    value: function fromArrayInputOutput(array, maxThreshold) {
      var dataFormatter = new DataFormatter(array.filter(function (v, i, a) {
        return a.indexOf(v) === i;
      }), maxThreshold);
      dataFormatter.addInputOutput();
      return dataFormatter;
    }
  }, {
    key: "fromString",
    value: function fromString(string, maxThreshold) {
      var _String$prototype2;

      var values = (_String$prototype2 = String.prototype).concat.apply(_String$prototype2, _toConsumableArray(new Set(string)));

      return new DataFormatter(values, maxThreshold);
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      var dataFormatter = new DataFormatter();
      dataFormatter.indexTable = json.indexTable;
      dataFormatter.characterTable = json.characterTable;
      dataFormatter.values = json.values;
      dataFormatter.characters = json.characters;
      dataFormatter.specialIndexes = json.specialIndexes;
      return dataFormatter;
    }
  }]);

  return DataFormatter;
}();

function validateAndCast(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (typeof value[0] === 'string') return value;

  if (typeof value[0] === 'number') {
    return value.map(function (value) {
      return value.toString();
    });
  }

  throw new Error('unrecognized value, expected string[], string, number[], or number');
}
/**
 *
 * @param {*[]} data
 * @returns {Number[]}
 */


function defaultRNNFormatter(data) {
  if (typeof data[0] !== 'string' && !Array.isArray(data[0]) && (!data[0].hasOwnProperty('input') || !data[0].hasOwnProperty('output'))) {
    return data;
  }

  var values = [];
  var result = [];

  if (typeof data[0] === 'string' || typeof data[0] === 'number' || Array.isArray(data[0])) {
    if (!this.dataFormatter) {
      for (var i = 0; i < data.length; i++) {
        values.push(validateAndCast(data[i]));
      }

      this.dataFormatter = new DataFormatter(values);
      this.dataFormatter.addUnrecognized();
    }

    for (var _i = 0, max = data.length; _i < max; _i++) {
      result.push(this.formatDataIn(data[_i]));
    }
  } else if (data[0].input && data[0].output) {
    if (!this.dataFormatter) {
      for (var _i2 = 0; _i2 < data.length; _i2++) {
        var datum = data[_i2];
        values.push(validateAndCast(datum.input), validateAndCast(datum.output));
      }

      this.dataFormatter = DataFormatter.fromArrayInputOutput(values);
      this.dataFormatter.addUnrecognized();
    }

    for (var _i3 = 0, _max = data.length; _i3 < _max; _i3++) {
      result.push(this.formatDataIn(validateAndCast(data[_i3].input), validateAndCast(data[_i3].output)));
    }
  } else {
    throw new Error('unrecognized data');
  }

  return result;
}

var dataFormatter = {
  DataFormatter: DataFormatter,
  defaultRNNFormatter: defaultRNNFormatter
};

var randomFloat$3 = random.randomFloat;
var zeros$b = zeros$1.zeros;
var DataFormatter$1 = dataFormatter.DataFormatter,
    defaultRNNFormatter$1 = dataFormatter.defaultRNNFormatter;

var RNN = /*#__PURE__*/function () {
  function RNN() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, RNN);

    var defaults = this.constructor.defaults;
    Object.assign(this, defaults, options);
    this.trainOpts = {};
    this.updateTrainingOptions(_objectSpread2(_objectSpread2({}, this.constructor.trainDefaults), options));
    this.stepCache = {};
    this.runs = 0;
    this.ratioClipped = null;
    this.model = null;
    this.inputLookup = null;
    this.inputLookupLength = null;
    this.outputLookup = null;
    this.outputLookupLength = null;

    if (options.json) {
      this.fromJSON(options.json);
    }
  }

  _createClass(RNN, [{
    key: "initialize",
    value: function initialize() {
      this.model = {
        input: null,
        hiddenLayers: [],
        output: null,
        equations: [],
        allMatrices: [],
        equationConnections: [],
        outputConnector: null
      };

      if (this.dataFormatter) {
        this.inputSize = this.inputRange = this.outputSize = this.dataFormatter.characters.length;
      }

      this.mapModel();
    }
  }, {
    key: "createHiddenLayers",
    value: function createHiddenLayers() {
      // 0 is end, so add 1 to offset
      this.model.hiddenLayers.push(this.constructor.getModel(this.hiddenLayers[0], this.inputSize));
      var prevSize = this.hiddenLayers[0];

      for (var d = 1; d < this.hiddenLayers.length; d++) {
        // loop over depths
        var hiddenSize = this.hiddenLayers[d];
        this.model.hiddenLayers.push(this.constructor.getModel(hiddenSize, prevSize));
        prevSize = hiddenSize;
      }
    }
    /**
     *
     * @param {Number} hiddenSize
     * @param {Number} prevSize
     * @returns {object}
     */

  }, {
    key: "createInputMatrix",
    value: function createInputMatrix() {
      // 0 is end, so add 1 to offset
      this.model.input = new randomMatrix(this.inputRange + 1, this.inputSize, 0.08);
    }
  }, {
    key: "createOutputMatrix",
    value: function createOutputMatrix() {
      var model = this.model;
      var outputSize = this.outputSize;
      var lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1]; // 0 is end, so add 1 to offset
      // whd

      model.outputConnector = new randomMatrix(outputSize + 1, lastHiddenSize, 0.08); // 0 is end, so add 1 to offset
      // bd

      model.output = new matrix(outputSize + 1, 1);
    }
  }, {
    key: "bindEquation",
    value: function bindEquation() {
      var model = this.model;
      var equation$1 = new equation();
      var outputs = [];
      var equationConnection = model.equationConnections.length > 0 ? model.equationConnections[model.equationConnections.length - 1] : this.initialLayerInputs; // 0 index

      var output = this.constructor.getEquation(equation$1, equation$1.inputMatrixToRow(model.input), equationConnection[0], model.hiddenLayers[0]);
      outputs.push(output); // 1+ indices

      for (var i = 1, max = this.hiddenLayers.length; i < max; i++) {
        output = this.constructor.getEquation(equation$1, output, equationConnection[i], model.hiddenLayers[i]);
        outputs.push(output);
      }

      model.equationConnections.push(outputs);
      equation$1.add(equation$1.multiply(model.outputConnector, output), model.output);
      model.equations.push(equation$1);
    }
  }, {
    key: "mapModel",
    value: function mapModel() {
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      var allMatrices = model.allMatrices;
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new matrix(size, 1);
      });
      this.createInputMatrix();
      if (!model.input) throw new Error('net.model.input not set');
      allMatrices.push(model.input);
      this.createHiddenLayers();
      if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');

      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenMatrix = hiddenLayers[i];

        for (var property in hiddenMatrix) {
          if (!hiddenMatrix.hasOwnProperty(property)) continue;
          allMatrices.push(hiddenMatrix[property]);
        }
      }

      this.createOutputMatrix();
      if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
      if (!model.output) throw new Error('net.model.output not set');
      allMatrices.push(model.outputConnector);
      allMatrices.push(model.output);
    }
    /**
     *
     * @param {Number[]|string[]|string} input
     * @param {boolean} [logErrorRate]
     * @returns {number}
     */

  }, {
    key: "trainPattern",
    value: function trainPattern(input, logErrorRate) {
      var error = this.trainInput(input);
      this.backpropagate(input);
      this.adjustWeights();

      if (logErrorRate) {
        return error;
      }
    }
    /**
     *
     * @param {Number[]} input
     * @returns {number}
     */

  }, {
    key: "trainInput",
    value: function trainInput(input) {
      this.runs++;
      var model = this.model;
      var max = input.length;
      var log2ppl = 0;
      var equation;

      while (model.equations.length <= input.length + 1) {
        // last is zero
        this.bindEquation();
      }

      for (var inputIndex = -1, inputMax = input.length; inputIndex < inputMax; inputIndex++) {
        // start and end tokens are zeros
        var equationIndex = inputIndex + 1;
        equation = model.equations[equationIndex];
        var source = inputIndex === -1 ? 0 : input[inputIndex] + 1; // first step: start with START token

        var target = inputIndex === max - 1 ? 0 : input[inputIndex + 1] + 1; // last step: end with END token

        log2ppl += equation.predictTargetIndex(source, target);
      }

      return Math.pow(2, log2ppl / (max - 1)) / 100;
    }
    /**
     * @param {Number[]} input
     */

  }, {
    key: "backpropagate",
    value: function backpropagate(input) {
      var i = input.length;
      var model = this.model;
      var equations = model.equations;

      while (i > 0) {
        equations[i].backpropagateIndex(input[i - 1] + 1);
        i--;
      }

      equations[0].backpropagateIndex(0);
    }
  }, {
    key: "adjustWeights",
    value: function adjustWeights() {
      var regc = this.regc,
          clipval = this.clipval,
          model = this.model,
          decayRate = this.decayRate,
          stepCache = this.stepCache,
          smoothEps = this.smoothEps,
          trainOpts = this.trainOpts;
      var learningRate = trainOpts.learningRate;
      var allMatrices = model.allMatrices;
      var numClipped = 0;
      var numTot = 0;

      for (var matrixIndex = 0; matrixIndex < allMatrices.length; matrixIndex++) {
        var matrix = allMatrices[matrixIndex];
        var weights = matrix.weights,
            deltas = matrix.deltas;

        if (!(matrixIndex in stepCache)) {
          stepCache[matrixIndex] = zeros$b(matrix.rows * matrix.columns);
        }

        var cache = stepCache[matrixIndex];

        for (var i = 0; i < weights.length; i++) {
          var r = deltas[i];
          var w = weights[i]; // rmsprop adaptive learning rate

          cache[i] = cache[i] * decayRate + (1 - decayRate) * r * r; // gradient clip

          if (r > clipval) {
            r = clipval;
            numClipped++;
          }

          if (r < -clipval) {
            r = -clipval;
            numClipped++;
          }

          numTot++; // update (and regularize)

          weights[i] = w + -learningRate * r / Math.sqrt(cache[i] + smoothEps) - regc * w;
        }
      }

      this.ratioClipped = numClipped / numTot;
    }
    /**
     *
     * @returns boolean
     */

  }, {
    key: "run",

    /**
     *
     * @param {Number[]|*} [rawInput]
     * @param {Boolean} [isSampleI]
     * @param {Number} temperature
     * @returns {*}
     */
    value: function run() {
      var rawInput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      var isSampleI = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      var temperature = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var maxPredictionLength = this.maxPredictionLength + rawInput.length + (this.dataFormatter ? this.dataFormatter.specialIndexes.length : 0);
      if (!this.isRunnable) return null;
      var input = this.formatDataIn(rawInput);
      var model = this.model;
      var output = [];
      var i = 0;

      while (true) {
        var previousIndex = i === 0 ? 0 : i < input.length ? input[i - 1] + 1 : output[i - 1];

        while (model.equations.length <= i) {
          this.bindEquation();
        }

        var equation = model.equations[i]; // sample predicted letter

        var outputMatrix = equation.runIndex(previousIndex);
        var logProbabilities = new matrix(model.output.rows, model.output.columns);
        copy(logProbabilities, outputMatrix);

        if (temperature !== 1 && isSampleI) {
          /**
           * scale log probabilities by temperature and re-normalize
           * if temperature is high, logProbabilities will go towards zero
           * and the softmax outputs will be more diffuse. if temperature is
           * very low, the softmax outputs will be more peaky
           */
          for (var j = 0, max = logProbabilities.weights.length; j < max; j++) {
            logProbabilities.weights[j] /= temperature;
          }
        }

        var probs = softmax(logProbabilities);
        var nextIndex = isSampleI ? sampleI(probs) : maxI(probs);
        i++;

        if (nextIndex === 0) {
          // END token predicted, break out
          break;
        }

        if (i >= maxPredictionLength) {
          // something is wrong
          break;
        }

        output.push(nextIndex);
      }
      /**
       * we slice the input length here, not because output contains it, but it will be erroneous as we are sending the
       * network what is contained in input, so the data is essentially guessed by the network what could be next, till it
       * locks in on a value.
       * Kind of like this, values are from input:
       * 0 -> 4 (or in English: "beginning on input" -> "I have no idea? I'll guess what they want next!")
       * 2 -> 2 (oh how interesting, I've narrowed down values...)
       * 1 -> 9 (oh how interesting, I've now know what the values are...)
       * then the output looks like: [4, 2, 9,...]
       * so we then remove the erroneous data to get our true output
       */


      return this.formatDataOut(input, output.slice(input.length).map(function (value) {
        return value - 1;
      }));
    }
    /**
     *
     * Verifies network sizes are initilaized
     * If they are not it will initialize them
     */

  }, {
    key: "verifyIsInitialized",
    value: function verifyIsInitialized() {
      if (!this.model) {
        this.initialize();
      }
    }
    /**
     *
     * @param options
     *    Supports all `trainDefaults` properties
     *    also supports:
     *       learningRate: (number),
     *       momentum: (number),
     *       activation: 'sigmoid', 'relu', 'leaky-relu', 'tanh'
     */

  }, {
    key: "updateTrainingOptions",
    value: function updateTrainingOptions(options) {
      var _this = this;

      Object.keys(this.constructor.trainDefaults).forEach(function (p) {
        return _this.trainOpts[p] = options.hasOwnProperty(p) ? options[p] : _this.trainOpts[p];
      });
      this.validateTrainingOptions(this.trainOpts);
      this.setLogMethod(options.log || this.trainOpts.log);
      this.activation = options.activation || this.activation;
    }
  }, {
    key: "validateTrainingOptions",
    value: function validateTrainingOptions(options) {
      neuralNetwork.prototype.validateTrainingOptions.call(this, options);
    }
    /**
     *
     * @param log
     * if a method is passed in method is used
     * if false passed in nothing is logged
     * @returns error
     */

  }, {
    key: "setLogMethod",
    value: function setLogMethod(log) {
      if (typeof log === 'function') {
        this.trainOpts.log = log;
      } else if (log) {
        this.trainOpts.log = console.log;
      } else {
        this.trainOpts.log = false;
      }
    }
    /**
     *
     * @param data
     * @param options
     * @protected
     * @return {object} { data, status, endTime }
     */

  }, {
    key: "prepTraining",
    value: function prepTraining(data, options) {
      this.updateTrainingOptions(options);
      data = this.formatData(data);
      var endTime = Date.now() + this.trainOpts.timeout;
      var status = {
        error: 1,
        iterations: 0
      };
      this.verifyIsInitialized(data);
      return {
        data: data,
        status: status,
        endTime: endTime
      };
    }
    /**
     *
     * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
     * @param {Object} [options]
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: "train",
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.trainOpts = options = _objectSpread2(_objectSpread2({}, this.constructor.trainDefaults), options);
      var _options = options,
          iterations = _options.iterations;
      var _options2 = options,
          errorThresh = _options2.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var _options3 = options,
          logPeriod = _options3.logPeriod;
      var _options4 = options,
          callback = _options4.callback;
      var _options5 = options,
          callbackPeriod = _options5.callbackPeriod;
      var error = Infinity;
      var i;

      if (this.hasOwnProperty('setupData')) {
        data = this.setupData(data);
      }

      this.verifyIsInitialized();

      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;

        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j], true);
          sum += err;
        }

        error = sum / data.length;

        if (isNaN(error)) {
          throw new Error('Network error rate is unexpected NaN, check network configurations and try again. Most probably input format is not correct or training data is not enough. ');
        }

        if (log && i % logPeriod === 0) {
          log("iterations: ".concat(i, ", training error: ").concat(error));
        }

        if (callback && i % callbackPeriod === 0) {
          callback({
            error: error,
            iterations: i
          });
        }
      }

      return {
        error: error,
        iterations: i
      };
    }
  }, {
    key: "addFormat",
    value: function addFormat() {
      throw new Error('not yet implemented');
    }
    /**
     *
     * @returns {Object}
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      var defaults = this.constructor.defaults;

      if (!this.model) {
        this.initialize();
      }

      var model = this.model;
      var options = {};

      for (var p in defaults) {
        if (defaults.hasOwnProperty(p)) {
          options[p] = this[p];
        }
      }

      return {
        type: this.constructor.name,
        options: options,
        input: model.input.toJSON(),
        hiddenLayers: model.hiddenLayers.map(function (hiddenLayer) {
          var layers = {};

          for (var _p in hiddenLayer) {
            layers[_p] = hiddenLayer[_p].toJSON();
          }

          return layers;
        }),
        outputConnector: this.model.outputConnector.toJSON(),
        output: this.model.output.toJSON()
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      var defaults = this.constructor.defaults;
      var options = json.options;
      this.model = null;
      this.hiddenLayers = null;
      var allMatrices = [];
      var input = matrix.fromJSON(json.input);
      allMatrices.push(input);
      var hiddenLayers = []; // backward compatibility for hiddenSizes

      (json.hiddenLayers || json.hiddenSizes).forEach(function (hiddenLayer) {
        var layers = {};

        for (var p in hiddenLayer) {
          layers[p] = matrix.fromJSON(hiddenLayer[p]);
          allMatrices.push(layers[p]);
        }

        hiddenLayers.push(layers);
      });
      var outputConnector = matrix.fromJSON(json.outputConnector);
      allMatrices.push(outputConnector);
      var output = matrix.fromJSON(json.output);
      allMatrices.push(output);
      Object.assign(this, defaults, options); // backward compatibility

      if (options.hiddenSizes) {
        this.hiddenLayers = options.hiddenSizes;
      }

      if (options.dataFormatter) {
        this.dataFormatter = DataFormatter$1.fromJSON(options.dataFormatter);
      }

      this.model = {
        input: input,
        hiddenLayers: hiddenLayers,
        output: output,
        allMatrices: allMatrices,
        outputConnector: outputConnector,
        equations: [],
        equationConnections: []
      };
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new matrix(size, 1);
      });
      this.bindEquation();
    }
    /**
     * @param {Function} [cb]
     * @returns {Function}
     */

  }, {
    key: "toFunction",
    value: function toFunction(cb) {
      var model = this.model;
      var equations = this.model.equations;
      var equation = equations[1];
      var states = equation.states;
      var jsonString = JSON.stringify(this.toJSON());

      function previousConnectionIndex(m) {
        var connection = model.equationConnections[0];
        var states = equations[0].states;

        for (var i = 0, max = states.length; i < max; i++) {
          if (states[i].product === m) {
            return i;
          }
        }

        return connection.indexOf(m);
      }

      function matrixOrigin(m, stateIndex) {
        for (var i = 0, max = states.length; i < max; i++) {
          var state = states[i];

          if (i === stateIndex) {
            var j = previousConnectionIndex(m);

            if (j > -1 && (m === state.left || m === state.right)) {
              return "typeof prevStates[".concat(j, "] === 'object' ? prevStates[").concat(j, "].product : new Matrix(").concat(m.rows, ", ").concat(m.columns, ")");
            }

            return "new Matrix(".concat(m.rows, ", ").concat(m.columns, ")");
          }

          if (m === state.product) return "states[".concat(i, "].product");
          if (m === state.right) return "states[".concat(i, "].right");
          if (m === state.left) return "states[".concat(i, "].left");
        }
      }

      function matrixToString(m, stateIndex) {
        if (!m || !m.rows || !m.columns) return 'null';
        if (m === model.input) return "json.input";
        if (m === model.outputConnector) return "json.outputConnector";
        if (m === model.output) return "json.output";

        for (var i = 0, max = model.hiddenLayers.length; i < max; i++) {
          var hiddenLayer = model.hiddenLayers[i];

          for (var p in hiddenLayer) {
            if (!hiddenLayer.hasOwnProperty(p)) continue;
            if (hiddenLayer[p] !== m) continue;
            return "json.hiddenLayers[".concat(i, "].").concat(p);
          }
        }

        return matrixOrigin(m, stateIndex);
      }

      function toInner(fnString) {
        // crude, but should be sufficient for now
        // function() { body }
        fnString = fnString.toString().split('{');
        fnString.shift(); // body }

        fnString = fnString.join('{');
        fnString = fnString.split('}');
        fnString.pop(); // body

        return fnString.join('}').split('\n').join('\n        ').replace('product.deltas[i] = 0;', '').replace('product.deltas[column] = 0;', '').replace('left.deltas[leftIndex] = 0;', '').replace('right.deltas[rightIndex] = 0;', '').replace('product.deltas = left.deltas.slice(0);', '');
      }

      function fileName(fnName) {
        return "src/recurrent/matrix/".concat(fnName.replace(/[A-Z]/g, function (value) {
          return "-".concat(value.toLowerCase());
        }), ".js");
      }

      var statesRaw = [];
      var usedFunctionNames = {};
      var innerFunctionsSwitch = [];

      for (var i = 0, max = states.length; i < max; i++) {
        var state = states[i];
        statesRaw.push("states[".concat(i, "] = {\n      name: '").concat(state.forwardFn.name, "',\n      left: ").concat(matrixToString(state.left, i), ",\n      right: ").concat(matrixToString(state.right, i), ",\n      product: ").concat(matrixToString(state.product, i), "\n    }"));
        var fnName = state.forwardFn.name;

        if (!usedFunctionNames[fnName]) {
          usedFunctionNames[fnName] = true;
          innerFunctionsSwitch.push("        case '".concat(fnName, "': //compiled from ").concat(fileName(fnName), "\n          ").concat(toInner(state.forwardFn.toString()), "\n          break;"));
        }
      }

      var src = "\n  if (typeof rawInput === 'undefined') rawInput = [];\n  if (typeof isSampleI === 'undefined') isSampleI = false;\n  if (typeof temperature === 'undefined') temperature = 1;\n  var json = ".concat(jsonString, ";\n  ").concat(this.dataFormatter ? "".concat(this.dataFormatter.toFunctionString(), ";\n  Object.assign(dataFormatter, json.options.dataFormatter);") : '', "\n  ").concat(this.dataFormatter && typeof this.formatDataIn === 'function' ? "const formatDataIn = function (input, output) { ".concat(toInner(this.formatDataIn.toString()), " }.bind({ dataFormatter });") : '', "\n  ").concat(this.dataFormatter !== null && typeof this.formatDataOut === 'function' ? "const formatDataOut = function formatDataOut(input, output) { ".concat(toInner(this.formatDataOut.toString()), " }.bind({ dataFormatter });") : '', "\n  var maxPredictionLength =\n    ").concat(this.maxPredictionLength, " +\n    rawInput.length +\n    ").concat(this.dataFormatter ? this.dataFormatter.specialIndexes.length : 0, ";\n  var input = ").concat(this.dataFormatter && typeof this.formatDataIn === 'function' ? 'formatDataIn(rawInput)' : 'rawInput', ";\n  var _i = 0;\n  var output = [];\n  var states = [];\n  var prevStates;\n  while (true) {\n    var previousIndex = (_i === 0\n        ? 0\n        : _i < input.length\n          ? input[_i - 1] + 1\n          : output[_i - 1])\n          ;\n    var rowPluckIndex = previousIndex;\n    prevStates = states;\n    states = [];\n    ").concat(statesRaw.join(';\n    '), ";\n    for (var stateIndex = 0, stateMax = ").concat(statesRaw.length, "; stateIndex < stateMax; stateIndex++) {\n      var state = states[stateIndex];\n      var product = state.product;\n      var left = state.left;\n      var right = state.right;\n      switch (state.name) {\n").concat(innerFunctionsSwitch.join('\n'), "\n      }\n    }\n\n    var logProbabilities = state.product;\n    if (temperature !== 1 && isSampleI) {\n      for (var q = 0, nq = logProbabilities.weights.length; q < nq; q++) {\n        logProbabilities.weights[q] /= temperature;\n      }\n    }\n\n    var probs = softmax(logProbabilities);\n    var nextIndex = isSampleI ? sampleI(probs) : maxI(probs);\n\n    _i++;\n    if (nextIndex === 0) {\n      break;\n    }\n    if (_i >= maxPredictionLength) {\n      break;\n    }\n\n    output.push(nextIndex);\n  }\n  ").concat(this.dataFormatter && typeof this.formatDataOut === 'function' ? 'return formatDataOut(input, output.slice(input.length).map(function(value) { return value - 1; }))' : 'return output.slice(input.length).map(function(value) { return value - 1; })', ";\n  function Matrix(rows, columns) {\n    this.rows = rows;\n    this.columns = columns;\n    this.weights = zeros(rows * columns);\n  }\n  ").concat(zeros$b.toString(), "\n  ").concat(softmax.toString(), "\n  ").concat(randomFloat$3.toString(), "\n  ").concat(sampleI.toString(), "\n  ").concat(maxI.toString()); // eslint-disable-next-line no-new-func

      return new Function('rawInput', 'isSampleI', 'temperature', cb ? cb(src) : src);
    }
  }, {
    key: "isRunnable",
    get: function get() {
      if (this.model.equations.length === 0) {
        console.error("No equations bound, did you run train()?");
        return false;
      }

      return true;
    }
  }], [{
    key: "getModel",
    value: function getModel(hiddenSize, prevSize) {
      return {
        // wxh
        weight: new randomMatrix(hiddenSize, prevSize, 0.08),
        // whh
        transition: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bhh
        bias: new matrix(hiddenSize, 1)
      };
    }
    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: "getEquation",
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      var relu = equation.relu.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      return relu(add(add(multiply(hiddenLayer.weight, inputMatrix), multiply(hiddenLayer.transition, previousResult)), hiddenLayer.bias));
    }
  }]);

  return RNN;
}();

RNN.defaults = {
  inputSize: 20,
  inputRange: 20,
  hiddenLayers: [20, 20],
  outputSize: 20,
  decayRate: 0.999,
  smoothEps: 1e-8,
  regc: 0.000001,
  clipval: 5,
  maxPredictionLength: 100,

  /**
   *
   * @param {*[]} data
   * @returns {Number[]}
   */
  setupData: defaultRNNFormatter$1,

  /**
   *
   * @param {*[]} input
   * @param {*[]} output
   * @returns {Number[]}
   */
  formatDataIn: function formatDataIn(input) {
    var output = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

    if (this.dataFormatter) {
      if (this.dataFormatter.indexTable.hasOwnProperty('stop-input')) {
        return this.dataFormatter.toIndexesInputOutput(input, output);
      }

      return this.dataFormatter.toIndexes(input);
    }

    return input;
  },

  /**
   *
   * @param {Number[]} input
   * @param {Number[]} output
   * @returns {*}
   */
  formatDataOut: function formatDataOut(input, output) {
    if (this.dataFormatter) {
      return this.dataFormatter.toCharacters(output).join('');
    }

    return output;
  },
  dataFormatter: null
};
RNN.trainDefaults = {
  iterations: 20000,
  errorThresh: 0.005,
  log: false,
  logPeriod: 10,
  learningRate: 0.01,
  callback: null,
  callbackPeriod: 10
};
var rnn = RNN;

var GRU = /*#__PURE__*/function (_RNN) {
  _inherits(GRU, _RNN);

  var _super = _createSuper(GRU);

  function GRU() {
    _classCallCheck(this, GRU);

    return _super.apply(this, arguments);
  }

  _createClass(GRU, null, [{
    key: "getModel",
    value: function getModel(hiddenSize, prevSize) {
      return {
        // update Gate
        // wzxh
        updateGateInputMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wzhh
        updateGateHiddenMatrix: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bz
        updateGateBias: new matrix(hiddenSize, 1),
        // reset Gate
        // wrxh
        resetGateInputMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wrhh
        resetGateHiddenMatrix: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // br
        resetGateBias: new matrix(hiddenSize, 1),
        // cell write parameters
        // wcxh
        cellWriteInputMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wchh
        cellWriteHiddenMatrix: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bc
        cellWriteBias: new matrix(hiddenSize, 1)
      };
    }
    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: "getEquation",
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      var sigmoid = equation.sigmoid.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      var multiplyElement = equation.multiplyElement.bind(equation);
      var tanh = equation.tanh.bind(equation);
      var allOnes = equation.allOnes.bind(equation);
      var cloneNegative = equation.cloneNegative.bind(equation); // update gate

      var updateGate = sigmoid(add(add(multiply(hiddenLayer.updateGateInputMatrix, inputMatrix), multiply(hiddenLayer.updateGateHiddenMatrix, previousResult)), hiddenLayer.updateGateBias)); // reset gate

      var resetGate = sigmoid(add(add(multiply(hiddenLayer.resetGateInputMatrix, inputMatrix), multiply(hiddenLayer.resetGateHiddenMatrix, previousResult)), hiddenLayer.resetGateBias)); // cell

      var cell = tanh(add(add(multiply(hiddenLayer.cellWriteInputMatrix, inputMatrix), multiply(hiddenLayer.cellWriteHiddenMatrix, multiplyElement(resetGate, previousResult))), hiddenLayer.cellWriteBias)); // compute hidden state as gated, saturated cell activations
      // negate updateGate

      return add(multiplyElement(add(allOnes(updateGate.rows, updateGate.columns), cloneNegative(updateGate)), cell), multiplyElement(previousResult, updateGate));
    }
  }]);

  return GRU;
}(rnn);

var gru$1 = GRU;

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
}

var arrayLookupTable = ArrayLookupTable;

var zeros$c = zeros$1.zeros;
var randomFloat$4 = random.randomFloat;
var arraysToFloat32Arrays$1 = cast.arraysToFloat32Arrays,
    arrayToFloat32Arrays$1 = cast.arrayToFloat32Arrays,
    objectsToFloat32Arrays$1 = cast.objectsToFloat32Arrays,
    objectToFloat32Arrays$1 = cast.objectToFloat32Arrays,
    objectToFloat32Array$1 = cast.objectToFloat32Array;

var RNNTimeStep = /*#__PURE__*/function (_RNN) {
  _inherits(RNNTimeStep, _RNN);

  var _super = _createSuper(RNNTimeStep);

  // eslint-disable-next-line
  function RNNTimeStep(options) {
    _classCallCheck(this, RNNTimeStep);

    return _super.call(this, options);
  }

  _createClass(RNNTimeStep, [{
    key: "createInputMatrix",
    value: function createInputMatrix() {}
  }, {
    key: "createOutputMatrix",
    value: function createOutputMatrix() {
      var model = this.model;
      var outputSize = this.outputSize;
      var lastHiddenSize = this.hiddenLayers[this.hiddenLayers.length - 1]; // whd

      model.outputConnector = new randomMatrix(outputSize, lastHiddenSize, 0.08); // bd

      model.output = new randomMatrix(outputSize, 1, 0.08);
    }
  }, {
    key: "bindEquation",
    value: function bindEquation() {
      var model = this.model;
      var hiddenLayers = this.hiddenLayers;
      var layers = model.hiddenLayers;
      var equation$1 = new equation();
      var outputs = [];
      var equationConnection = model.equationConnections.length > 0 ? model.equationConnections[model.equationConnections.length - 1] : this.initialLayerInputs; // 0 index

      var output = this.constructor.getEquation(equation$1, equation$1.input(new matrix(this.inputSize, 1)), equationConnection[0], layers[0]);
      outputs.push(output); // 1+ indices

      for (var i = 1, max = hiddenLayers.length; i < max; i++) {
        output = this.constructor.getEquation(equation$1, output, equationConnection[i], layers[i]);
        outputs.push(output);
      }

      model.equationConnections.push(outputs);
      equation$1.add(equation$1.multiply(model.outputConnector, output), model.output);
      model.equations.push(equation$1);
    }
  }, {
    key: "mapModel",
    value: function mapModel() {
      var model = this.model;
      var hiddenLayers = model.hiddenLayers;
      var allMatrices = model.allMatrices;
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new matrix(size, 1);
      });
      this.createHiddenLayers();
      if (!model.hiddenLayers.length) throw new Error('net.hiddenLayers not set');

      for (var i = 0, max = hiddenLayers.length; i < max; i++) {
        var hiddenMatrix = hiddenLayers[i];

        for (var property in hiddenMatrix) {
          if (!hiddenMatrix.hasOwnProperty(property)) continue;
          allMatrices.push(hiddenMatrix[property]);
        }
      }

      this.createOutputMatrix();
      if (!model.outputConnector) throw new Error('net.model.outputConnector not set');
      if (!model.output) throw new Error('net.model.output not set');
      allMatrices.push(model.outputConnector);
      allMatrices.push(model.output);
    }
  }, {
    key: "backpropagate",
    value: function backpropagate() {
      for (var i = this.model.equations.length - 1; i > -1; i--) {
        this.model.equations[i].backpropagate();
      }
    }
    /**
     *
     * @param {number[]|number[][]|object|object[][]} [rawInput]
     * @returns {number[]|number|object|object[]|object[][]}
     */

  }, {
    key: "run",
    value: function run(rawInput) {
      if (this.inputSize === 1) {
        if (this.outputLookup) {
          this.run = this.runObject;
          return this.runObject(rawInput);
        }

        this.run = this.runNumbers;
        return this.runNumbers(rawInput);
      }

      if (this.outputLookup) {
        this.run = this.runObjects;
        return this.runObjects(rawInput);
      }

      this.run = this.runArrays;
      return this.runArrays(rawInput);
    }
  }, {
    key: "forecast",
    value: function forecast(input, count) {
      if (this.inputSize === 1) {
        if (this.outputLookup) {
          this.forecast = this.runObject;
          return this.runObject(input);
        }

        this.forecast = this.forecastNumbers;
        return this.forecastNumbers(input, count);
      }

      if (this.outputLookup) {
        this.forecast = this.forecastObjects;
        return this.forecastObjects(input, count);
      }

      this.forecast = this.forecastArrays;
      return this.forecastArrays(input, count);
    }
    /**
     *
     * @param {Object[]|String[]} data an array of objects: `{input: 'string', output: 'string'}` or an array of strings
     * @param {Object} [options]
     * @returns {{error: number, iterations: number}}
     */

  }, {
    key: "train",
    value: function train(data) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      this.trainOpts = options = _objectSpread2(_objectSpread2({}, this.constructor.trainDefaults), options);
      var _options = options,
          iterations = _options.iterations;
      var _options2 = options,
          errorThresh = _options2.errorThresh;
      var log = options.log === true ? console.log : options.log;
      var _options3 = options,
          logPeriod = _options3.logPeriod;
      var _options4 = options,
          callback = _options4.callback;
      var _options5 = options,
          callbackPeriod = _options5.callbackPeriod;

      if (this.inputSize === 1 || !this.inputSize) {
        this.setSize(data);
      }

      data = this.formatData(data);
      var error = Infinity;
      var i;
      this.verifyIsInitialized(data);

      for (i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;

        for (var j = 0; j < data.length; j++) {
          var err = this.trainPattern(data[j], true);
          sum += err;
        }

        error = sum / data.length;
        if (isNaN(error)) throw new Error('Network error rate is unexpected NaN, check network configurations and try again. Most probably input format is not correct or training data is not enough. ');

        if (log && i % logPeriod === 0) {
          log("iterations: ".concat(i, ", training error: ").concat(error));
        }

        if (callback && i % callbackPeriod === 0) {
          callback({
            error: error,
            iterations: i
          });
        }
      }

      return {
        error: error,
        iterations: i
      };
    }
    /**
     *
     * @param data
     * Verifies network sizes are initialized
     * If they are not it will initialize them based off the data set.
     */

  }, {
    key: "verifyIsInitialized",
    value: function verifyIsInitialized(data) {
      if (data[0].input) {
        this.trainInput = this.trainInputOutput;
      } else if (data[0].length > 0) {
        if (data[0][0].length > 0) {
          this.trainInput = this.trainArrays;
        } else if (this.inputSize > 1) {
          this.trainInput = this.trainArrays;
        } else {
          this.trainInput = this.trainNumbers;
        }
      }

      if (!this.model) {
        this.initialize();
      }
    }
  }, {
    key: "setSize",
    value: function setSize(data) {
      var dataShape = lookup.dataShape(data).join(',');

      switch (dataShape) {
        case 'array,array,number':
        case 'array,object,number':
        case 'array,datum,array,number':
        case 'array,datum,object,number':
          // probably 1
          break;

        case 'array,array,array,number':
          this.inputSize = this.outputSize = data[0][0].length;
          break;

        case 'array,array,object,number':
          this.inputSize = this.outputSize = Object.keys(lookup.toTable2D(data)).length;
          break;

        case 'array,datum,array,array,number':
          this.inputSize = this.outputSize = data[0].input[0].length;
          break;

        case 'array,datum,array,object,number':
          this.inputSize = Object.keys(lookup.toInputTable2D(data)).length;
          this.outputSize = Object.keys(lookup.toOutputTable2D(data)).length;
          break;

        default:
          throw new Error('unknown data shape or configuration');
      }
    }
  }, {
    key: "trainNumbers",
    value: function trainNumbers(input) {
      var model = this.model;
      var equations = model.equations;

      while (equations.length < input.length) {
        this.bindEquation();
      }

      var errorSum = 0;

      for (var i = 0, max = input.length - 1; i < max; i++) {
        errorSum += equations[i].predictTarget([input[i]], [input[i + 1]]);
      }

      this.end();
      return errorSum / input.length;
    }
  }, {
    key: "runNumbers",
    value: function runNumbers(input) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;

      if (this.inputLookup) {
        input = lookup.toArray(this.inputLookup, input, this.inputLookupLength);
      }

      while (equations.length <= input.length) {
        this.bindEquation();
      }

      var lastOutput;

      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[i].runInput(new Float32Array([input[i]]));
      }

      this.end();
      return lastOutput.weights[0];
    }
  }, {
    key: "forecastNumbers",
    value: function forecastNumbers(input, count) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      var length = input.length + count;

      while (equations.length <= length) {
        this.bindEquation();
      }

      var lastOutput;
      var equationIndex = 0;

      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[equationIndex++].runInput([input[i]]);
      }

      var result = [lastOutput.weights[0]];

      for (var _i = 0, max = count - 1; _i < max; _i++) {
        lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
        result.push(lastOutput.weights[0]);
      }

      this.end();
      return result;
    }
  }, {
    key: "runObject",
    value: function runObject(input) {
      if (this.inputLookup === this.outputLookup) {
        var inputArray = lookup.toArrayShort(this.inputLookup, input);
        return lookup.toObjectPartial(this.outputLookup, this.forecastNumbers(inputArray, this.outputLookupLength - inputArray.length), inputArray.length);
      }

      return lookup.toObject(this.outputLookup, this.forecastNumbers(lookup.toArray(this.inputLookup, input, this.inputLookupLength), this.outputLookupLength));
    }
  }, {
    key: "runObjects",
    value: function runObjects(input) {
      var _this = this;

      input = input.map(function (value) {
        return lookup.toArray(_this.inputLookup, value, _this.inputLookupLength);
      });
      return this.forecastArrays(input, 1).map(function (value) {
        return lookup.toObject(_this.outputLookup, value);
      })[0];
    }
  }, {
    key: "forecastObjects",
    value: function forecastObjects(input, count) {
      var _this2 = this;

      input = input.map(function (value) {
        return lookup.toArray(_this2.inputLookup, value, _this2.inputLookupLength);
      });
      return this.forecastArrays(input, count).map(function (value) {
        return lookup.toObject(_this2.outputLookup, value);
      });
    }
  }, {
    key: "trainInputOutput",
    value: function trainInputOutput(object) {
      var model = this.model;
      var input = object.input;
      var output = object.output;
      var totalSize = input.length + output.length;
      var equations = model.equations;

      while (equations.length < totalSize) {
        this.bindEquation();
      }

      var errorSum = 0;
      var equationIndex = 0;

      for (var inputIndex = 0, max = input.length - 1; inputIndex < max; inputIndex++) {
        errorSum += equations[equationIndex++].predictTarget(input[inputIndex], input[inputIndex + 1]);
      }

      errorSum += equations[equationIndex++].predictTarget(input[input.length - 1], output[0]);

      for (var outputIndex = 0, _max = output.length - 1; outputIndex < _max; outputIndex++) {
        errorSum += equations[equationIndex++].predictTarget(output[outputIndex], output[outputIndex + 1]);
      }

      this.end();
      return errorSum / totalSize;
    }
  }, {
    key: "trainArrays",
    value: function trainArrays(input) {
      var model = this.model;
      var equations = model.equations;

      while (equations.length < input.length) {
        this.bindEquation();
      }

      var errorSum = 0;

      for (var i = 0, max = input.length - 1; i < max; i++) {
        errorSum += equations[i].predictTarget(input[i], input[i + 1]);
      }

      this.end();
      return errorSum / input.length;
    }
  }, {
    key: "runArrays",
    value: function runArrays(input) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;

      while (equations.length <= input.length) {
        this.bindEquation();
      }

      if (this.inputLookup) {
        input = lookup.toArrays(this.inputLookup, input, this.inputLookupLength);
      }

      var lastOutput;

      for (var i = 0; i < input.length; i++) {
        var outputMatrix = equations[i].runInput(input[i]);
        lastOutput = outputMatrix.weights;
      }

      this.end();

      if (this.outputLookup) {
        return lookup.toObject(this.outputLookup, lastOutput);
      }

      return lastOutput;
    }
  }, {
    key: "forecastArrays",
    value: function forecastArrays(input, count) {
      if (!this.isRunnable) return null;
      var model = this.model;
      var equations = model.equations;
      var length = input.length + count;

      while (equations.length <= length) {
        this.bindEquation();
      }

      var lastOutput;
      var equationIndex = 0;

      for (var i = 0; i < input.length; i++) {
        lastOutput = equations[equationIndex++].runInput(input[i]);
      }

      var result = [lastOutput.weights];

      for (var _i2 = 0, max = count - 1; _i2 < max; _i2++) {
        lastOutput = equations[equationIndex++].runInput(lastOutput.weights);
        result.push(lastOutput.weights.slice(0));
      }

      this.end();
      return result;
    }
  }, {
    key: "end",
    value: function end() {
      this.model.equations[this.model.equations.length - 1].runInput(new Float32Array(this.outputSize));
    }
    /**
     *
     * @param data
     * @returns {*}
     */

  }, {
    key: "formatData",
    value: function formatData(data) {
      var dataShape = lookup.dataShape(data).join(',');
      var result = [];

      switch (dataShape) {
        case 'array,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }

            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }

            for (var i = 0; i < data.length; i++) {
              result.push(Float32Array.from([data[i]]));
            }

            return [result];
          }

        case 'array,array,number':
          {
            if (this.inputSize === 1 && this.outputSize === 1) {
              for (var _i3 = 0; _i3 < data.length; _i3++) {
                result.push(arrayToFloat32Arrays$1(data[_i3]));
              }

              return result;
            }

            if (this.inputSize !== data[0].length) {
              throw new Error('inputSize must match data input size');
            }

            if (this.outputSize !== data[0].length) {
              throw new Error('outputSize must match data input size');
            }

            for (var _i4 = 0; _i4 < data.length; _i4++) {
              result.push(Float32Array.from(data[_i4]));
            }

            return [result];
          }

        case 'array,object,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }

            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }

            if (!this.inputLookup) {
              var lookupTable$1 = new lookupTable(data);
              this.inputLookup = this.outputLookup = lookupTable$1.table;
              this.inputLookupLength = this.outputLookupLength = lookupTable$1.length;
            }

            for (var _i5 = 0; _i5 < data.length; _i5++) {
              result.push(objectToFloat32Arrays$1(data[_i5]));
            }

            return result;
          }

        case 'array,datum,array,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }

            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }

            for (var _i6 = 0; _i6 < data.length; _i6++) {
              var datum = data[_i6];
              result.push({
                input: arrayToFloat32Arrays$1(datum.input),
                output: arrayToFloat32Arrays$1(datum.output)
              });
            }

            return result;
          }

        case 'array,datum,object,number':
          {
            if (this.inputSize !== 1) {
              throw new Error('inputSize must be 1 for this data size');
            }

            if (this.outputSize !== 1) {
              throw new Error('outputSize must be 1 for this data size');
            }

            if (!this.inputLookup) {
              var inputLookup = new lookupTable(data, 'input');
              this.inputLookup = inputLookup.table;
              this.inputLookupLength = inputLookup.length;
            }

            if (!this.outputLookup) {
              var outputLookup = new lookupTable(data, 'output');
              this.outputLookup = outputLookup.table;
              this.outputLookupLength = outputLookup.length;
            }

            for (var _i7 = 0; _i7 < data.length; _i7++) {
              var _datum = data[_i7];
              result.push({
                input: objectToFloat32Arrays$1(_datum.input),
                output: objectToFloat32Arrays$1(_datum.output)
              });
            }

            return result;
          }

        case 'array,array,array,number':
          {
            for (var _i8 = 0; _i8 < data.length; _i8++) {
              result.push(arraysToFloat32Arrays$1(data[_i8]));
            }

            return result;
          }

        case 'array,array,object,number':
          {
            if (!this.inputLookup) {
              var _lookupTable = new lookupTable(data);

              this.inputLookup = this.outputLookup = _lookupTable.table;
              this.inputLookupLength = this.outputLookupLength = _lookupTable.length;
            }

            for (var _i9 = 0; _i9 < data.length; _i9++) {
              var array = [];

              for (var j = 0; j < data[_i9].length; j++) {
                array.push(objectToFloat32Array$1(data[_i9][j], this.inputLookup, this.inputLookupLength));
              }

              result.push(array);
            }

            return result;
          }

        case 'array,datum,array,array,number':
          {
            if (this.inputSize === 1 && this.outputSize === 1) {
              for (var _i10 = 0; _i10 < data.length; _i10++) {
                var _datum2 = data[_i10];
                result.push({
                  input: Float32Array.from(_datum2.input),
                  output: Float32Array.from(_datum2.output)
                });
              }
            } else {
              if (this.inputSize !== data[0].input[0].length) {
                throw new Error('inputSize must match data input size');
              }

              if (this.outputSize !== data[0].output[0].length) {
                throw new Error('outputSize must match data output size');
              }

              for (var _i11 = 0; _i11 < data.length; _i11++) {
                var _datum3 = data[_i11];
                result.push({
                  input: arraysToFloat32Arrays$1(_datum3.input),
                  output: arraysToFloat32Arrays$1(_datum3.output)
                });
              }
            }

            return result;
          }

        case 'array,datum,array,object,number':
          {
            if (!this.inputLookup) {
              var _inputLookup = new arrayLookupTable(data, 'input');

              this.inputLookup = _inputLookup.table;
              this.inputLookupLength = _inputLookup.length;
            }

            if (!this.outputLookup) {
              var _outputLookup = new arrayLookupTable(data, 'output');

              this.outputLookup = _outputLookup.table;
              this.outputLookupLength = _outputLookup.length;
            }

            for (var _i12 = 0; _i12 < data.length; _i12++) {
              var _datum4 = data[_i12];
              result.push({
                input: objectsToFloat32Arrays$1(_datum4.input, this.inputLookup, this.inputLookupLength),
                output: objectsToFloat32Arrays$1(_datum4.output, this.outputLookup, this.outputLookupLength)
              });
            }

            return result;
          }

        default:
          throw new Error('unknown data shape or configuration');
      }
    }
    /**
     *
     * @param data
     * @returns {
     *  {
     *    error: number,
     *    misclasses: Array
     *  }
     * }
     */

  }, {
    key: "test",
    value: function test(data) {
      var formattedData = this.formatData(data); // for classification problems

      var misclasses = []; // run each pattern through the trained network and collect
      // error and misclassification statistics

      var errorSum = 0;
      var dataShape = lookup.dataShape(data).join(',');

      switch (dataShape) {
        case 'array,array,number':
          {
            if (this.inputSize === 1) {
              for (var i = 0; i < formattedData.length; i++) {
                var input = formattedData[i];
                var output = this.run(input.splice(0, input.length - 1));
                var target = input[input.length - 1][0];
                var error = target - output;
                var errorMSE = error * error;
                errorSum += errorMSE;
                var errorsAbs = Math.abs(errorMSE);

                if (errorsAbs > this.trainOpts.errorThresh) {
                  var misclass = data[i];
                  Object.assign(misclass, {
                    value: input,
                    actual: output
                  });
                  misclasses.push(misclass);
                }
              }

              break;
            }

            throw new Error('unknown data shape or configuration');
          }

        case 'array,array,array,number':
          {
            for (var _i13 = 0; _i13 < formattedData.length; _i13++) {
              var _input = formattedData[_i13];

              var _output = this.run(_input.splice(0, _input.length - 1));

              var _target = _input[_input.length - 1];
              var errors = 0;
              var errorCount = 0;

              for (var j = 0; j < _output.length; j++) {
                errorCount++;

                var _error = _target[j] - _output[j]; // mse


                errors += _error * _error;
              }

              errorSum += errors / errorCount;

              var _errorsAbs = Math.abs(errors);

              if (_errorsAbs > this.trainOpts.errorThresh) {
                var _misclass = data[_i13];
                misclasses.push({
                  value: _misclass,
                  actual: _output
                });
              }
            }

            break;
          }

        case 'array,object,number':
          {
            for (var _i14 = 0; _i14 < formattedData.length; _i14++) {
              var _input2 = formattedData[_i14];

              var _output2 = this.run(lookup.toObjectPartial(this.outputLookup, _input2, 0, _input2.length - 1));

              var _target2 = _input2[_input2.length - 1];
              var _errors = 0;
              var p = void 0; // for (p in output) {
              // }

              var _error2 = _target2[_i14] - _output2[p]; // mse


              _errors += _error2 * _error2;
              errorSum += _errors;

              var _errorsAbs2 = Math.abs(_errors);

              if (_errorsAbs2 > this.trainOpts.errorThresh) {
                var _misclass2 = data[_i14];
                misclasses.push({
                  value: _misclass2,
                  actual: _output2
                });
              }
            }

            break;
          }

        case 'array,array,object,number':
          {
            for (var _i15 = 0; _i15 < formattedData.length; _i15++) {
              var _input3 = formattedData[_i15];

              var _output3 = this.run(_input3.slice(0, _input3.length - 1));

              var _target3 = data[_i15][_input3.length - 1];
              var _errors2 = 0;
              var _errorCount = 0;

              for (var _p in _output3) {
                var _error3 = _target3[_p] - _output3[_p]; // mse


                _errors2 += _error3 * _error3;
                _errorCount++;
              }

              errorSum += _errors2 / _errorCount;

              var _errorsAbs3 = Math.abs(_errors2);

              if (_errorsAbs3 > this.trainOpts.errorThresh) {
                var _misclass3 = data[_i15];
                misclasses.push({
                  value: _misclass3,
                  actual: _output3
                });
              }
            }

            break;
          }

        case 'array,datum,array,number':
        case 'array,datum,object,number':
          {
            for (var _i16 = 0; _i16 < formattedData.length; _i16++) {
              var datum = formattedData[_i16];

              var _output4 = this.forecast(datum.input, datum.output.length);

              var _errors3 = 0;
              var _errorCount2 = 0;

              for (var _j = 0; _j < _output4.length; _j++) {
                var _error4 = datum.output[_j][0] - _output4[_j];

                _errors3 += _error4 * _error4;
                _errorCount2++;
              }

              errorSum += _errors3 / _errorCount2;

              var _errorsAbs4 = Math.abs(_errors3);

              if (_errorsAbs4 > this.trainOpts.errorThresh) {
                var _misclass4 = data[_i16];
                Object.assign(_misclass4, {
                  actual: this.outputLookup ? lookup.toObject(this.outputLookup, _output4) : _output4
                });
                misclasses.push(_misclass4);
              }
            }

            break;
          }

        case 'array,datum,array,array,number':
          {
            for (var _i17 = 0; _i17 < formattedData.length; _i17++) {
              var _datum5 = formattedData[_i17];

              var _output5 = this.forecast(_datum5.input, _datum5.output.length);

              var _errors4 = 0;

              for (var _j2 = 0; _j2 < _output5.length; _j2++) {
                for (var k = 0; k < _output5[_j2].length; k++) {
                  var _error5 = _datum5.output[_j2][k] - _output5[_j2][k];

                  _errors4 += _error5 * _error5;
                }
              }

              errorSum += _errors4;

              var _errorsAbs5 = Math.abs(_errors4);

              if (_errorsAbs5 > this.trainOpts.errorThresh) {
                var _misclass5 = data[_i17];
                misclasses.push({
                  input: _misclass5.input,
                  output: _misclass5.output,
                  actual: _output5
                });
              }
            }

            break;
          }

        case 'array,datum,array,object,number':
          {
            for (var _i18 = 0; _i18 < formattedData.length; _i18++) {
              var _datum6 = formattedData[_i18];

              var _output6 = this.forecast(_datum6.input, _datum6.output.length);

              var _errors5 = 0;

              for (var _j3 = 0; _j3 < _output6.length; _j3++) {
                for (var _p2 in _output6[_j3]) {
                  var _error6 = data[_i18].output[_j3][_p2] - _output6[_j3][_p2];

                  _errors5 += _error6 * _error6;
                }
              }

              errorSum += _errors5;

              var _errorsAbs6 = Math.abs(_errors5);

              if (_errorsAbs6 > this.trainOpts.errorThresh) {
                var _misclass6 = data[_i18];
                misclasses.push({
                  input: _misclass6.input,
                  output: _misclass6.output,
                  actual: _output6
                });
              }
            }

            break;
          }

        default:
          throw new Error('unknown data shape or configuration');
      }

      return {
        error: errorSum / formattedData.length,
        misclasses: misclasses,
        total: formattedData.length
      };
    }
  }, {
    key: "addFormat",
    value: function addFormat(value) {
      var dataShape = lookup.dataShape(value).join(',');

      switch (dataShape) {
        case 'array,array,number':
        case 'datum,array,array,number':
        case 'array,number':
        case 'datum,array,number':
          return;

        case 'datum,object,number':
          {
            this.inputLookup = lookup.addKeys(value.input, this.inputLookup);

            if (this.inputLookup) {
              this.inputLookupLength = Object.keys(this.inputLookup).length;
            }

            this.outputLookup = lookup.addKeys(value.output, this.outputLookup);

            if (this.outputLookup) {
              this.outputLookupLength = Object.keys(this.outputLookup).length;
            }

            break;
          }

        case 'object,number':
          {
            this.inputLookup = this.outputLookup = lookup.addKeys(value, this.inputLookup);

            if (this.inputLookup) {
              this.inputLookupLength = this.outputLookupLength = Object.keys(this.inputLookup).length;
            }

            break;
          }

        case 'array,object,number':
          {
            for (var i = 0; i < value.length; i++) {
              this.inputLookup = this.outputLookup = lookup.addKeys(value[i], this.inputLookup);

              if (this.inputLookup) {
                this.inputLookupLength = this.outputLookupLength = Object.keys(this.inputLookup).length;
              }
            }

            break;
          }

        case 'datum,array,object,number':
          {
            for (var _i19 = 0; _i19 < value.input.length; _i19++) {
              this.inputLookup = lookup.addKeys(value.input[_i19], this.inputLookup);

              if (this.inputLookup) {
                this.inputLookupLength = Object.keys(this.inputLookup).length;
              }
            }

            for (var _i20 = 0; _i20 < value.output.length; _i20++) {
              this.outputLookup = lookup.addKeys(value.output[_i20], this.outputLookup);

              if (this.outputLookup) {
                this.outputLookupLength = Object.keys(this.outputLookup).length;
              }
            }

            break;
          }

        default:
          throw new Error('unknown data shape or configuration');
      }
    }
    /**
     *
     * @returns {Object}
     */

  }, {
    key: "toJSON",
    value: function toJSON() {
      var defaults = this.constructor.defaults;

      if (!this.model) {
        this.initialize();
      }

      var model = this.model;
      var options = {};

      for (var p in defaults) {
        if (defaults.hasOwnProperty(p)) {
          options[p] = this[p];
        }
      }

      return {
        type: this.constructor.name,
        options: options,
        hiddenLayers: model.hiddenLayers.map(function (hiddenLayer) {
          var layers = {};

          for (var _p3 in hiddenLayer) {
            layers[_p3] = hiddenLayer[_p3].toJSON();
          }

          return layers;
        }),
        outputConnector: this.model.outputConnector.toJSON(),
        output: this.model.output.toJSON(),
        inputLookup: this.inputLookup,
        inputLookupLength: this.inputLookupLength,
        outputLookup: this.outputLookup,
        outputLookupLength: this.outputLookupLength
      };
    }
  }, {
    key: "fromJSON",
    value: function fromJSON(json) {
      var defaults = this.constructor.defaults;
      var options = json.options;
      this.model = null;
      this.hiddenLayers = null;
      var allMatrices = [];
      var hiddenLayers = []; // backward compatibility for hiddenSizes

      (json.hiddenLayers || json.hiddenSizes).forEach(function (hiddenLayer) {
        var layers = {};

        for (var p in hiddenLayer) {
          layers[p] = matrix.fromJSON(hiddenLayer[p]);
          allMatrices.push(layers[p]);
        }

        hiddenLayers.push(layers);
      });
      var outputConnector = matrix.fromJSON(json.outputConnector);
      allMatrices.push(outputConnector);
      var output = matrix.fromJSON(json.output);
      allMatrices.push(output);
      Object.assign(this, defaults, options); // backward compatibility

      if (options.hiddenSizes) {
        this.hiddenLayers = options.hiddenSizes;
      }

      this.inputLookup = json.inputLookup;
      this.inputLookupLength = json.inputLookupLength;
      this.outputLookup = json.outputLookup;
      this.outputLookupLength = json.outputLookupLength;
      this.model = {
        hiddenLayers: hiddenLayers,
        output: output,
        allMatrices: allMatrices,
        outputConnector: outputConnector,
        equations: [],
        equationConnections: []
      };
      this.initialLayerInputs = this.hiddenLayers.map(function (size) {
        return new matrix(size, 1);
      });
      this.bindEquation();
    }
    /**
     * @param {Function} [cb]
     * @returns {Function}
     */

  }, {
    key: "toFunction",
    value: function toFunction(cb) {
      var model = this.model;
      var equations = this.model.equations;
      var inputSize = this.inputSize;
      var inputLookup = this.inputLookup;
      var inputLookupLength = this.inputLookupLength;
      var outputLookup = this.outputLookup;
      var outputLookupLength = this.outputLookupLength;
      var equation = equations[1];
      var states = equation.states;
      var jsonString = JSON.stringify(this.toJSON());

      function previousConnectionIndex(m) {
        var connection = model.equationConnections[0];
        var states = equations[0].states;

        for (var i = 0, max = states.length; i < max; i++) {
          if (states[i].product === m) {
            return i;
          }
        }

        return connection.indexOf(m);
      }

      function matrixOrigin(m, stateIndex) {
        for (var i = 0, max = states.length; i < max; i++) {
          var state = states[i];

          if (i === stateIndex) {
            var j = previousConnectionIndex(m);

            switch (m) {
              case state.left:
                if (j > -1) {
                  return "typeof prevStates[".concat(j, "] === 'object' ? prevStates[").concat(j, "].product : new Matrix(").concat(m.rows, ", ").concat(m.columns, ")");
                }

              // eslint-disable-next-line no-fallthrough

              case state.right:
                if (j > -1) {
                  return "typeof prevStates[".concat(j, "] === 'object' ? prevStates[").concat(j, "].product : new Matrix(").concat(m.rows, ", ").concat(m.columns, ")");
                }

              // eslint-disable-next-line no-fallthrough

              case state.product:
                return "new Matrix(".concat(m.rows, ", ").concat(m.columns, ")");

              default:
                throw Error('unknown state');
            }
          }

          if (m === state.product) return "states[".concat(i, "].product");
          if (m === state.right) return "states[".concat(i, "].right");
          if (m === state.left) return "states[".concat(i, "].left");
        }
      }

      function matrixToString(m, stateIndex) {
        if (!m || !m.rows || !m.columns) return 'null';
        if (m === model.outputConnector) return "json.outputConnector";
        if (m === model.output) return "json.output";

        for (var i = 0, max = model.hiddenLayers.length; i < max; i++) {
          var hiddenLayer = model.hiddenLayers[i];

          for (var p in hiddenLayer) {
            if (!hiddenLayer.hasOwnProperty(p)) continue;
            if (hiddenLayer[p] !== m) continue;
            return "json.hiddenLayers[".concat(i, "].").concat(p);
          }
        }

        return matrixOrigin(m, stateIndex);
      }

      function formatInputData() {
        if (!inputLookup) return '';

        if (inputSize === 1) {
          if (inputLookup === outputLookup) {
            return "function lookupInput(input) {\n            var table = ".concat(JSON.stringify(inputLookup), ";\n            var result = [];\n            for (var p in table) {\n              if (!input.hasOwnProperty(p)) break;\n              result.push(Float32Array.from([input[p]]));\n            }\n            return result;\n          }");
          }

          return "function lookupInput(input) {\n          var table = ".concat(JSON.stringify(inputLookup), ";\n          var result = [];\n          for (var p in table) {\n            result.push(Float32Array.from([input[p]]));\n          }\n          return result;\n        }");
        }

        return "function lookupInput(rawInputs) {\n        var table = ".concat(JSON.stringify(inputLookup), ";\n        var result = [];\n        for (var i = 0; i < rawInputs.length; i++) {\n          var rawInput = rawInputs[i];\n          var input = new Float32Array(").concat(inputLookupLength, ");\n          for (var p in table) {\n            input[table[p]] = rawInput.hasOwnProperty(p) ? rawInput[p] : 0;\n          }\n          result.push(input);\n        }\n        return result;\n      }");
      }

      function formatOutputData() {
        if (!outputLookup) return '';

        if (inputSize === 1) {
          if (inputLookup === outputLookup) {
            return "function lookupOutputPartial(output, input) {\n            var table = ".concat(JSON.stringify(outputLookup), ";\n            var offset = input.length;\n            var result = {};\n            var i = 0;\n            for (var p in table) {\n              if (i++ < offset) continue;\n              result[p] = output[table[p] - offset][0];\n            }\n            return result;\n          }");
          }

          return "function lookupOutput(output) {\n          var table = ".concat(JSON.stringify(outputLookup), ";\n          var result = {};\n          for (var p in table) {\n            result[p] = output[table[p]][0];\n          }\n          return result;\n        }");
        }

        return "function lookupOutput(output) {\n        var table = ".concat(JSON.stringify(outputLookup), ";\n        var result = {};\n        for (var p in table) {\n          result[p] = output[table[p]];\n        }\n        return result;\n      }");
      }

      function toInner(fnString) {
        // crude, but should be sufficient for now
        // function() { body }
        fnString = fnString.toString().split('{');
        fnString.shift(); // body }

        fnString = fnString.join('{');
        fnString = fnString.split('}');
        fnString.pop(); // body

        return fnString.join('}').split('\n').join('\n        ').replace('product.weights = input.weights = this.inputValue;', inputLookup && inputSize === 1 ? 'product.weights = _i < input.length ? input[_i]: prevStates[prevStates.length - 1].product.weights;' : inputSize === 1 ? 'product.weights = [input[_i]];' : 'product.weights = input[_i];').replace('product.deltas[i] = 0;', '').replace('product.deltas[column] = 0;', '').replace('left.deltas[leftIndex] = 0;', '').replace('right.deltas[rightIndex] = 0;', '').replace('product.deltas = left.deltas.slice(0);', '');
      }

      function fileName(fnName) {
        return "src/recurrent/matrix/".concat(fnName.replace(/[A-Z]/g, function (value) {
          return "-".concat(value.toLowerCase());
        }), ".js");
      }

      var statesRaw = [];
      var usedFunctionNames = {};
      var innerFunctionsSwitch = [];

      for (var i = 0, max = states.length; i < max; i++) {
        var state = states[i];
        statesRaw.push("states[".concat(i, "] = {\n      name: '").concat(state.forwardFn.name, "',\n      left: ").concat(matrixToString(state.left, i), ",\n      right: ").concat(matrixToString(state.right, i), ",\n      product: ").concat(matrixToString(state.product, i), "\n    }"));
        var fnName = state.forwardFn.name;

        if (!usedFunctionNames[fnName]) {
          usedFunctionNames[fnName] = true;
          innerFunctionsSwitch.push("        case '".concat(fnName, "':").concat(fnName !== 'forwardFn' ? " //compiled from ".concat(fileName(fnName)) : '', "\n          ").concat(toInner(state.forwardFn.toString()), "\n          break;"));
        }
      }

      var forceForecast = this.inputSize === 1 && this.outputLookup;
      var src = "\n  var input = ".concat(this.inputLookup ? 'lookupInput(rawInput)' : 'rawInput', ";\n  var json = ").concat(jsonString, ";\n  var output = [];\n  var states = [];\n  var prevStates;\n  var state;\n  var max = ").concat(forceForecast ? inputLookup === outputLookup ? inputLookupLength : "input.length + ".concat(outputLookupLength - 1) : 'input.length', ";\n  for (var _i = 0; _i < max; _i++) {\n    prevStates = states;\n    states = [];\n    ").concat(statesRaw.join(';\n    '), ";\n    for (var stateIndex = 0, stateMax = ").concat(statesRaw.length, "; stateIndex < stateMax; stateIndex++) {\n      state = states[stateIndex];\n      var product = state.product;\n      var left = state.left;\n      var right = state.right;\n\n      switch (state.name) {\n").concat(innerFunctionsSwitch.join('\n'), "\n      }\n    }\n    ").concat(inputSize === 1 && inputLookup ? 'if (_i >= input.length - 1) { output.push(state.product.weights); }' : 'output = state.product.weights;', "\n  }\n  ").concat(outputLookup ? outputLookup === inputLookup ? 'return lookupOutputPartial(output, input)' : 'return lookupOutput(output)' : inputSize === 1 ? 'return output[0]' : 'return output', ";\n  ").concat(formatInputData(), "\n  ").concat(formatOutputData(), "\n\n  function Matrix(rows, columns) {\n    this.rows = rows;\n    this.columns = columns;\n    this.weights = zeros(rows * columns);\n  }\n  ").concat(zeros$c.toString(), "\n  ").concat(softmax.toString().replace('_2.default', 'Matrix'), "\n  ").concat(randomFloat$4.toString(), "\n  ").concat(sampleI.toString(), "\n  ").concat(maxI.toString()); // eslint-disable-next-line no-new-func

      return new Function('rawInput', cb ? cb(src) : src);
    }
  }]);

  return RNNTimeStep;
}(rnn);

RNNTimeStep.defaults = {
  inputSize: 1,
  hiddenLayers: [20],
  outputSize: 1,
  learningRate: rnn.defaults.learningRate,
  decayRate: rnn.defaults.decayRate,
  smoothEps: rnn.defaults.smoothEps,
  regc: rnn.defaults.regc,
  clipval: rnn.defaults.clipval
};
RNNTimeStep.trainDefaults = rnn.trainDefaults;
var rnnTimeStep = RNNTimeStep;

var GRUTimeStep = /*#__PURE__*/function (_RNNTimeStep) {
  _inherits(GRUTimeStep, _RNNTimeStep);

  var _super = _createSuper(GRUTimeStep);

  function GRUTimeStep() {
    _classCallCheck(this, GRUTimeStep);

    return _super.apply(this, arguments);
  }

  _createClass(GRUTimeStep, null, [{
    key: "getModel",
    value: function getModel(hiddenSize, prevSize) {
      return gru$1.getModel(hiddenSize, prevSize);
    }
    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: "getEquation",
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      return gru$1.getEquation(equation, inputMatrix, previousResult, hiddenLayer);
    }
  }]);

  return GRUTimeStep;
}(rnnTimeStep);

var gruTimeStep = GRUTimeStep;

var LSTM = /*#__PURE__*/function (_RNN) {
  _inherits(LSTM, _RNN);

  var _super = _createSuper(LSTM);

  function LSTM() {
    _classCallCheck(this, LSTM);

    return _super.apply(this, arguments);
  }

  _createClass(LSTM, null, [{
    key: "getModel",
    value: function getModel(hiddenSize, prevSize) {
      return {
        // gates parameters
        // wix
        inputMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wih
        inputHidden: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bi
        inputBias: new matrix(hiddenSize, 1),
        // wfx
        forgetMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wfh
        forgetHidden: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bf
        forgetBias: new matrix(hiddenSize, 1),
        // wox
        outputMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // woh
        outputHidden: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bo
        outputBias: new matrix(hiddenSize, 1),
        // cell write params
        // wcx
        cellActivationMatrix: new randomMatrix(hiddenSize, prevSize, 0.08),
        // wch
        cellActivationHidden: new randomMatrix(hiddenSize, hiddenSize, 0.08),
        // bc
        cellActivationBias: new matrix(hiddenSize, 1)
      };
    }
    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: "getEquation",
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      var sigmoid = equation.sigmoid.bind(equation);
      var add = equation.add.bind(equation);
      var multiply = equation.multiply.bind(equation);
      var multiplyElement = equation.multiplyElement.bind(equation);
      var tanh = equation.tanh.bind(equation);
      var inputGate = sigmoid(add(add(multiply(hiddenLayer.inputMatrix, inputMatrix), multiply(hiddenLayer.inputHidden, previousResult)), hiddenLayer.inputBias));
      var forgetGate = sigmoid(add(add(multiply(hiddenLayer.forgetMatrix, inputMatrix), multiply(hiddenLayer.forgetHidden, previousResult)), hiddenLayer.forgetBias)); // output gate

      var outputGate = sigmoid(add(add(multiply(hiddenLayer.outputMatrix, inputMatrix), multiply(hiddenLayer.outputHidden, previousResult)), hiddenLayer.outputBias)); // write operation on cells

      var cellWrite = tanh(add(add(multiply(hiddenLayer.cellActivationMatrix, inputMatrix), multiply(hiddenLayer.cellActivationHidden, previousResult)), hiddenLayer.cellActivationBias)); // compute new cell activation

      var retainCell = multiplyElement(forgetGate, previousResult); // what do we keep from cell

      var writeCell = multiplyElement(inputGate, cellWrite); // what do we write to cell

      var cell = add(retainCell, writeCell); // new cell contents
      // compute hidden state as gated, saturated cell activations

      return multiplyElement(outputGate, tanh(cell));
    }
  }]);

  return LSTM;
}(rnn);

var lstm = LSTM;

var LSTMTimeStep = /*#__PURE__*/function (_RNNTimeStep) {
  _inherits(LSTMTimeStep, _RNNTimeStep);

  var _super = _createSuper(LSTMTimeStep);

  function LSTMTimeStep() {
    _classCallCheck(this, LSTMTimeStep);

    return _super.apply(this, arguments);
  }

  _createClass(LSTMTimeStep, null, [{
    key: "getModel",
    value: function getModel(hiddenSize, prevSize) {
      return lstm.getModel.call(this, hiddenSize, prevSize);
    }
    /**
     *
     * @param {Equation} equation
     * @param {Matrix} inputMatrix
     * @param {Matrix} previousResult
     * @param {Object} hiddenLayer
     * @returns {Matrix}
     */

  }, {
    key: "getEquation",
    value: function getEquation(equation, inputMatrix, previousResult, hiddenLayer) {
      return lstm.getEquation.call(this, equation, inputMatrix, previousResult, hiddenLayer);
    }
  }]);

  return LSTMTimeStep;
}(rnnTimeStep);

var lstmTimeStep = LSTMTimeStep;

var domain;

// This constructor is used to store event handlers. Instantiating this is
// faster than explicitly calling `Object.create(null)` to get a "clean" empty
// object (tested with v8 v4.9).
function EventHandlers() {}
EventHandlers.prototype = Object.create(null);

function EventEmitter() {
  EventEmitter.init.call(this);
}

// nodejs oddity
// require('events') === require('events').EventEmitter
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.usingDomains = false;

EventEmitter.prototype.domain = undefined;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

EventEmitter.init = function() {
  this.domain = null;
  if (EventEmitter.usingDomains) {
    // if there is an active domain, then attach to it.
    if (domain.active ) ;
  }

  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
    this._events = new EventHandlers();
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events, domain;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  domain = this.domain;

  // If there is no 'error' event listener then throw.
  if (doError) {
    er = arguments[1];
    if (domain) {
      if (!er)
        er = new Error('Uncaught, unspecified "error" event');
      er.domainEmitter = this;
      er.domain = domain;
      er.domainThrown = false;
      domain.emit('error', er);
    } else if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
    // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
    // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = new EventHandlers();
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] :
                                          [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
                            existing.length + ' ' + type + ' listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        emitWarning(w);
      }
    }
  }

  return target;
}
function emitWarning(e) {
  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
}
EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function _onceWrap(target, type, listener) {
  var fired = false;
  function g() {
    target.removeListener(type, g);
    if (!fired) {
      fired = true;
      listener.apply(target, arguments);
    }
  }
  g.listener = listener;
  return g;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || (list.listener && list.listener === listener)) {
        if (--this._eventsCount === 0)
          this._events = new EventHandlers();
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length; i-- > 0;) {
          if (list[i] === listener ||
              (list[i].listener && list[i].listener === listener)) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (list.length === 1) {
          list[0] = undefined;
          if (--this._eventsCount === 0) {
            this._events = new EventHandlers();
            return this;
          } else {
            delete events[type];
          }
        } else {
          spliceOne(list, position);
        }

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = new EventHandlers();
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        for (var i = 0, key; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = new EventHandlers();
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        do {
          this.removeListener(type, listeners[listeners.length - 1]);
        } while (listeners[0]);
      }

      return this;
    };

EventEmitter.prototype.listeners = function listeners(type) {
  var evlistener;
  var ret;
  var events = this._events;

  if (!events)
    ret = [];
  else {
    evlistener = events[type];
    if (!evlistener)
      ret = [];
    else if (typeof evlistener === 'function')
      ret = [evlistener.listener || evlistener];
    else
      ret = unwrapListeners(evlistener);
  }

  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, i) {
  var copy = new Array(i);
  while (i--)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

var global$1 = (typeof global !== "undefined" ? global :
            typeof self !== "undefined" ? self :
            typeof window !== "undefined" ? window : {});

var lookup$1 = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
var inited = false;
function init () {
  inited = true;
  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup$1[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;
}

function toByteArray (b64) {
  if (!inited) {
    init();
  }
  var i, j, l, tmp, placeHolders, arr;
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

  // base64 is 4/3 + up to two characters of the original data
  arr = new Arr(len * 3 / 4 - placeHolders);

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len;

  var L = 0;

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
    arr[L++] = (tmp >> 16) & 0xFF;
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[L++] = tmp & 0xFF;
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[L++] = (tmp >> 8) & 0xFF;
    arr[L++] = tmp & 0xFF;
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup$1[num >> 18 & 0x3F] + lookup$1[num >> 12 & 0x3F] + lookup$1[num >> 6 & 0x3F] + lookup$1[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
    output.push(tripletToBase64(tmp));
  }
  return output.join('')
}

function fromByteArray (uint8) {
  if (!inited) {
    init();
  }
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var output = '';
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    output += lookup$1[tmp >> 2];
    output += lookup$1[(tmp << 4) & 0x3F];
    output += '==';
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
    output += lookup$1[tmp >> 10];
    output += lookup$1[(tmp >> 4) & 0x3F];
    output += lookup$1[(tmp << 2) & 0x3F];
    output += '=';
  }

  parts.push(output);

  return parts.join('')
}

function read (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? (nBytes - 1) : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << (-nBits)) - 1);
  s >>= (-nBits);
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1);
  e >>= (-nBits);
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

function write (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
  var i = isLE ? 0 : (nBytes - 1);
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128;
}

var toString$1 = {}.toString;

var isArray = Array.isArray || function (arr) {
  return toString$1.call(arr) == '[object Array]';
};

var INSPECT_MAX_BYTES = 50;

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
  ? global$1.TYPED_ARRAY_SUPPORT
  : true;

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length);
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length);
    }
    that.length = length;
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192; // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype;
  return arr
};

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
};

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size);
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
};

function allocUnsafe (that, size) {
  assertSize(size);
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0;
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
};
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
};

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8';
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0;
  that = createBuffer(that, length);

  var actual = that.write(string, encoding);

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual);
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0;
  that = createBuffer(that, length);
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255;
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array);
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset);
  } else {
    array = new Uint8Array(array, byteOffset, length);
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array;
    that.__proto__ = Buffer.prototype;
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array);
  }
  return that
}

function fromObject (that, obj) {
  if (internalIsBuffer(obj)) {
    var len = checked(obj.length) | 0;
    that = createBuffer(that, len);

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len);
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}
Buffer.isBuffer = isBuffer;
function internalIsBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length;
  var y = b.length;

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i];
      y = b[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
};

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i;
  if (length === undefined) {
    length = 0;
    for (i = 0; i < list.length; ++i) {
      length += list[i].length;
    }
  }

  var buffer = Buffer.allocUnsafe(length);
  var pos = 0;
  for (i = 0; i < list.length; ++i) {
    var buf = list[i];
    if (!internalIsBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos);
    pos += buf.length;
  }
  return buffer
};

function byteLength (string, encoding) {
  if (internalIsBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string;
  }

  var len = string.length;
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
}
Buffer.byteLength = byteLength;

function slowToString (encoding, start, end) {
  var loweredCase = false;

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0;
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length;
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0;
  start >>>= 0;

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8';

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase();
        loweredCase = true;
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true;

function swap (b, n, m) {
  var i = b[n];
  b[n] = b[m];
  b[m] = i;
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length;
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1);
  }
  return this
};

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length;
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3);
    swap(this, i + 1, i + 2);
  }
  return this
};

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length;
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7);
    swap(this, i + 1, i + 6);
    swap(this, i + 2, i + 5);
    swap(this, i + 3, i + 4);
  }
  return this
};

Buffer.prototype.toString = function toString () {
  var length = this.length | 0;
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
};

Buffer.prototype.equals = function equals (b) {
  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
};

Buffer.prototype.inspect = function inspect () {
  var str = '';
  var max = INSPECT_MAX_BYTES;
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
    if (this.length > max) str += ' ... ';
  }
  return '<Buffer ' + str + '>'
};

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!internalIsBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0;
  }
  if (end === undefined) {
    end = target ? target.length : 0;
  }
  if (thisStart === undefined) {
    thisStart = 0;
  }
  if (thisEnd === undefined) {
    thisEnd = this.length;
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0;
  end >>>= 0;
  thisStart >>>= 0;
  thisEnd >>>= 0;

  if (this === target) return 0

  var x = thisEnd - thisStart;
  var y = end - start;
  var len = Math.min(x, y);

  var thisCopy = this.slice(thisStart, thisEnd);
  var targetCopy = target.slice(start, end);

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i];
      y = targetCopy[i];
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
};

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset;
    byteOffset = 0;
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff;
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000;
  }
  byteOffset = +byteOffset;  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1);
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1;
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0;
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding);
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (internalIsBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf$1(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF; // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf$1(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf$1 (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1;
  var arrLength = arr.length;
  var valLength = val.length;

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase();
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2;
      arrLength /= 2;
      valLength /= 2;
      byteOffset /= 2;
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i;
  if (dir) {
    var foundIndex = -1;
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i;
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex;
        foundIndex = -1;
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
    for (i = byteOffset; i >= 0; i--) {
      var found = true;
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false;
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
};

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
};

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
};

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0;
  var remaining = buf.length - offset;
  if (!length) {
    length = remaining;
  } else {
    length = Number(length);
    if (length > remaining) {
      length = remaining;
    }
  }

  // must be an even number of digits
  var strLen = string.length;
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2;
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16);
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed;
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8';
    length = this.length;
    offset = 0;
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset;
    length = this.length;
    offset = 0;
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0;
    if (isFinite(length)) {
      length = length | 0;
      if (encoding === undefined) encoding = 'utf8';
    } else {
      encoding = length;
      length = undefined;
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset;
  if (length === undefined || length > remaining) length = remaining;

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8';

  var loweredCase = false;
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase();
        loweredCase = true;
    }
  }
};

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
};

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return fromByteArray(buf)
  } else {
    return fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end);
  var res = [];

  var i = start;
  while (i < end) {
    var firstByte = buf[i];
    var codePoint = null;
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1;

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint;

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte;
          }
          break
        case 2:
          secondByte = buf[i + 1];
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 3:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint;
            }
          }
          break
        case 4:
          secondByte = buf[i + 1];
          thirdByte = buf[i + 2];
          fourthByte = buf[i + 3];
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint;
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD;
      bytesPerSequence = 1;
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000;
      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
      codePoint = 0xDC00 | codePoint & 0x3FF;
    }

    res.push(codePoint);
    i += bytesPerSequence;
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000;

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length;
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = '';
  var i = 0;
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    );
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F);
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = '';
  end = Math.min(buf.length, end);

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i]);
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length;

  if (!start || start < 0) start = 0;
  if (!end || end < 0 || end > len) end = len;

  var out = '';
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i]);
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end);
  var res = '';
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length;
  start = ~~start;
  end = end === undefined ? len : ~~end;

  if (start < 0) {
    start += len;
    if (start < 0) start = 0;
  } else if (start > len) {
    start = len;
  }

  if (end < 0) {
    end += len;
    if (end < 0) end = 0;
  } else if (end > len) {
    end = len;
  }

  if (end < start) end = start;

  var newBuf;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end);
    newBuf.__proto__ = Buffer.prototype;
  } else {
    var sliceLen = end - start;
    newBuf = new Buffer(sliceLen, undefined);
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start];
    }
  }

  return newBuf
};

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }

  return val
};

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length);
  }

  var val = this[offset + --byteLength];
  var mul = 1;
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul;
  }

  return val
};

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  return this[offset]
};

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return this[offset] | (this[offset + 1] << 8)
};

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  return (this[offset] << 8) | this[offset + 1]
};

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
};

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
};

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var val = this[offset];
  var mul = 1;
  var i = 0;
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) checkOffset(offset, byteLength, this.length);

  var i = byteLength;
  var mul = 1;
  var val = this[offset + --i];
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul;
  }
  mul *= 0x80;

  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

  return val
};

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length);
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
};

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset] | (this[offset + 1] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length);
  var val = this[offset + 1] | (this[offset] << 8);
  return (val & 0x8000) ? val | 0xFFFF0000 : val
};

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
};

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
};

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, true, 23, 4)
};

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length);
  return read(this, offset, false, 23, 4)
};

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, true, 52, 8)
};

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length);
  return read(this, offset, false, 52, 8)
};

function checkInt (buf, value, offset, ext, max, min) {
  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var mul = 1;
  var i = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  byteLength = byteLength | 0;
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
    checkInt(this, value, offset, byteLength, maxBytes, 0);
  }

  var i = byteLength - 1;
  var mul = 1;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  this[offset] = (value & 0xff);
  return offset + 1
};

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8;
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1;
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24);
    this[offset + 2] = (value >>> 16);
    this[offset + 1] = (value >>> 8);
    this[offset] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = 0;
  var mul = 1;
  var sub = 0;
  this[offset] = value & 0xFF;
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1);

    checkInt(this, value, offset, byteLength, limit - 1, -limit);
  }

  var i = byteLength - 1;
  var mul = 1;
  var sub = 0;
  this[offset + i] = value & 0xFF;
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1;
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
  }

  return offset + byteLength
};

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
  if (value < 0) value = 0xff + value + 1;
  this[offset] = (value & 0xff);
  return offset + 1
};

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
  } else {
    objectWriteUInt16(this, value, offset, true);
  }
  return offset + 2
};

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8);
    this[offset + 1] = (value & 0xff);
  } else {
    objectWriteUInt16(this, value, offset, false);
  }
  return offset + 2
};

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff);
    this[offset + 1] = (value >>> 8);
    this[offset + 2] = (value >>> 16);
    this[offset + 3] = (value >>> 24);
  } else {
    objectWriteUInt32(this, value, offset, true);
  }
  return offset + 4
};

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value;
  offset = offset | 0;
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
  if (value < 0) value = 0xffffffff + value + 1;
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24);
    this[offset + 1] = (value >>> 16);
    this[offset + 2] = (value >>> 8);
    this[offset + 3] = (value & 0xff);
  } else {
    objectWriteUInt32(this, value, offset, false);
  }
  return offset + 4
};

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4);
  }
  write(buf, value, offset, littleEndian, 23, 4);
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
};

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
};

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8);
  }
  write(buf, value, offset, littleEndian, 52, 8);
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
};

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
};

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0;
  if (!end && end !== 0) end = this.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  var len = end - start;
  var i;

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start];
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start];
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    );
  }

  return len
};

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start;
      start = 0;
      end = this.length;
    } else if (typeof end === 'string') {
      encoding = end;
      end = this.length;
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0);
      if (code < 256) {
        val = code;
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255;
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0;
  end = end === undefined ? this.length : end >>> 0;

  if (!val) val = 0;

  var i;
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val;
    }
  } else {
    var bytes = internalIsBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString());
    var len = bytes.length;
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len];
    }
  }

  return this
};

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '=';
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity;
  var codePoint;
  var length = string.length;
  var leadSurrogate = null;
  var bytes = [];

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i);

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          continue
        }

        // valid lead
        leadSurrogate = codePoint;

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
        leadSurrogate = codePoint;
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
    }

    leadSurrogate = null;

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint);
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      );
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF);
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo;
  var byteArray = [];
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i);
    hi = c >> 8;
    lo = c % 256;
    byteArray.push(lo);
    byteArray.push(hi);
  }

  return byteArray
}


function base64ToBytes (str) {
  return toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i];
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}


// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
function isBuffer(obj) {
  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
}

function isFastBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
}

// shim for using process in browser
// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
var cachedSetTimeout = defaultSetTimout;
var cachedClearTimeout = defaultClearTimeout;
if (typeof global$1.setTimeout === 'function') {
    cachedSetTimeout = setTimeout;
}
if (typeof global$1.clearTimeout === 'function') {
    cachedClearTimeout = clearTimeout;
}

function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue$1 = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue$1 = currentQueue.concat(queue$1);
    } else {
        queueIndex = -1;
    }
    if (queue$1.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue$1.length;
    while(len) {
        currentQueue = queue$1;
        queue$1 = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue$1.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}
function nextTick(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue$1.push(new Item(fun, args));
    if (queue$1.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
}
// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};

// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
var performance = global$1.performance || {};
var performanceNow =
  performance.now        ||
  performance.mozNow     ||
  performance.msNow      ||
  performance.oNow       ||
  performance.webkitNow  ||
  function(){ return (new Date()).getTime() };

var inherits;
if (typeof Object.create === 'function'){
  inherits = function inherits(ctor, superCtor) {
    // implementation from standard node.js 'util' module
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  inherits = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  };
}
var inherits$1 = inherits;

var formatRegExp = /%[sdj%]/g;
function format(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
}

// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
function deprecate(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global$1.process)) {
    return function() {
      return deprecate(fn, msg).apply(this, arguments);
    };
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

var debugs = {};
var debugEnviron;
function debuglog(set) {
  if (isUndefined(debugEnviron))
    debugEnviron =  '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = 0;
      debugs[set] = function() {
        var msg = format.apply(null, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
}

/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    _extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}

// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray$1(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty$1(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty$1(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var length = output.reduce(function(prev, cur) {
    if (cur.indexOf('\n') >= 0) ;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray$1(ar) {
  return Array.isArray(ar);
}

function isBoolean(arg) {
  return typeof arg === 'boolean';
}

function isNull(arg) {
  return arg === null;
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isString(arg) {
  return typeof arg === 'string';
}

function isUndefined(arg) {
  return arg === void 0;
}

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}

function isFunction(arg) {
  return typeof arg === 'function';
}

function objectToString(o) {
  return Object.prototype.toString.call(o);
}

function _extend(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
}
function hasOwnProperty$1(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

function BufferList() {
  this.head = null;
  this.tail = null;
  this.length = 0;
}

BufferList.prototype.push = function (v) {
  var entry = { data: v, next: null };
  if (this.length > 0) this.tail.next = entry;else this.head = entry;
  this.tail = entry;
  ++this.length;
};

BufferList.prototype.unshift = function (v) {
  var entry = { data: v, next: this.head };
  if (this.length === 0) this.tail = entry;
  this.head = entry;
  ++this.length;
};

BufferList.prototype.shift = function () {
  if (this.length === 0) return;
  var ret = this.head.data;
  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
  --this.length;
  return ret;
};

BufferList.prototype.clear = function () {
  this.head = this.tail = null;
  this.length = 0;
};

BufferList.prototype.join = function (s) {
  if (this.length === 0) return '';
  var p = this.head;
  var ret = '' + p.data;
  while (p = p.next) {
    ret += s + p.data;
  }return ret;
};

BufferList.prototype.concat = function (n) {
  if (this.length === 0) return Buffer.alloc(0);
  if (this.length === 1) return this.head.data;
  var ret = Buffer.allocUnsafe(n >>> 0);
  var p = this.head;
  var i = 0;
  while (p) {
    p.data.copy(ret, i);
    i += p.data.length;
    p = p.next;
  }
  return ret;
};

// Copyright Joyent, Inc. and other Node contributors.
var isBufferEncoding = Buffer.isEncoding
  || function(encoding) {
       switch (encoding && encoding.toLowerCase()) {
         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
         default: return false;
       }
     };


function assertEncoding(encoding) {
  if (encoding && !isBufferEncoding(encoding)) {
    throw new Error('Unknown encoding: ' + encoding);
  }
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters. CESU-8 is handled as part of the UTF-8 encoding.
//
// @TODO Handling all encodings inside a single object makes it very difficult
// to reason about this code, so it should be split up in the future.
// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
// points as used by CESU-8.
function StringDecoder(encoding) {
  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
  assertEncoding(encoding);
  switch (this.encoding) {
    case 'utf8':
      // CESU-8 represents each of Surrogate Pair by 3-bytes
      this.surrogateSize = 3;
      break;
    case 'ucs2':
    case 'utf16le':
      // UTF-16 represents each of Surrogate Pair by 2-bytes
      this.surrogateSize = 2;
      this.detectIncompleteChar = utf16DetectIncompleteChar;
      break;
    case 'base64':
      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
      this.surrogateSize = 3;
      this.detectIncompleteChar = base64DetectIncompleteChar;
      break;
    default:
      this.write = passThroughWrite;
      return;
  }

  // Enough space to store all bytes of a single character. UTF-8 needs 4
  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
  this.charBuffer = new Buffer(6);
  // Number of bytes received for the current incomplete multi-byte character.
  this.charReceived = 0;
  // Number of bytes expected for the current incomplete multi-byte character.
  this.charLength = 0;
}

// write decodes the given buffer and returns it as JS string that is
// guaranteed to not contain any partial multi-byte characters. Any partial
// character found at the end of the buffer is buffered up, and will be
// returned when calling write again with the remaining bytes.
//
// Note: Converting a Buffer containing an orphan surrogate to a String
// currently works, but converting a String to a Buffer (via `new Buffer`, or
// Buffer#write) will replace incomplete surrogates with the unicode
// replacement character. See https://codereview.chromium.org/121173009/ .
StringDecoder.prototype.write = function(buffer) {
  var charStr = '';
  // if our last write ended with an incomplete multibyte character
  while (this.charLength) {
    // determine how many remaining bytes this buffer has to offer for this char
    var available = (buffer.length >= this.charLength - this.charReceived) ?
        this.charLength - this.charReceived :
        buffer.length;

    // add the new bytes to the char buffer
    buffer.copy(this.charBuffer, this.charReceived, 0, available);
    this.charReceived += available;

    if (this.charReceived < this.charLength) {
      // still not enough chars in this buffer? wait for more ...
      return '';
    }

    // remove bytes belonging to the current character from the buffer
    buffer = buffer.slice(available, buffer.length);

    // get the character that was split
    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
    var charCode = charStr.charCodeAt(charStr.length - 1);
    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
      this.charLength += this.surrogateSize;
      charStr = '';
      continue;
    }
    this.charReceived = this.charLength = 0;

    // if there are no more bytes in this buffer, just emit our char
    if (buffer.length === 0) {
      return charStr;
    }
    break;
  }

  // determine and set charLength / charReceived
  this.detectIncompleteChar(buffer);

  var end = buffer.length;
  if (this.charLength) {
    // buffer the incomplete character bytes we got
    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
    end -= this.charReceived;
  }

  charStr += buffer.toString(this.encoding, 0, end);

  var end = charStr.length - 1;
  var charCode = charStr.charCodeAt(end);
  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
    var size = this.surrogateSize;
    this.charLength += size;
    this.charReceived += size;
    this.charBuffer.copy(this.charBuffer, size, 0, size);
    buffer.copy(this.charBuffer, 0, 0, size);
    return charStr.substring(0, end);
  }

  // or just emit the charStr
  return charStr;
};

// detectIncompleteChar determines if there is an incomplete UTF-8 character at
// the end of the given buffer. If so, it sets this.charLength to the byte
// length that character, and sets this.charReceived to the number of bytes
// that are available for this character.
StringDecoder.prototype.detectIncompleteChar = function(buffer) {
  // determine how many bytes we have to check at the end of this buffer
  var i = (buffer.length >= 3) ? 3 : buffer.length;

  // Figure out if one of the last i bytes of our buffer announces an
  // incomplete char.
  for (; i > 0; i--) {
    var c = buffer[buffer.length - i];

    // See http://en.wikipedia.org/wiki/UTF-8#Description

    // 110XXXXX
    if (i == 1 && c >> 5 == 0x06) {
      this.charLength = 2;
      break;
    }

    // 1110XXXX
    if (i <= 2 && c >> 4 == 0x0E) {
      this.charLength = 3;
      break;
    }

    // 11110XXX
    if (i <= 3 && c >> 3 == 0x1E) {
      this.charLength = 4;
      break;
    }
  }
  this.charReceived = i;
};

StringDecoder.prototype.end = function(buffer) {
  var res = '';
  if (buffer && buffer.length)
    res = this.write(buffer);

  if (this.charReceived) {
    var cr = this.charReceived;
    var buf = this.charBuffer;
    var enc = this.encoding;
    res += buf.slice(0, cr).toString(enc);
  }

  return res;
};

function passThroughWrite(buffer) {
  return buffer.toString(this.encoding);
}

function utf16DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 2;
  this.charLength = this.charReceived ? 2 : 0;
}

function base64DetectIncompleteChar(buffer) {
  this.charReceived = buffer.length % 3;
  this.charLength = this.charReceived ? 3 : 0;
}

Readable.ReadableState = ReadableState;

var debug = debuglog('stream');
inherits$1(Readable, EventEmitter);

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') {
    return emitter.prependListener(event, fn);
  } else {
    // This is a hack to make sure that our error handler is attached before any
    // userland ones.  NEVER DO THIS. This is here only because this code needs
    // to continue to work with older versions of Node.js that do not include
    // the prependListener() method. The goal is to eventually remove this hack.
    if (!emitter._events || !emitter._events[event])
      emitter.on(event, fn);
    else if (Array.isArray(emitter._events[event]))
      emitter._events[event].unshift(fn);
    else
      emitter._events[event] = [fn, emitter._events[event]];
  }
}
function listenerCount$1 (emitter, type) {
  return emitter.listeners(type).length;
}
function ReadableState(options, stream) {

  options = options || {};

  // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

  // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()
  this.buffer = new BufferList();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.
  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // when piping, we only care about 'readable' events that happen
  // after read()ing all the bytes and not getting any pushback.
  this.ranOut = false;

  // the number of writers that are awaiting a drain event in .pipe()s
  this.awaitDrain = 0;

  // if true, a maybeReadMore has been scheduled
  this.readingMore = false;

  this.decoder = null;
  this.encoding = null;
  if (options.encoding) {
    this.decoder = new StringDecoder(options.encoding);
    this.encoding = options.encoding;
  }
}
function Readable(options) {

  if (!(this instanceof Readable)) return new Readable(options);

  this._readableState = new ReadableState(options, this);

  // legacy
  this.readable = true;

  if (options && typeof options.read === 'function') this._read = options.read;

  EventEmitter.call(this);
}

// Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.
Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;

  if (!state.objectMode && typeof chunk === 'string') {
    encoding = encoding || state.defaultEncoding;
    if (encoding !== state.encoding) {
      chunk = Buffer.from(chunk, encoding);
      encoding = '';
    }
  }

  return readableAddChunk(this, state, chunk, encoding, false);
};

// Unshift should *always* be something directly out of read()
Readable.prototype.unshift = function (chunk) {
  var state = this._readableState;
  return readableAddChunk(this, state, chunk, '', true);
};

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
};

function readableAddChunk(stream, state, chunk, encoding, addToFront) {
  var er = chunkInvalid(state, chunk);
  if (er) {
    stream.emit('error', er);
  } else if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else if (state.objectMode || chunk && chunk.length > 0) {
    if (state.ended && !addToFront) {
      var e = new Error('stream.push() after EOF');
      stream.emit('error', e);
    } else if (state.endEmitted && addToFront) {
      var _e = new Error('stream.unshift() after end event');
      stream.emit('error', _e);
    } else {
      var skipAdd;
      if (state.decoder && !addToFront && !encoding) {
        chunk = state.decoder.write(chunk);
        skipAdd = !state.objectMode && chunk.length === 0;
      }

      if (!addToFront) state.reading = false;

      // Don't add to the buffer if we've decoded to an empty string chunk and
      // we're not in object mode
      if (!skipAdd) {
        // if we want the data now, just emit it.
        if (state.flowing && state.length === 0 && !state.sync) {
          stream.emit('data', chunk);
          stream.read(0);
        } else {
          // update the buffer info.
          state.length += state.objectMode ? 1 : chunk.length;
          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

          if (state.needReadable) emitReadable(stream);
        }
      }

      maybeReadMore(stream, state);
    }
  } else if (!addToFront) {
    state.reading = false;
  }

  return needMoreData(state);
}

// if it's past the high water mark, we can push in some more.
// Also, if we have no data yet, we can stand some
// more bytes.  This is to work around cases where hwm=0,
// such as the repl.  Also, if the push() triggered a
// readable event, and the user called read(largeNumber) such that
// needReadable was set, then we ought to push more, so that another
// 'readable' event will be triggered.
function needMoreData(state) {
  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
}

// backwards compatibility.
Readable.prototype.setEncoding = function (enc) {
  this._readableState.decoder = new StringDecoder(enc);
  this._readableState.encoding = enc;
  return this;
};

// Don't raise the hwm > 8MB
var MAX_HWM = 0x800000;
function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }
  return n;
}

// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;
  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  }
  // If we're asking for more than the current hwm, then raise the hwm.
  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n;
  // Don't have enough
  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }
  return state.length;
}

// you can override either this method, or the async _read(n) below.
Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;

  if (n !== 0) state.emittedReadable = false;

  // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.
  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state);

  // if we've ended, and we're now clear, then finish it up.
  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  }

  // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.

  // if we need a readable event, then we need to do some reading.
  var doRead = state.needReadable;
  debug('need readable', doRead);

  // if we currently have less than the highWaterMark, then also read some
  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  }

  // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.
  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true;
    // if the length is currently zero, then we *need* a readable event.
    if (state.length === 0) state.needReadable = true;
    // call internal read method
    this._read(state.highWaterMark);
    state.sync = false;
    // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.
    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = true;
    n = 0;
  } else {
    state.length -= n;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true;

    // If we tried to read() past the EOF, then emit end on the next tick.
    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);

  return ret;
};

function chunkInvalid(state, chunk) {
  var er = null;
  if (!isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  return er;
}

function onEofChunk(stream, state) {
  if (state.ended) return;
  if (state.decoder) {
    var chunk = state.decoder.end();
    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }
  state.ended = true;

  // emit 'readable' now to make sure it gets picked up.
  emitReadable(stream);
}

// Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.
function emitReadable(stream) {
  var state = stream._readableState;
  state.needReadable = false;
  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
  }
}

function emitReadable_(stream) {
  debug('emit readable');
  stream.emit('readable');
  flow(stream);
}

// at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.
function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  var len = state.length;
  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length)
      // didn't get any data, stop spinning.
      break;else len = state.length;
  }
  state.readingMore = false;
}

// abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.
Readable.prototype._read = function (n) {
  this.emit('error', new Error('not implemented'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;
    case 1:
      state.pipes = [state.pipes, dest];
      break;
    default:
      state.pipes.push(dest);
      break;
  }
  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

  var doEnd = (!pipeOpts || pipeOpts.end !== false);

  var endFn = doEnd ? onend : cleanup;
  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

  dest.on('unpipe', onunpipe);
  function onunpipe(readable) {
    debug('onunpipe');
    if (readable === src) {
      cleanup();
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  }

  // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.
  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);

  var cleanedUp = false;
  function cleanup() {
    debug('cleanup');
    // cleanup event handlers once the pipe is broken
    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', cleanup);
    src.removeListener('data', ondata);

    cleanedUp = true;

    // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.
    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  // If the user pushes more data while we're writing to dest then we'll end up
  // in ondata again. However, we only want to increase awaitDrain once because
  // dest will only emit one 'drain' event for the multiple writes.
  // => Introduce a guard on increasing awaitDrain.
  var increasedAwaitDrain = false;
  src.on('data', ondata);
  function ondata(chunk) {
    debug('ondata');
    increasedAwaitDrain = false;
    var ret = dest.write(chunk);
    if (false === ret && !increasedAwaitDrain) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', src._readableState.awaitDrain);
        src._readableState.awaitDrain++;
        increasedAwaitDrain = true;
      }
      src.pause();
    }
  }

  // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.
  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
  }

  // Make sure our error handler is attached before userland ones.
  prependListener(dest, 'error', onerror);

  // Both close and finish should trigger unpipe, but only once.
  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }
  dest.once('close', onclose);
  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }
  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  }

  // tell the dest that it's being piped to
  dest.emit('pipe', src);

  // start the flow if it hasn't been started already.
  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function () {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;
    if (state.awaitDrain === 0 && src.listeners('data').length) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;

  // if we're not piping anywhere, then do nothing.
  if (state.pipesCount === 0) return this;

  // just one destination.  most common case.
  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;

    if (!dest) dest = state.pipes;

    // got a match.
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this);
    return this;
  }

  // slow case. multiple pipe destinations.

  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var _i = 0; _i < len; _i++) {
      dests[_i].emit('unpipe', this);
    }return this;
  }

  // try to find the right one.
  var i = indexOf(state.pipes, dest);
  if (i === -1) return this;

  state.pipes.splice(i, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];

  dest.emit('unpipe', this);

  return this;
};

// set up data events if they are asked for
// Ensure readable listeners eventually get something
Readable.prototype.on = function (ev, fn) {
  var res = EventEmitter.prototype.on.call(this, ev, fn);

  if (ev === 'data') {
    // Start flowing on next tick if stream isn't explicitly paused
    if (this._readableState.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    var state = this._readableState;
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.emittedReadable = false;
      if (!state.reading) {
        nextTick(nReadingNextTick, this);
      } else if (state.length) {
        emitReadable(this);
      }
    }
  }

  return res;
};
Readable.prototype.addListener = Readable.prototype.on;

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
}

// pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.
Readable.prototype.resume = function () {
  var state = this._readableState;
  if (!state.flowing) {
    debug('resume');
    state.flowing = true;
    resume(this, state);
  }
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  if (!state.reading) {
    debug('resume read 0');
    stream.read(0);
  }

  state.resumeScheduled = false;
  state.awaitDrain = 0;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);
  if (false !== this._readableState.flowing) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);
  while (state.flowing && stream.read() !== null) {}
}

// wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.
Readable.prototype.wrap = function (stream) {
  var state = this._readableState;
  var paused = false;

  var self = this;
  stream.on('end', function () {
    debug('wrapped end');
    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) self.push(chunk);
    }

    self.push(null);
  });

  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk);

    // don't skip over falsy values in objectMode
    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = self.push(chunk);
    if (!ret) {
      paused = true;
      stream.pause();
    }
  });

  // proxy all the other methods.
  // important when wrapping filters and duplexes.
  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function (method) {
        return function () {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  }

  // proxy certain important events.
  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
  forEach(events, function (ev) {
    stream.on(ev, self.emit.bind(self, ev));
  });

  // when we try to consume some more bytes, simply unpause the
  // underlying stream.
  self._read = function (n) {
    debug('wrapped _read', n);
    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return self;
};

// exposed for testing purposes only.
Readable._fromList = fromList;

// Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;

  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = fromListPartial(n, state.buffer, state.decoder);
  }

  return ret;
}

// Extracts only enough buffered data to satisfy the amount requested.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function fromListPartial(n, list, hasStrings) {
  var ret;
  if (n < list.head.data.length) {
    // slice is the same for buffers and strings
    ret = list.head.data.slice(0, n);
    list.head.data = list.head.data.slice(n);
  } else if (n === list.head.data.length) {
    // first chunk is a perfect match
    ret = list.shift();
  } else {
    // result spans more than one buffer
    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
  }
  return ret;
}

// Copies a specified amount of characters from the list of buffered data
// chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBufferString(n, list) {
  var p = list.head;
  var c = 1;
  var ret = p.data;
  n -= ret.length;
  while (p = p.next) {
    var str = p.data;
    var nb = n > str.length ? str.length : n;
    if (nb === str.length) ret += str;else ret += str.slice(0, n);
    n -= nb;
    if (n === 0) {
      if (nb === str.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = str.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

// Copies a specified amount of bytes from the list of buffered data chunks.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.
function copyFromBuffer(n, list) {
  var ret = Buffer.allocUnsafe(n);
  var p = list.head;
  var c = 1;
  p.data.copy(ret);
  n -= p.data.length;
  while (p = p.next) {
    var buf = p.data;
    var nb = n > buf.length ? buf.length : n;
    buf.copy(ret, ret.length - n, 0, nb);
    n -= nb;
    if (n === 0) {
      if (nb === buf.length) {
        ++c;
        if (p.next) list.head = p.next;else list.head = list.tail = null;
      } else {
        list.head = p;
        p.data = buf.slice(nb);
      }
      break;
    }
    ++c;
  }
  list.length -= c;
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;

  // If we get here before consuming all the bytes, then that is a
  // bug in node.  Should never happen.
  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

  if (!state.endEmitted) {
    state.ended = true;
    nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  // Check that we didn't get one last unshift.
  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');
  }
}

function forEach(xs, f) {
  for (var i = 0, l = xs.length; i < l; i++) {
    f(xs[i], i);
  }
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }
  return -1;
}

// A bit simpler than readable streams.
Writable.WritableState = WritableState;
inherits$1(Writable, EventEmitter);

function nop() {}

function WriteReq(chunk, encoding, cb) {
  this.chunk = chunk;
  this.encoding = encoding;
  this.callback = cb;
  this.next = null;
}

function WritableState(options, stream) {
  Object.defineProperty(this, 'buffer', {
    get: deprecate(function () {
      return this.getBuffer();
    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
  });
  options = options || {};

  // object stream flag to indicate whether or not this stream
  // contains buffers or objects.
  this.objectMode = !!options.objectMode;

  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

  // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()
  var hwm = options.highWaterMark;
  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

  // cast to ints.
  this.highWaterMark = ~ ~this.highWaterMark;

  this.needDrain = false;
  // at the start of calling end()
  this.ending = false;
  // when end() has been called, and returned
  this.ended = false;
  // when 'finish' is emitted
  this.finished = false;

  // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.
  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode;

  // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.
  this.defaultEncoding = options.defaultEncoding || 'utf8';

  // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.
  this.length = 0;

  // a flag to see when we're in the middle of a write.
  this.writing = false;

  // when true all writes will be buffered until .uncork() call
  this.corked = 0;

  // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.
  this.sync = true;

  // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.
  this.bufferProcessing = false;

  // the callback that's passed to _write(chunk,cb)
  this.onwrite = function (er) {
    onwrite(stream, er);
  };

  // the callback that the user supplies to write(chunk,encoding,cb)
  this.writecb = null;

  // the amount that is being written when _write is called.
  this.writelen = 0;

  this.bufferedRequest = null;
  this.lastBufferedRequest = null;

  // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted
  this.pendingcb = 0;

  // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams
  this.prefinished = false;

  // True if the error was already emitted and should not be thrown again
  this.errorEmitted = false;

  // count buffered requests
  this.bufferedRequestCount = 0;

  // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two
  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function writableStateGetBuffer() {
  var current = this.bufferedRequest;
  var out = [];
  while (current) {
    out.push(current);
    current = current.next;
  }
  return out;
};
function Writable(options) {

  // Writable ctor is applied to Duplexes, though they're not
  // instanceof Writable, they're instanceof Readable.
  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

  this._writableState = new WritableState(options, this);

  // legacy.
  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;

    if (typeof options.writev === 'function') this._writev = options.writev;
  }

  EventEmitter.call(this);
}

// Otherwise people can pipe Writable streams, which is just wrong.
Writable.prototype.pipe = function () {
  this.emit('error', new Error('Cannot pipe, not readable'));
};

function writeAfterEnd(stream, cb) {
  var er = new Error('write after end');
  // TODO: defer error events consistently everywhere, not just the cb
  stream.emit('error', er);
  nextTick(cb, er);
}

// If we get something that is not a buffer, string, null, or undefined,
// and we're not in objectMode, then that's an error.
// Otherwise stream chunks are all considered to be of length=1, and the
// watermarks determine how many objects to keep in the buffer, rather than
// how many bytes or characters.
function validChunk(stream, state, chunk, cb) {
  var valid = true;
  var er = false;
  // Always throw error if a null is written
  // if we are not in object mode then throw
  // if it is not a buffer, string, or undefined.
  if (chunk === null) {
    er = new TypeError('May not write null values to stream');
  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new TypeError('Invalid non-string/buffer chunk');
  }
  if (er) {
    stream.emit('error', er);
    nextTick(cb, er);
    valid = false;
  }
  return valid;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

  if (typeof cb !== 'function') cb = nop;

  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, chunk, encoding, cb);
  }

  return ret;
};

Writable.prototype.cork = function () {
  var state = this._writableState;

  state.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;

    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer.from(chunk, encoding);
  }
  return chunk;
}

// if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.
function writeOrBuffer(stream, state, chunk, encoding, cb) {
  chunk = decodeChunk(state, chunk, encoding);

  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
  var len = state.objectMode ? 1 : chunk.length;

  state.length += len;

  var ret = state.length < state.highWaterMark;
  // we must ensure that previous needDrain will not be reset to false.
  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }
    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;
  if (sync) nextTick(cb, er);else cb(er);

  stream._writableState.errorEmitted = true;
  stream.emit('error', er);
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;

  onwriteStateUpdate(state);

  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state);

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      /*<replacement>*/
        nextTick(afterWrite, stream, state, finished, cb);
      /*</replacement>*/
    } else {
        afterWrite(stream, state, finished, cb);
      }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
}

// Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.
function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
}

// if there's something in the buffer waiting, then process it
function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;

    var count = 0;
    while (entry) {
      buffer[count] = entry;
      entry = entry.next;
      count += 1;
    }

    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

    // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite
    state.pendingcb++;
    state.lastBufferedRequest = null;
    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;

      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.
      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequestCount = 0;
  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new Error('not implemented'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

  // .end() fully uncorks
  if (state.corked) {
    state.corked = 1;
    this.uncork();
  }

  // ignore unnecessary end() calls.
  if (!state.ending && !state.finished) endWritable(this, state, cb);
};

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function prefinish(stream, state) {
  if (!state.prefinished) {
    state.prefinished = true;
    stream.emit('prefinish');
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);
  if (need) {
    if (state.pendingcb === 0) {
      prefinish(stream, state);
      state.finished = true;
      stream.emit('finish');
    } else {
      prefinish(stream, state);
    }
  }
  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);
  if (cb) {
    if (state.finished) nextTick(cb);else stream.once('finish', cb);
  }
  state.ended = true;
  stream.writable = false;
}

// It seems a linked list but it is not
// there will be only 2 of these for each stream
function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function (err) {
    var entry = _this.entry;
    _this.entry = null;
    while (entry) {
      var cb = entry.callback;
      state.pendingcb--;
      cb(err);
      entry = entry.next;
    }
    if (state.corkedRequestsFree) {
      state.corkedRequestsFree.next = _this;
    } else {
      state.corkedRequestsFree = _this;
    }
  };
}

inherits$1(Duplex, Readable);

var keys$1 = Object.keys(Writable.prototype);
for (var v = 0; v < keys$1.length; v++) {
  var method = keys$1[v];
  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
}
function Duplex(options) {
  if (!(this instanceof Duplex)) return new Duplex(options);

  Readable.call(this, options);
  Writable.call(this, options);

  if (options && options.readable === false) this.readable = false;

  if (options && options.writable === false) this.writable = false;

  this.allowHalfOpen = true;
  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

  this.once('end', onend);
}

// the no-half-open enforcer
function onend() {
  // if we allow half-open state, or if the writable side ended,
  // then we're ok.
  if (this.allowHalfOpen || this._writableState.ended) return;

  // no more data can be written.
  // But allow more writes to happen in this tick.
  nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

// a transform stream is a readable/writable stream where you do
inherits$1(Transform, Duplex);

function TransformState(stream) {
  this.afterTransform = function (er, data) {
    return afterTransform(stream, er, data);
  };

  this.needTransform = false;
  this.transforming = false;
  this.writecb = null;
  this.writechunk = null;
  this.writeencoding = null;
}

function afterTransform(stream, er, data) {
  var ts = stream._transformState;
  ts.transforming = false;

  var cb = ts.writecb;

  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

  ts.writechunk = null;
  ts.writecb = null;

  if (data !== null && data !== undefined) stream.push(data);

  cb(er);

  var rs = stream._readableState;
  rs.reading = false;
  if (rs.needReadable || rs.length < rs.highWaterMark) {
    stream._read(rs.highWaterMark);
  }
}
function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);

  Duplex.call(this, options);

  this._transformState = new TransformState(this);

  // when the writable side finishes, then flush out anything remaining.
  var stream = this;

  // start out asking for a readable event once data is transformed.
  this._readableState.needReadable = true;

  // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.
  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;

    if (typeof options.flush === 'function') this._flush = options.flush;
  }

  this.once('prefinish', function () {
    if (typeof this._flush === 'function') this._flush(function (er) {
      done(stream, er);
    });else done(stream);
  });
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return Duplex.prototype.push.call(this, chunk, encoding);
};

// This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.
Transform.prototype._transform = function (chunk, encoding, cb) {
  throw new Error('Not implemented');
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;
  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
};

// Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.
Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
    ts.transforming = true;
    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

function done(stream, er) {
  if (er) return stream.emit('error', er);

  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided
  var ws = stream._writableState;
  var ts = stream._transformState;

  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

  if (ts.transforming) throw new Error('Calling transform done when still transforming');

  return stream.push(null);
}

inherits$1(PassThrough, Transform);
function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);

  Transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

inherits$1(Stream, EventEmitter);
Stream.Readable = Readable;
Stream.Writable = Writable;
Stream.Duplex = Duplex;
Stream.Transform = Transform;
Stream.PassThrough = PassThrough;

// Backwards-compat with node 0.4.x
Stream.Stream = Stream;

// old-style streams.  Note that the pipe method (the only relevant
// part of this class) is overridden in the Readable class.

function Stream() {
  EventEmitter.call(this);
}

Stream.prototype.pipe = function(dest, options) {
  var source = this;

  function ondata(chunk) {
    if (dest.writable) {
      if (false === dest.write(chunk) && source.pause) {
        source.pause();
      }
    }
  }

  source.on('data', ondata);

  function ondrain() {
    if (source.readable && source.resume) {
      source.resume();
    }
  }

  dest.on('drain', ondrain);

  // If the 'end' option is not supplied, dest.end() will be called when
  // source gets the 'end' or 'close' events.  Only dest.end() once.
  if (!dest._isStdio && (!options || options.end !== false)) {
    source.on('end', onend);
    source.on('close', onclose);
  }

  var didOnEnd = false;
  function onend() {
    if (didOnEnd) return;
    didOnEnd = true;

    dest.end();
  }


  function onclose() {
    if (didOnEnd) return;
    didOnEnd = true;

    if (typeof dest.destroy === 'function') dest.destroy();
  }

  // don't leave dangling pipes when there are errors.
  function onerror(er) {
    cleanup();
    if (EventEmitter.listenerCount(this, 'error') === 0) {
      throw er; // Unhandled stream error in pipe.
    }
  }

  source.on('error', onerror);
  dest.on('error', onerror);

  // remove all the event listeners that were added.
  function cleanup() {
    source.removeListener('data', ondata);
    dest.removeListener('drain', ondrain);

    source.removeListener('end', onend);
    source.removeListener('close', onclose);

    source.removeListener('error', onerror);
    dest.removeListener('error', onerror);

    source.removeListener('end', cleanup);
    source.removeListener('close', cleanup);

    dest.removeListener('close', cleanup);
  }

  source.on('end', cleanup);
  source.on('close', cleanup);

  dest.on('close', cleanup);

  dest.emit('pipe', source);

  // Allow for unix-like usage: A.pipe(B).pipe(C)
  return dest;
};

var stream = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': Stream,
  Readable: Readable,
  Writable: Writable,
  Duplex: Duplex,
  Transform: Transform,
  PassThrough: PassThrough,
  Stream: Stream
});

var Writable$1 = stream.Writable;
/**
 *
 * @param opts
 * @returns {TrainStream}
 * @constructor
 */

var TrainStream = /*#__PURE__*/function (_Writable) {
  _inherits(TrainStream, _Writable);

  var _super = _createSuper(TrainStream);

  function TrainStream(options) {
    var _this;

    _classCallCheck(this, TrainStream);

    _this = _super.call(this, {
      objectMode: true
    });
    options = options || {}; // require the neuralNetwork

    if (!options.neuralNetwork) {
      throw new Error('No neural network specified. PLease see lis of available networks types: https://github.com/BrainJS/brain.js#neural-network-types');
    }

    var _options = options,
        neuralNetwork = _options.neuralNetwork;
    _this.neuralNetwork = neuralNetwork;
    _this.dataFormatDetermined = false;
    _this.i = 0; // keep track of internal iterations

    _this.size = 0;
    _this.count = 0;
    _this.sum = 0;
    _this.floodCallback = options.floodCallback;
    _this.doneTrainingCallback = options.doneTrainingCallback; // inherit trainOpts settings from neuralNetwork

    neuralNetwork.updateTrainingOptions(options);
    var trainOpts = neuralNetwork.trainOpts;
    _this.iterations = trainOpts.iterations;
    _this.errorThresh = trainOpts.errorThresh;
    _this.log = trainOpts.log;
    _this.logPeriod = trainOpts.logPeriod;
    _this.callbackPeriod = trainOpts.callbackPeriod;
    _this.callback = trainOpts.callback;

    _this.on('finish', _this.finishStreamIteration.bind(_assertThisInitialized(_this)));

    return _this;
  }

  _createClass(TrainStream, [{
    key: "endInputs",
    value: function endInputs() {
      this.write(false);
    }
    /**
     * _write expects data to be in the form of a datum. ie. {input: {a: 1 b: 0}, output: {z: 0}}
     * @param chunk
     * @param enc
     * @param next
     * @returns {*}
     * @private
     */

  }, {
    key: "_write",
    value: function _write(chunk, enc, next) {
      if (!chunk) {
        // check for the end of one iteration of the stream
        this.emit('finish');
        return next();
      }

      if (!this.dataFormatDetermined) {
        this.size++;
        this.neuralNetwork.addFormat(chunk);
        this.firstDatum = this.firstDatum || chunk;
        return next();
      }

      this.count++;
      var data = this.neuralNetwork.formatData(chunk);
      this.sum += this.neuralNetwork.trainPattern(data[0], true); // tell the Readable Stream that we are ready for more data

      next();
    }
    /**
     *
     * @returns {*}
     */

  }, {
    key: "finishStreamIteration",
    value: function finishStreamIteration() {
      if (this.dataFormatDetermined && this.size !== this.count) {
        this.log("This iteration's data length was different from the first.");
      }

      if (!this.dataFormatDetermined) {
        var data = this.neuralNetwork.formatData(this.firstDatum);
        this.neuralNetwork.verifyIsInitialized(data);
        this.dataFormatDetermined = true;

        if (typeof this.floodCallback === 'function') {
          this.floodCallback();
        }

        return;
      }

      var error = this.sum / this.size;

      if (this.log && this.i % this.logPeriod === 0) {
        this.log("iterations: ".concat(this.i, ", training error: ").concat(error));
      }

      if (this.callback && this.i % this.callbackPeriod === 0) {
        this.callback({
          error: error,
          iterations: this.i
        });
      }

      this.sum = 0;
      this.count = 0; // update the iterations

      this.i++; // do a check here to see if we need the stream again

      if (this.i < this.iterations && error > this.errorThresh) {
        if (typeof this.floodCallback === 'function') {
          return this.floodCallback();
        }
      } else {
        // done training
        if (typeof this.doneTrainingCallback === 'function') {
          return this.doneTrainingCallback({
            error: error,
            iterations: this.i
          });
        }
      }
    }
  }]);

  return TrainStream;
}(Writable$1);

var trainStream = TrainStream;

var FeedForward$2 = feedForward$1.FeedForward;
var Recurrent$1 = recurrent.Recurrent;
var recurrentZeros$1 = recurrentZeros_1.recurrentZeros;
var recurrentJSONTypes = ['RNN', 'LSTM', 'GRU', 'RNNTimeStep', 'LSTMTimeStep', 'GRUTimeStep', 'Recurrent'];

function drawInput(_ref) {
  var pixelX = _ref.pixelX,
      pixelY = _ref.pixelY,
      radius = _ref.radius,
      inputs = _ref.inputs,
      row = _ref.row,
      line = _ref.line,
      fontSize = _ref.fontSize,
      fontClassName = _ref.fontClassName;
  var svg = "<rect\n              x=\"".concat(pixelX / 2 - radius, "\"\n              y=\"").concat(pixelY / 2 + row * pixelY - radius, "\"\n              width=\"").concat(2 * radius, "\"\n              height=\"").concat(2 * radius, "\"\n              stroke=\"black\"\n              stroke-width=\"1\"\n              fill=\"").concat(inputs.color, "\"\n              class=\"").concat(inputs.className, "\" />\n            <line\n              x1=\"").concat(pixelX / 4, "\"\n              y1=\"").concat(pixelY / 2 + row * pixelY, "\"\n              x2=\"").concat(pixelX / 2 - radius, "\"\n              y2=\"").concat(pixelY / 2 + row * pixelY, "\"\n              style=\"stroke:").concat(line.color, ";stroke-width:").concat(line.width, "\"\n              class=\"").concat(line.className, "\" />");

  if (inputs.labels) {
    svg += "<text\n              x=\"".concat(pixelX / 8, "\"\n              y=\"").concat(pixelY / 2 + row * pixelY - 5, "\"\n              fill=\"black\"\n              font-size=\"").concat(fontSize, "\"\n              class=\"").concat(fontClassName, "\">").concat(inputs.labels[row], "</text>");
  }

  return svg;
}

function drawNeuron(_ref2) {
  var pixelX = _ref2.pixelX,
      pixelY = _ref2.pixelY,
      row = _ref2.row,
      column = _ref2.column,
      radius = _ref2.radius,
      hidden = _ref2.hidden;
  return "<circle\n            cx=\"".concat(pixelX / 2 + column * pixelX, "\"\n            cy=\"").concat(pixelY / 2 + row * pixelY, "\"\n            r=\"").concat(radius, "\"\n            stroke=\"black\"\n            stroke-width=\"1\"\n            fill=\"").concat(hidden.color, "\"\n            class=\"").concat(hidden.className, "\" />");
}

function drawOutput(_ref3) {
  var pixelX = _ref3.pixelX,
      pixelY = _ref3.pixelY,
      row = _ref3.row,
      column = _ref3.column,
      line = _ref3.line,
      outputs = _ref3.outputs,
      radius = _ref3.radius;
  return "<circle\n            cx=\"".concat(pixelX / 2 + column * pixelX, "\"\n            cy=\"").concat(pixelY / 2 + row * pixelY, "\"\n            r=\"").concat(radius, "\"\n            stroke=\"black\"\n            stroke-width=\"1\"\n            fill=\"").concat(outputs.color, "\"\n            class=\"").concat(outputs.className, "\" />\n          <line\n            x1=\"").concat(pixelX / 2 + column * pixelX + radius, "\"\n            y1=\"").concat(pixelY / 2 + row * pixelY, "\"\n            x2=\"").concat(pixelX / 2 + column * pixelX + pixelX / 4, "\"\n            y2=\"").concat(pixelY / 2 + row * pixelY, "\"\n            style=\"stroke:").concat(line.color, ";stroke-width:").concat(line.width, "\"\n            class=\"").concat(line.className, "\" />");
}

function drawBackwardConnections(_ref4) {
  var pixelX = _ref4.pixelX,
      pixelY = _ref4.pixelY,
      row = _ref4.row,
      column = _ref4.column,
      radius = _ref4.radius,
      lineY = _ref4.lineY,
      line = _ref4.line,
      previousConnectionIndex = _ref4.previousConnectionIndex;
  return "<line\n            x1=\"".concat(pixelX / 2 + (column - 1) * pixelX + radius, "\"\n            y1=\"").concat(lineY / 2 + previousConnectionIndex * lineY, "\"\n            x2=\"").concat(pixelX / 2 + column * pixelX - radius, "\"\n            y2=\"").concat(pixelY / 2 + row * pixelY, "\"\n            style=\"stroke:").concat(line.color, ";stroke-width:").concat(line.width, "\"\n            class=\"").concat(line.className, "\" />");
}

function neuralNetworkToSVG(options) {
  var sizes = options.sizes,
      height = options.height,
      width = options.width;
  var svg = '';
  var pixelX = width / sizes.length;

  for (var column = 0; column < sizes.length; column++) {
    var size = sizes[column];
    var pixelY = height / size;

    for (var row = 0; row < size; row++) {
      if (column === 0) {
        svg += drawInput(Object.assign({
          pixelX: pixelX,
          pixelY: pixelY,
          row: row,
          column: column
        }, options));
      } else {
        if (column === sizes.length - 1) {
          svg += drawOutput(Object.assign({
            pixelX: pixelX,
            pixelY: pixelY,
            row: row,
            column: column
          }, options));
        } else {
          svg += drawNeuron(Object.assign({
            pixelX: pixelX,
            pixelY: pixelY,
            row: row,
            column: column
          }, options));
        }

        var previousSize = sizes[column - 1];
        var lineY = height / previousSize;

        for (var previousConnectionIndex = 0; previousConnectionIndex < previousSize; previousConnectionIndex++) {
          svg += drawBackwardConnections(Object.assign({
            pixelX: pixelX,
            pixelY: pixelY,
            row: row,
            column: column,
            lineY: lineY,
            previousConnectionIndex: previousConnectionIndex
          }, options));
        }
      }
    }
  }

  return svg;
}

function drawRecurrentConnections(_ref5) {
  var pixelX = _ref5.pixelX,
      pixelY = _ref5.pixelY,
      row = _ref5.row,
      column = _ref5.column,
      radius = _ref5.radius,
      recurrentLine = _ref5.recurrentLine;
  var moveX = pixelX / 2 + column * pixelX + radius + 1;
  var moveY = pixelY / 2 + row * pixelY;
  var x = moveX - radius * 2 - 2;
  var y = moveY;
  var x1 = x + 100;
  var y1 = y + 50;
  var x2 = moveX - 100;
  var y2 = moveY + 50;
  return "<path\n              d=\"M ".concat(moveX, " ").concat(moveY, " C ").concat(x1, " ").concat(y1, ", ").concat(x2, " ").concat(y2, ", ").concat(x, " ").concat(y, "\"\n              stroke=\"").concat(recurrentLine.color, "\"\n              stroke-width=\"").concat(recurrentLine.width, "\"\n              fill=\"transparent\"\n              stroke-linecap=\"round\"\n              marker-end=\"url(#arrow)\"\n              class=\"").concat(recurrentLine.className, "\" />");
}

function rnnToSVG(options) {
  var width = options.width,
      height = options.height,
      recurrentLine = options.recurrentLine,
      sizes = options.sizes,
      radius = options.radius;
  var pixelX = width / sizes.length;
  var svg = "<defs>\n              <marker id=\"arrow\" markerWidth=\"10\" markerHeight=\"10\" refX=\"8\" refY=\"3\" orient=\"auto\" markerUnits=\"strokeWidth\">\n                <path d=\"M0,0 L0,6 L9,3 z\" fill=\"".concat(recurrentLine.color, "\" />\n              </marker>\n            </defs>");
  svg += neuralNetworkToSVG(options);

  for (var column = 1; column < sizes.length; column++) {
    var size = sizes[column];
    var pixelY = height / size;

    for (var row = 0; row < size; row++) {
      svg += drawRecurrentConnections({
        pixelX: pixelX,
        pixelY: pixelY,
        row: row,
        column: column,
        radius: radius,
        recurrentLine: recurrentLine
      });
    }
  }

  return svg;
}

function getFeedForwardLayers(network) {
  var inputLayer = network.inputLayer();
  var hiddenLayers = [];
  hiddenLayers.push(network.hiddenLayers[0](inputLayer));

  for (var i = 1; i < network.hiddenLayers.length; i++) {
    hiddenLayers.push(network.hiddenLayers[i](hiddenLayers[i - 1]));
  }

  var outputLayer = network.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
  return {
    inputLayer: inputLayer,
    hiddenLayers: hiddenLayers,
    outputLayer: outputLayer,
    layerCount: 1 + hiddenLayers.length + 1
  };
}

function getRecurrentLayers(network) {
  var inputLayer = network.inputLayer();
  var hiddenLayers = [];
  hiddenLayers.push(network.hiddenLayers[0](inputLayer, recurrentZeros$1(), 0));

  for (var i = 1; i < network.hiddenLayers.length; i++) {
    hiddenLayers.push(network.hiddenLayers[i](hiddenLayers[i - 1], recurrentZeros$1(), i));
  }

  var outputLayer = network.outputLayer(hiddenLayers[hiddenLayers.length - 1]);
  return {
    inputLayer: inputLayer,
    hiddenLayers: hiddenLayers,
    outputLayer: outputLayer,
    layerCount: 1 + hiddenLayers.length + 1
  };
}

function wrapSVG(svgBody, width, height) {
  return "<svg\n            xmlns=\"http://www.w3.org/2000/svg\"\n            xmlns:xlink=\"http://www.w3.org/1999/xlink\"\n            version=\"1.1\"\n            width=\"".concat(width, "\"\n            height=\"").concat(height, "\">").concat(svgBody, "</svg>");
}

function getSizes(_ref6) {
  var sizes = _ref6.sizes,
      inputSize = _ref6.inputSize,
      outputSize = _ref6.outputSize,
      hiddenLayers = _ref6.hiddenLayers;
  return typeof inputSize === 'number' && Array.isArray(hiddenLayers) && hiddenLayers.every(function (l) {
    return typeof l === 'number';
  }) && typeof outputSize === 'number' ? [inputSize].concat(hiddenLayers).concat([outputSize]) : sizes;
}

function toSVG(net, options) {
  // default values
  var defaultOptions = {
    line: {
      width: 0.5,
      color: 'black',
      className: 'connection'
    },
    recurrentLine: {
      width: 1,
      color: 'red',
      className: 'recurrence'
    },
    inputs: {
      color: 'rgba(0, 128, 0, 0.5)',
      labels: null,
      className: 'input'
    },
    outputs: {
      color: 'rgba(100, 149, 237, 0.5)',
      className: 'output'
    },
    hidden: {
      color: 'rgba(255, 127, 80, 0.5)',
      className: 'hidden-neuron'
    },
    fontSize: '14px',
    fontClassName: 'label',
    radius: 8,
    width: 400,
    height: 250
  };

  var mergedOptions = _objectSpread2(_objectSpread2({}, defaultOptions), options);

  var width = mergedOptions.width,
      height = mergedOptions.height,
      inputs = mergedOptions.inputs;
  var isRNN = net.hasOwnProperty('model') || net instanceof Recurrent$1 || net.type && recurrentJSONTypes.indexOf(net.type) !== -1; // Get network size array for NeuralNetwork or NeuralNetworkGPU

  var sizes = null;

  if (net instanceof neuralNetwork || net instanceof rnn || net instanceof rnnTimeStep) {
    sizes = getSizes(net);
  } // Get network size array for NeuralNetwork json
  else if (net.sizes) {
      sizes = net.sizes;
    } // get network size for Recurrent
    else if (net instanceof Recurrent$1) {
        var _getRecurrentLayers = getRecurrentLayers(net),
            inputLayer = _getRecurrentLayers.inputLayer,
            hiddenLayers = _getRecurrentLayers.hiddenLayers,
            outputLayer = _getRecurrentLayers.outputLayer;

        sizes = [inputLayer.height].concat(hiddenLayers.map(function (l) {
          return l.height;
        })).concat([outputLayer.height]);
      } // get network size for FeedForward
      else if (net instanceof FeedForward$2) {
          var _getFeedForwardLayers = getFeedForwardLayers(net),
              _inputLayer = _getFeedForwardLayers.inputLayer,
              _hiddenLayers = _getFeedForwardLayers.hiddenLayers,
              _outputLayer = _getFeedForwardLayers.outputLayer;

          sizes = [_inputLayer.height].concat(_hiddenLayers.map(function (l) {
            return l.height;
          })).concat([_outputLayer.height]);
        } // handle json, recurrent first
        else if (isRNN) {
            if (net.options) {
              sizes = getSizes(net.options);
            }
          } // handle json, NeuralNetwork
          else {
              sizes = getSizes(net);
            }

  if (!sizes) throw new Error('sizes not set');
  if (inputs.labels && inputs.labels.length !== sizes[0]) throw new Error('not enough labels for inputs');

  if (isRNN) {
    return wrapSVG(rnnToSVG(_objectSpread2(_objectSpread2({}, mergedOptions), {}, {
      sizes: sizes
    })), width, height);
  } else {
    return wrapSVG(neuralNetworkToSVG(_objectSpread2(_objectSpread2({}, mergedOptions), {}, {
      sizes: sizes
    })), width, height);
  }
}

var toSvg = toSVG;

var brain = {
  activation: activation,
  CrossValidate: crossValidate,
  likely: likely,
  layer: layer,
  layerTypes: layerTypes,
  lookup: lookup,
  praxis: praxis,
  FeedForward: feedForward$1.FeedForward,
  NeuralNetwork: neuralNetwork,
  NeuralNetworkGPU: neuralNetworkGpu,
  Recurrent: recurrent.Recurrent,
  TrainStream: trainStream,
  recurrent: {
    RNNTimeStep: rnnTimeStep,
    LSTMTimeStep: lstmTimeStep,
    GRUTimeStep: gruTimeStep,
    RNN: rnn,
    LSTM: lstm,
    GRU: gru$1
  },
  utilities: {
    max: max$1,
    mse: mse,
    ones: ones,
    randomFloat: randomFloat,
    randomWeight: randomWeight,
    randos: randos,
    range: range,
    toArray: toArray,
    DataFormatter: dataFormatter,
    zeros: zeros,
    toSVG: toSvg
  }
};

if (typeof window !== 'undefined') {
  window.brain = brain;
}

if (typeof module !== 'undefined') {
  module.exports = brain;
}

exports.brain = brain;
//# sourceMappingURL=brain.js.map
