var brain = (function() {function require (path) {
    // not EXACTLY like how node does it but more appropriate for the browser
    var mod
        = require.modules[path]
        || require.modules[path.replace(/\.(js|coffee)$/, '')]
        || require.modules[path + '/index']
    ;
    
    if (!mod) throw new Error("Cannot find module '" + path + "'");
    return mod._cached ? mod._cached : mod();
}

var _browserifyRequire = require; // scoping >_<

require.paths = [];
require.modules = {};

require.fromFile = function (filename, path) {
    // require a file with respect to a path
    var resolved = _browserifyRequire.resolve(filename, path);
    return _browserifyRequire(resolved)
};

require.resolve = function (basefile, file) {
    if (_browserifyRequire.modules[basefile + '/node_modules/' + file]) {
        return basefile + '/node_modules/' + file;
    }
    if (!file.match(/^[\.\/]/)) return file;
    if (file.match(/^\//)) return file;
    
    var basedir = basefile.match(/^[\.\/]/)
        ? basefile.replace(/[^\/]+$/, '')
        : basefile
    ;
    if (basedir === '') {
        basedir = '.';
    }
    
    // normalize file path.
    var r1 = /[^\/.]+\/\.\./g;
    var r2 = /\/{2,}/g;
    for(
        var norm = file;
        norm.match(r1) != null || norm.match(r2) != null;
        norm = norm.replace(r1, '').replace(r2, '/')
    );
    
    while (norm.match(/^\.\.\//)) {
        if (basedir === '/' || basedir === '') {
            throw new Error("Couldn't resolve path"
                + "'" + file + "' with respect to filename '" + basefile + "': "
                + "file can't resolve past base"
            );
        }
        norm = norm.replace(/^\.\.\//, '');
        basedir = basedir.replace(/[^\/]+\/$/, '');
    }
    
    var n = basedir.match(/\//)
        ? basedir.replace(/[^\/]+$/,'') + norm
        : norm.replace(/^\.\//, basedir + '/');
    return n.replace(/\/.\//, '/');
};
if (typeof process === 'undefined') process = {
    nextTick : function (fn) {
        setTimeout(fn, 0);
    },
    title : 'browser'
};
_browserifyRequire.modules["events"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "events.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("events", path);
    };
    
    (function () {
        if (!process.EventEmitter) process.EventEmitter = function () {};

var EventEmitter = exports.EventEmitter = process.EventEmitter;
var isArray = Array.isArray;

// By default EventEmitters will print a warning if more than
// 10 listeners are added to it. This is a useful default which
// helps finding memory leaks.
//
// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
var defaultMaxListeners = 10;
EventEmitter.prototype.setMaxListeners = function(n) {
  this._events.maxListeners = n;
};


EventEmitter.prototype.emit = function(type) {
  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events || !this._events.error ||
        (isArray(this._events.error) && !this._events.error.length))
    {
      if (arguments[1] instanceof Error) {
        throw arguments[1]; // Unhandled 'error' event
      } else {
        throw new Error("Uncaught, unspecified 'error' event.");
      }
      return false;
    }
  }

  if (!this._events) return false;
  var handler = this._events[type];
  if (!handler) return false;

  if (typeof handler == 'function') {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        var args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
    return true;

  } else if (isArray(handler)) {
    var args = Array.prototype.slice.call(arguments, 1);

    var listeners = handler.slice();
    for (var i = 0, l = listeners.length; i < l; i++) {
      listeners[i].apply(this, args);
    }
    return true;

  } else {
    return false;
  }
};

// EventEmitter is defined in src/node_events.cc
// EventEmitter.prototype.emit() is also defined there.
EventEmitter.prototype.addListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('addListener only takes instances of Function');
  }

  if (!this._events) this._events = {};

  // To avoid recursion in the case that type == "newListeners"! Before
  // adding it to the listeners, first emit "newListeners".
  this.emit('newListener', type, listener);

  if (!this._events[type]) {
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  } else if (isArray(this._events[type])) {

    // Check for listener leak
    if (!this._events[type].warned) {
      var m;
      if (this._events.maxListeners !== undefined) {
        m = this._events.maxListeners;
      } else {
        m = defaultMaxListeners;
      }

      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' +
                      'leak detected. %d listeners added. ' +
                      'Use emitter.setMaxListeners() to increase limit.',
                      this._events[type].length);
        console.trace();
      }
    }

    // If we've already got an array, just append.
    this._events[type].push(listener);
  } else {
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  var self = this;
  self.on(type, function g() {
    self.removeListener(type, g);
    listener.apply(this, arguments);
  });

  return this;
};

EventEmitter.prototype.removeListener = function(type, listener) {
  if ('function' !== typeof listener) {
    throw new Error('removeListener only takes instances of Function');
  }

  // does not use listeners(), so no side effect of creating _events[type]
  if (!this._events || !this._events[type]) return this;

  var list = this._events[type];

  if (isArray(list)) {
    var i = list.indexOf(listener);
    if (i < 0) return this;
    list.splice(i, 1);
    if (list.length == 0)
      delete this._events[type];
  } else if (this._events[type] === listener) {
    delete this._events[type];
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  // does not use listeners(), so no side effect of creating _events[type]
  if (type && this._events && this._events[type]) this._events[type] = null;
  return this;
};

EventEmitter.prototype.listeners = function(type) {
  if (!this._events) this._events = {};
  if (!this._events[type]) this._events[type] = [];
  if (!isArray(this._events[type])) {
    this._events[type] = [this._events[type]];
  }
  return this._events[type];
};
;
    }).call(module.exports);
    
    _browserifyRequire.modules["events"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["events"];
});

_browserifyRequire.modules["fs"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "fs.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("fs", path);
    };
    
    (function () {
        // nothing to see here... no file methods for the browser
;
    }).call(module.exports);
    
    _browserifyRequire.modules["fs"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["fs"];
});

_browserifyRequire.modules["json_shim"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "json_shim.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("json_shim", path);
    };
    
    (function () {
        // https://github.com/douglascrockford/JSON-js/blob/master/json2.js

if (typeof JSON === 'undefined') {
    JSON = {};
}

(function () {
    "use strict";

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function (key) {

            return isFinite(this.valueOf()) ?
                this.getUTCFullYear()     + '-' +
                f(this.getUTCMonth() + 1) + '-' +
                f(this.getUTCDate())      + 'T' +
                f(this.getUTCHours())     + ':' +
                f(this.getUTCMinutes())   + ':' +
                f(this.getUTCSeconds())   + 'Z' : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function (key) {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string' ? c :
                '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

        case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

            if (!value) {
                return 'null';
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0 ? '[]' : gap ?
                    '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' :
                    '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0 ? '{}' : gap ?
                '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' :
                '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                    walk({'': j}, '') : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
}());
;
    }).call(module.exports);
    
    _browserifyRequire.modules["json_shim"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["json_shim"];
});

_browserifyRequire.modules["path"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = ".";
    var __filename = "path.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("path", path);
    };
    
    (function () {
        // resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length; i >= 0; i--) {
    var last = parts[i];
    if (last == '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Regex to split a filename into [*, dir, basename, ext]
// posix version
var splitPathRe = /^(.+\/(?!$)|\/)?((?:.+?)?(\.[^.]*)?)$/;

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
var resolvedPath = '',
    resolvedAbsolute = false;

for (var i = arguments.length; i >= -1 && !resolvedAbsolute; i--) {
  var path = (i >= 0)
      ? arguments[i]
      : process.cwd();

  // Skip empty and invalid entries
  if (typeof path !== 'string' || !path) {
    continue;
  }

  resolvedPath = path + '/' + resolvedPath;
  resolvedAbsolute = path.charAt(0) === '/';
}

// At this point the path should be resolved to a full absolute path, but
// handle relative paths to be safe (might happen when process.cwd() fails)

// Normalize the path
resolvedPath = normalizeArray(resolvedPath.split('/').filter(function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
var isAbsolute = path.charAt(0) === '/',
    trailingSlash = path.slice(-1) === '/';

// Normalize the path
path = normalizeArray(path.split('/').filter(function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }
  
  return (isAbsolute ? '/' : '') + path;
};


// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(paths.filter(function(p, index) {
    return p && typeof p === 'string';
  }).join('/'));
};


exports.dirname = function(path) {
  var dir = splitPathRe.exec(path)[1] || '';
  if (!dir) {
    // No dirname
    return '.';
  } else if (dir.length === 1 ||
      (isWindows && dir.length <= 3 && dir.charAt(1) === ':')) {
    // It is just a slash or a drive letter with a slash
    return dir;
  } else {
    // It is a full dirname, strip trailing slash
    return dir.substring(0, dir.length - 1);
  }
};


exports.basename = function(path, ext) {
  var f = splitPathRe.exec(path)[2] || '';
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPathRe.exec(path)[3] || '';
};
;
    }).call(module.exports);
    
    _browserifyRequire.modules["path"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["path"];
});
_browserifyRequire.modules["underscore"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "underscore";
    var __filename = "underscore/underscore";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("underscore", path);
    };
    
    (function () {
        //     Underscore.js 1.1.6
//     (c) 2011 Jeremy Ashkenas, DocumentCloud Inc.
//     Underscore is freely distributable under the MIT license.
//     Portions of Underscore are inspired or borrowed from Prototype,
//     Oliver Steele's Functional, and John Resig's Micro-Templating.
//     For all details and documentation:
//     http://documentcloud.github.com/underscore

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `global` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Establish the object that gets returned to break out of a loop iteration.
  var breaker = {};

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var slice            = ArrayProto.slice,
      unshift          = ArrayProto.unshift,
      toString         = ObjProto.toString,
      hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeForEach      = ArrayProto.forEach,
    nativeMap          = ArrayProto.map,
    nativeReduce       = ArrayProto.reduce,
    nativeReduceRight  = ArrayProto.reduceRight,
    nativeFilter       = ArrayProto.filter,
    nativeEvery        = ArrayProto.every,
    nativeSome         = ArrayProto.some,
    nativeIndexOf      = ArrayProto.indexOf,
    nativeLastIndexOf  = ArrayProto.lastIndexOf,
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind;

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) { return new wrapper(obj); };

  // Export the Underscore object for **CommonJS**, with backwards-compatibility
  // for the old `require()` API. If we're not in CommonJS, add `_` to the
  // global object.
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = _;
    _._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.1.6';

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles objects implementing `forEach`, arrays, and raw objects.
  // Delegates to **ECMAScript 5**'s native `forEach` if available.
  var each = _.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return;
    if (nativeForEach && obj.forEach === nativeForEach) {
      obj.forEach(iterator, context);
    } else if (_.isNumber(obj.length)) {
      for (var i = 0, l = obj.length; i < l; i++) {
        if (iterator.call(context, obj[i], i, obj) === breaker) return;
      }
    } else {
      for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) {
          if (iterator.call(context, obj[key], key, obj) === breaker) return;
        }
      }
    }
  };

  // Return the results of applying the iterator to each element.
  // Delegates to **ECMAScript 5**'s native `map` if available.
  _.map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    return results;
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
  _.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = memo !== void 0;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
      if (context) iterator = _.bind(iterator, context);
      return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    each(obj, function(value, index, list) {
      if (!initial && index === 0) {
        memo = value;
        initial = true;
      } else {
        memo = iterator.call(context, memo, value, index, list);
      }
    });
    if (!initial) throw new TypeError("Reduce of empty array with no initial value");
    return memo;
  };

  // The right-associative version of reduce, also known as `foldr`.
  // Delegates to **ECMAScript 5**'s native `reduceRight` if available.
  _.reduceRight = _.foldr = function(obj, iterator, memo, context) {
    if (obj == null) obj = [];
    if (nativeReduceRight && obj.reduceRight === nativeReduceRight) {
      if (context) iterator = _.bind(iterator, context);
      return memo !== void 0 ? obj.reduceRight(iterator, memo) : obj.reduceRight(iterator);
    }
    var reversed = (_.isArray(obj) ? obj.slice() : _.toArray(obj)).reverse();
    return _.reduce(reversed, iterator, memo, context);
  };

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, iterator, context) {
    var result;
    any(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) {
        result = value;
        return true;
      }
    });
    return result;
  };

  // Return all the elements that pass a truth test.
  // Delegates to **ECMAScript 5**'s native `filter` if available.
  // Aliased as `select`.
  _.filter = _.select = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeFilter && obj.filter === nativeFilter) return obj.filter(iterator, context);
    each(obj, function(value, index, list) {
      if (iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    each(obj, function(value, index, list) {
      if (!iterator.call(context, value, index, list)) results[results.length] = value;
    });
    return results;
  };

  // Determine whether all of the elements match a truth test.
  // Delegates to **ECMAScript 5**'s native `every` if available.
  // Aliased as `all`.
  _.every = _.all = function(obj, iterator, context) {
    var result = true;
    if (obj == null) return result;
    if (nativeEvery && obj.every === nativeEvery) return obj.every(iterator, context);
    each(obj, function(value, index, list) {
      if (!(result = result && iterator.call(context, value, index, list))) return breaker;
    });
    return result;
  };

  // Determine if at least one element in the object matches a truth test.
  // Delegates to **ECMAScript 5**'s native `some` if available.
  // Aliased as `any`.
  var any = _.some = _.any = function(obj, iterator, context) {
    iterator || (iterator = _.identity);
    var result = false;
    if (obj == null) return result;
    if (nativeSome && obj.some === nativeSome) return obj.some(iterator, context);
    each(obj, function(value, index, list) {
      if (result = iterator.call(context, value, index, list)) return breaker;
    });
    return result;
  };

  // Determine if a given value is included in the array or object using `===`.
  // Aliased as `contains`.
  _.include = _.contains = function(obj, target) {
    var found = false;
    if (obj == null) return found;
    if (nativeIndexOf && obj.indexOf === nativeIndexOf) return obj.indexOf(target) != -1;
    any(obj, function(value) {
      if (found = value === target) return true;
    });
    return found;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    return _.map(obj, function(value) {
      return (method.call ? method || value : value[method]).apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, function(value){ return value[key]; });
  };

  // Return the maximum element or (element-based computation).
  _.max = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.max.apply(Math, obj);
    var result = {computed : -Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed >= result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iterator, context) {
    if (!iterator && _.isArray(obj)) return Math.min.apply(Math, obj);
    var result = {computed : Infinity};
    each(obj, function(value, index, list) {
      var computed = iterator ? iterator.call(context, value, index, list) : value;
      computed < result.computed && (result = {value : value, computed : computed});
    });
    return result.value;
  };

  // Sort the object's values by a criterion produced by an iterator.
  _.sortBy = function(obj, iterator, context) {
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value : value,
        criteria : iterator.call(context, value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    }), 'value');
  };

  // Use a comparator function to figure out at what index an object should
  // be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iterator) {
    iterator || (iterator = _.identity);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >> 1;
      iterator(array[mid]) < iterator(obj) ? low = mid + 1 : high = mid;
    }
    return low;
  };

  // Safely convert anything iterable into a real, live array.
  _.toArray = function(iterable) {
    if (!iterable)                return [];
    if (iterable.toArray)         return iterable.toArray();
    if (_.isArray(iterable))      return iterable;
    if (_.isArguments(iterable))  return slice.call(iterable);
    return _.values(iterable);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    return _.toArray(obj).length;
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head`. The **guard** check allows it to work
  // with `_.map`.
  _.first = _.head = function(array, n, guard) {
    return (n != null) && !guard ? slice.call(array, 0, n) : array[0];
  };

  // Returns everything but the first entry of the array. Aliased as `tail`.
  // Especially useful on the arguments object. Passing an **index** will return
  // the rest of the values in the array from that index onward. The **guard**
  // check allows it to work with `_.map`.
  _.rest = _.tail = function(array, index, guard) {
    return slice.call(array, (index == null) || guard ? 1 : index);
  };

  // Get the last element of an array.
  _.last = function(array) {
    return array[array.length - 1];
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, function(value){ return !!value; });
  };

  // Return a completely flattened version of an array.
  _.flatten = function(array) {
    return _.reduce(array, function(memo, value) {
      if (_.isArray(value)) return memo.concat(_.flatten(value));
      memo[memo.length] = value;
      return memo;
    }, []);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    var values = slice.call(arguments, 1);
    return _.filter(array, function(value){ return !_.include(values, value); });
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted) {
    return _.reduce(array, function(memo, el, i) {
      if (0 == i || (isSorted === true ? _.last(memo) != el : !_.include(memo, el))) memo[memo.length] = el;
      return memo;
    }, []);
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersect = function(array) {
    var rest = slice.call(arguments, 1);
    return _.filter(_.uniq(array), function(item) {
      return _.every(rest, function(other) {
        return _.indexOf(other, item) >= 0;
      });
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    var args = slice.call(arguments);
    var length = _.max(_.pluck(args, 'length'));
    var results = new Array(length);
    for (var i = 0; i < length; i++) results[i] = _.pluck(args, "" + i);
    return results;
  };

  // If the browser doesn't supply us with indexOf (I'm looking at you, **MSIE**),
  // we need this function. Return the position of the first occurrence of an
  // item in an array, or -1 if the item is not included in the array.
  // Delegates to **ECMAScript 5**'s native `indexOf` if available.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i, l;
    if (isSorted) {
      i = _.sortedIndex(array, item);
      return array[i] === item ? i : -1;
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item);
    for (i = 0, l = array.length; i < l; i++) if (array[i] === item) return i;
    return -1;
  };


  // Delegates to **ECMAScript 5**'s native `lastIndexOf` if available.
  _.lastIndexOf = function(array, item) {
    if (array == null) return -1;
    if (nativeLastIndexOf && array.lastIndexOf === nativeLastIndexOf) return array.lastIndexOf(item);
    var i = array.length;
    while (i--) if (array[i] === item) return i;
    return -1;
  };

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (arguments.length <= 1) {
      stop = start || 0;
      start = 0;
    }
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Binding with arguments is also known as `curry`.
  // Delegates to **ECMAScript 5**'s native `Function.bind` if available.
  // We check for `func.bind` first, to fail fast when `func` is undefined.
  _.bind = function(func, obj) {
    if (func.bind === nativeBind && nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    var args = slice.call(arguments, 2);
    return function() {
      return func.apply(obj, args.concat(slice.call(arguments)));
    };
  };

  // Bind all of an object's methods to that object. Useful for ensuring that
  // all callbacks defined on an object belong to it.
  _.bindAll = function(obj) {
    var funcs = slice.call(arguments, 1);
    if (funcs.length == 0) funcs = _.functions(obj);
    each(funcs, function(f) { obj[f] = _.bind(obj[f], obj); });
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memo = {};
    hasher || (hasher = _.identity);
    return function() {
      var key = hasher.apply(this, arguments);
      return hasOwnProperty.call(memo, key) ? memo[key] : (memo[key] = func.apply(this, arguments));
    };
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){ return func.apply(func, args); }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = function(func) {
    return _.delay.apply(_, [func, 1].concat(slice.call(arguments, 1)));
  };

  // Internal function used to implement `_.throttle` and `_.debounce`.
  var limit = function(func, wait, debounce) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var throttler = function() {
        timeout = null;
        func.apply(context, args);
      };
      if (debounce) clearTimeout(timeout);
      if (debounce || !timeout) timeout = setTimeout(throttler, wait);
    };
  };

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time.
  _.throttle = function(func, wait) {
    return limit(func, wait, false);
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds.
  _.debounce = function(func, wait) {
    return limit(func, wait, true);
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = function(func) {
    var ran = false, memo;
    return function() {
      if (ran) return memo;
      ran = true;
      return memo = func.apply(this, arguments);
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return function() {
      var args = [func].concat(slice.call(arguments));
      return wrapper.apply(this, args);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var funcs = slice.call(arguments);
    return function() {
      var args = slice.call(arguments);
      for (var i=funcs.length-1; i >= 0; i--) {
        args = [funcs[i].apply(this, args)];
      }
      return args[0];
    };
  };

  // Returns a function that will only be executed after being called N times.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) { return func.apply(this, arguments); }
    };
  };


  // Object Functions
  // ----------------

  // Retrieve the names of an object's properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = nativeKeys || function(obj) {
    if (obj !== Object(obj)) throw new TypeError('Invalid object');
    var keys = [];
    for (var key in obj) if (hasOwnProperty.call(obj, key)) keys[keys.length] = key;
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    return _.map(obj, _.identity);
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    return _.filter(_.keys(obj), function(key){ return _.isFunction(obj[key]); }).sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (source[prop] !== void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Fill in a given object with default properties.
  _.defaults = function(obj) {
    each(slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] == null) obj[prop] = source[prop];
      }
    });
    return obj;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    // Check object identity.
    if (a === b) return true;
    // Different types?
    var atype = typeof(a), btype = typeof(b);
    if (atype != btype) return false;
    // Basic equality test (watch out for coercions).
    if (a == b) return true;
    // One is falsy and the other truthy.
    if ((!a && b) || (a && !b)) return false;
    // Unwrap any wrapped objects.
    if (a._chain) a = a._wrapped;
    if (b._chain) b = b._wrapped;
    // One of them implements an isEqual()?
    if (a.isEqual) return a.isEqual(b);
    // Check dates' integer values.
    if (_.isDate(a) && _.isDate(b)) return a.getTime() === b.getTime();
    // Both are NaN?
    if (_.isNaN(a) && _.isNaN(b)) return false;
    // Compare regular expressions.
    if (_.isRegExp(a) && _.isRegExp(b))
      return a.source     === b.source &&
             a.global     === b.global &&
             a.ignoreCase === b.ignoreCase &&
             a.multiline  === b.multiline;
    // If a is not an object by this point, we can't handle it.
    if (atype !== 'object') return false;
    // Check for different array lengths before comparing contents.
    if (a.length && (a.length !== b.length)) return false;
    // Nothing else worked, deep compare the contents.
    var aKeys = _.keys(a), bKeys = _.keys(b);
    // Different object sizes?
    if (aKeys.length != bKeys.length) return false;
    // Recursive comparison of contents.
    for (var key in a) if (!(key in b) || !_.isEqual(a[key], b[key])) return false;
    return true;
  };

  // Is a given array or object empty?
  _.isEmpty = function(obj) {
    if (_.isArray(obj) || _.isString(obj)) return obj.length === 0;
    for (var key in obj) if (hasOwnProperty.call(obj, key)) return false;
    return true;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType == 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an arguments object?
  _.isArguments = function(obj) {
    return !!(obj && hasOwnProperty.call(obj, 'callee'));
  };

  // Is a given value a function?
  _.isFunction = function(obj) {
    return !!(obj && obj.constructor && obj.call && obj.apply);
  };

  // Is a given value a string?
  _.isString = function(obj) {
    return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
  };

  // Is a given value a number?
  _.isNumber = function(obj) {
    return !!(obj === 0 || (obj && obj.toExponential && obj.toFixed));
  };

  // Is the given value `NaN`? `NaN` happens to be the only value in JavaScript
  // that does not equal itself.
  _.isNaN = function(obj) {
    return obj !== obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false;
  };

  // Is a given value a date?
  _.isDate = function(obj) {
    return !!(obj && obj.getTimezoneOffset && obj.setUTCFullYear);
  };

  // Is the given value a regular expression?
  _.isRegExp = function(obj) {
    return !!(obj && obj.test && obj.exec && (obj.ignoreCase || obj.ignoreCase === false));
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iterators.
  _.identity = function(value) {
    return value;
  };

  // Run a function **n** times.
  _.times = function (n, iterator, context) {
    for (var i = 0; i < n; i++) iterator.call(context, i);
  };

  // Add your own custom functions to the Underscore object, ensuring that
  // they're correctly added to the OOP wrapper as well.
  _.mixin = function(obj) {
    each(_.functions(obj), function(name){
      addToWrapper(name, _[name] = obj[name]);
    });
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = idCounter++;
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  _.template = function(str, data) {
    var c  = _.templateSettings;
    var tmpl = 'var __p=[],print=function(){__p.push.apply(__p,arguments);};' +
      'with(obj||{}){__p.push(\'' +
      str.replace(/\\/g, '\\\\')
         .replace(/'/g, "\\'")
         .replace(c.interpolate, function(match, code) {
           return "'," + code.replace(/\\'/g, "'") + ",'";
         })
         .replace(c.evaluate || null, function(match, code) {
           return "');" + code.replace(/\\'/g, "'")
                              .replace(/[\r\n\t]/g, ' ') + "__p.push('";
         })
         .replace(/\r/g, '\\r')
         .replace(/\n/g, '\\n')
         .replace(/\t/g, '\\t')
         + "');}return __p.join('');";
    var func = new Function('obj', tmpl);
    return data ? func(data) : func;
  };

  // The OOP Wrapper
  // ---------------

  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.
  var wrapper = function(obj) { this._wrapped = obj; };

  // Expose `wrapper.prototype` as `_.prototype`
  _.prototype = wrapper.prototype;

  // Helper function to continue chaining intermediate results.
  var result = function(obj, chain) {
    return chain ? _(obj).chain() : obj;
  };

  // A method to easily add functions to the OOP wrapper.
  var addToWrapper = function(name, func) {
    wrapper.prototype[name] = function() {
      var args = slice.call(arguments);
      unshift.call(args, this._wrapped);
      return result(func.apply(_, args), this._chain);
    };
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      method.apply(this._wrapped, arguments);
      return result(this._wrapped, this._chain);
    };
  });

  // Add all accessor Array functions to the wrapper.
  each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    wrapper.prototype[name] = function() {
      return result(method.apply(this._wrapped, arguments), this._chain);
    };
  });

  // Start chaining a wrapped Underscore object.
  wrapper.prototype.chain = function() {
    this._chain = true;
    return this;
  };

  // Extracts the result from a wrapped and chained object.
  wrapper.prototype.value = function() {
    return this._wrapped;
  };

})();
;
    }).call(module.exports);
    
    _browserifyRequire.modules["underscore"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["underscore"];
});

_browserifyRequire.modules["underscore/index"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "underscore";
    var __filename = "underscore/underscore/index";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("underscore/index", path);
    };
    
    (function () {
        module.exports = require('./underscore');
;
    }).call(module.exports);
    
    _browserifyRequire.modules["underscore/index"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["underscore/index"];
});
_browserifyRequire.modules["brain/bayesian/backends/localStorage"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/localStorage.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/bayesian/backends/localStorage", path);
    };
    
    (function () {
        var _ = require("underscore")._;

var LocalStorageBackend = function(options) {
  var options = options || {};
  var name = options.name || Math.floor(Math.random() * 100000);

  this.prefix = 'brain.bayesian.' + name;
  
  if(options.testing)
    localStorage = {};
    
  localStorage[this.prefix + '.cats'] = '{}';
}

LocalStorageBackend.prototype = {
  async : false,

  getCats : function() {
    return JSON.parse(localStorage[this.prefix + '.cats']);
  },
  
  setCats : function(cats) {
    localStorage[this.prefix + '.cats'] = JSON.stringify(cats); 
  },
  
  getWordCount : function(word) {
    return JSON.parse(localStorage[this.prefix + '.words.' + word] || '{}');    
  },
  
  setWordCount : function(word, counts) {
    localStorage[this.prefix + '.words.' + word] = JSON.stringify(counts);    
  },
  
  getWordCounts : function(words) {
    var counts = {};
    words.forEach(function(word) {
      counts[word] = this.getWordCount(word);
    }, this);
    return counts;
  },

  incCounts : function(catIncs, wordIncs) {
    var cats = this.getCats();
    _(catIncs).each(function(inc, cat) {
      cats[cat] = cats[cat] + inc || inc;
    }, this);
    this.setCats(cats);

    _(wordIncs).each(function(incs, word) {
      var wordCounts = this.getWordCount(word);
      _(incs).each(function(inc, cat) {
        wordCounts[cat] = wordCounts[cat] + inc || inc;
      }, this);
      this.setWordCount(word, wordCounts);
    }, this);
  },

  toJSON : function() {
    var words = {};
    var regex = new RegExp("^" + this.prefix + "\.words\.(.+)$")
    for(item in localStorage) {
      var match = regex.exec(item);
      if(match)
        words[match[1]] = JSON.parse(localStorage[item]);
    }
    return {
      cats: JSON.parse(localStorage[this.prefix + '.cats']),
      words: words
    };
  },
  
  fromJSON : function(json) {
    this.incCounts(json.cats, json.words);
  }
}

exports.LocalStorageBackend = LocalStorageBackend;;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/bayesian/backends/localStorage"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/bayesian/backends/localStorage"];
});

_browserifyRequire.modules["brain/bayesian/backends/memory"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/memory.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/bayesian/backends/memory", path);
    };
    
    (function () {
        var _ = require("underscore")._;

var MemoryBackend = function() {
  this.catCounts = {};
  this.wordCounts = {};
}

MemoryBackend.prototype = {
  async : false,

  incCounts : function(catIncs, wordIncs) {
    _(catIncs).each(function(inc, cat) {
      this.catCounts[cat] = this.catCounts[cat] + inc || inc;
    }, this);

    _(wordIncs).each(function(incs, word) {
      this.wordCounts[word] = this.wordCounts[word] || {};
      _(incs).each(function(inc, cat) {
        this.wordCounts[word][cat] = this.wordCounts[word][cat] + inc || inc;
      }, this);
    }, this);
  },

  getCats : function() {
    return this.catCounts;
  },

  getWordCounts : function(words, cats) {
    return this.wordCounts;
  },
  
  toJSON : function() {
    return {cats: this.catCounts, words: this.wordCounts}
  },
  
  fromJSON : function(json) {
    this.catCounts = json.cats;
    this.wordCounts = json.words;
  }
}

exports.MemoryBackend = MemoryBackend;;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/bayesian/backends/memory"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/bayesian/backends/memory"];
});

_browserifyRequire.modules["brain/bayesian/backends/redis"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/redis.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/bayesian/backends/redis", path);
    };
    
    (function () {
        var redis = require("redis"),
    _ = require("underscore")._;

var RedisBackend = function(options) {
  options = options || {};
  var port = options.port || 6379;
  var host = options.hostname || "localhost";
  var opts = options.options || {};

  this.client = function() {
    var client = redis.createClient(port, host, opts);
    if(options.error)
      client.on('error', options.error);
    return client;
  }

  var name = options.name || Math.floor(Math.random() * 100000);
  this.catsKey = 'brain_bayes_cats_' + name;
  this.wordsKey = 'brain_bayes_words_' + name;

  if(options.db)
    this.client().select(options.db);
}

RedisBackend.prototype = {
  async : true,

  key : function(word, cat) {
    return word + "____" + cat; // flatten word count hash
  },

  pair : function(key) {
    return /(.*)____(.*)/.exec(key).slice(1);
  },

  incCounts : function(catIncs, wordIncs, callback) {
    // create new client for each call so we can close each time
    var client = this.client();
    var multi = client.multi(); // make multi so we can have one callback

    _(catIncs).each(function(inc, cat) {
      multi.hincrby(this.catsKey, cat, inc);
    }, this);

    _(wordIncs).each(function(wordCounts, word) {
      _(wordCounts).each(function(inc, cat) {
        multi.hincrby(this.wordsKey, this.key(word, cat), inc);
      }, this);
    }, this);

    var that = this;
    multi.exec(function(err, ret) {
      if(callback)
        callback(ret);
      client.quit();
    });
  },

  getCats : function(callback) {
    var that = this;
    var client = this.client();
    client.hgetall(this.catsKey, function(err, cats) {
      _(cats).each(function(val, cat) {
        cats[cat] = parseInt(val);
      });
      callback(cats);
      client.quit();
    });
  },

  getWordCounts : function(words, cats, callback) {
    var keys = _(words).reduce(function(keys, word) {
       return keys.concat(_(cats).map(function(count, cat) {
         return this.key(word, cat);
       },this));
    }, [], this);

    var that = this;
    var args = [this.wordsKey].concat(keys);
    var client = this.client();
    client.hmget(args, function(err, vals) {
      var counts = {};
      keys.map(function(key, i) {
         var pair = that.pair(key);
         var word = pair[0], cat = pair[1];
         counts[word] = counts[word] ? counts[word] : {};
         counts[word][cat] = parseInt(vals[i]) || 0;
      });
      callback(counts);
      client.quit();
    });
  },
  
  toJSON: function(callback) {
    var that = this;
    this.getCats(function(cats) {
      var client = that.client();
      client.hgetall(that.wordsKey, function(err, wordCounts) {
        var words = {};
        for(key in wordCounts) {
          var pair = that.pair(key);
          var word = pair[0], cat = pair[1];
          words[word] = words[word] ? words[word] : {};
          words[word][cat] = parseInt(wordCounts[key]) || 0;
        }
        callback({cats: cats, words: words});
        client.quit();
      });
    });
  },
  
  fromJSON: function(json, callback) {
    this.incCounts(json.cats, json.words, callback); 
  }
}

exports.RedisBackend = RedisBackend;;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/bayesian/backends/redis"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/bayesian/backends/redis"];
});

_browserifyRequire.modules["brain/bayesian/bayesian"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/bayesian.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/bayesian/bayesian", path);
    };
    
    (function () {
        var _ = require("underscore")._;

var BayesianClassifier = function(options) {
  options = options || {}
  this.thresholds = options.thresholds || {};
  this.def = options.def || 'unclassified';
  this.weight = options.weight || 1;
  this.assumed = options.assumed || 0.5;

  var backend = options.backend || {type: 'memory'};
  switch(backend.type.toLowerCase()) {
    case 'redis':
      this.backend = new (require("./backends/redis").RedisBackend)(backend.options);
      break;
    case 'localstorage':
      this.backend = new (require("./backends/localStorage")
                     .LocalStorageBackend)(backend.options);
      break;
    default:
      this.backend = new (require("./backends/memory").MemoryBackend)();
  }
}

BayesianClassifier.prototype = {
  getCats : function(callback) {
    return this.backend.getCats(callback);
  },

  getWordCounts : function(words, cats, callback) {
    return this.backend.getWordCounts(words, cats, callback);
  },

  incDocCounts : function(docs, callback) {
    // accumulate all the pending increments
    var wordIncs = {};
    var catIncs = {};
    docs.forEach(function(doc) {
      var cat = doc.cat;
      catIncs[cat] = catIncs[cat] ? catIncs[cat] + 1 : 1;

      var words = this.getWords(doc.doc);
      words.forEach(function(word) {
        wordIncs[word] = wordIncs[word] || {};
        wordIncs[word][cat] = wordIncs[word][cat] ? wordIncs[word][cat] + 1 : 1;
      }, this);
    }, this);

    return this.backend.incCounts(catIncs, wordIncs, callback);
  },

  setThresholds : function(thresholds) {
    this.thresholds = thresholds;
  },

  getWords : function(doc) {
    if(_(doc).isArray())
      return doc;
    var words = doc.split(/\W+/);
    return _(words).uniq();
  },

  train : function(doc, cat, callback) {
    this.incDocCounts([{doc: doc, cat: cat}], function(err, ret) {
      if (callback)
        callback(ret);
    });
  },

  trainAll : function(data, callback) {
    data = data.map(function(item) {
      return {doc: item.input, cat: item.output};
    });
    this.incDocCounts(data, function(err, ret) {
      if (callback)
        callback(ret);
    });
  },

  wordProb : function(word, cat, cats, counts) {
    // times word appears in a doc in this cat / docs in this cat
    var prob = (counts[cat] || 0) / cats[cat];

    // get weighted average with assumed so prob won't be extreme on rare words
    var total = _(cats).reduce(function(sum, p, cat) {
      return sum + (counts[cat] || 0);
    }, 0, this);
    return (this.weight * this.assumed + total * prob) / (this.weight + total);
  },

  getCatProbs : function(cats, words, counts) {
    var numDocs = _(cats).reduce(function(sum, count) {
      return sum + count;
    }, 0);

    var probs = {};
    _(cats).each(function(catCount, cat) {
      var catProb = (catCount || 0) / numDocs;

      var docProb = _(words).reduce(function(prob, word) {
        var wordCounts = counts[word] || {};
        return prob * this.wordProb(word, cat, cats, wordCounts);
      }, 1, this);

      // the probability this doc is in this category
      probs[cat] = catProb * docProb;
    }, this);
    return probs;
  },

  getProbs : function(doc, callback) {
    var that = this;
    this.getCats(function(cats) {
      var words = that.getWords(doc);
      that.getWordCounts(words, cats, function(counts) {
        var probs = that.getCatProbs(cats, words, counts);
        callback(probs);
      });
    });
  },

  getProbsSync : function(doc) {
    var words = this.getWords(doc);
    var cats = this.getCats();
    var counts = this.getWordCounts(words, cats);
    return this.getCatProbs(cats, words, counts);
  },

  bestMatch : function(probs) {
    var max = _(probs).reduce(function(max, prob, cat) {
      return max.prob > prob ? max : {cat: cat, prob: prob};
    }, {prob: 0});

    var category = max.cat || this.def;
    var threshold = this.thresholds[max.cat] || 1;
    _(probs).map(function(prob, cat) {
     if(!(cat == max.cat) && prob * threshold > max.prob)
       category = this.def; // not greater than other category by enough
    }, this);

    return category;
  },

  classify : function(doc, callback) {
    if(!this.backend.async)
      return this.classifySync(doc);

    var that = this;
    this.getProbs(doc, function(probs) {
      callback(that.bestMatch(probs));
    });
  },

  classifySync : function(doc) {
    var probs = this.getProbsSync(doc);
    return this.bestMatch(probs);
  },

  test : function(data) { // only for sync
    var error = 0;
    data.forEach(function(datum) {
      var output = this.classify(datum.input);
      error += output == datum.output ? 0 : 1;
    }, this);
    return error / data.length;
  },
  
  toJSON : function(callback) {
    return this.backend.toJSON(callback);
  },
  
  fromJSON : function(json, callback) {
    this.backend.fromJSON(json, callback);
    return this;
  }
}

exports.BayesianClassifier = BayesianClassifier;
;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/bayesian/bayesian"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/bayesian/bayesian"];
});

_browserifyRequire.modules["brain"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/brain.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain", path);
    };
    
    (function () {
        exports.NeuralNetwork = require("./neuralnetwork").NeuralNetwork;
exports.crossValidate = require("./crossvalidate").crossValidate;
exports.BayesianClassifier = require("./bayesian/bayesian").BayesianClassifier;
;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain"]._cached = module.exports;
    return module.exports;
};

["brain/brain","brain"].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain"];
});

_browserifyRequire.modules["brain/crossvalidate"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/crossvalidate.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/crossvalidate", path);
    };
    
    (function () {
        var _ = require("underscore")._;

function testSet(classifierFunc, options, trainingSet, testingSet) {
  var classifier = new classifierFunc(options);
  var t1 = Date.now();
  classifier.trainAll(trainingSet);
  var t2 = Date.now();
  var error = classifier.test(testingSet);
  var t3 = Date.now();
  
  return {
    error : error,
    trainTime : t2 - t1,
    testTime : t3 - t2,
    trainSize: trainingSet.length,
    testSize: testingSet.length 
  };
}

exports.crossValidate = function(classifierFunc, options, data, slices) {
  var sliceSize = data.length / slices;
  var partitions = _.range(slices).map(function(i) {
    var dclone = _(data).clone();
    return [dclone.splice(i * sliceSize, sliceSize), dclone];
  });

  var results = _(partitions).map(function(partition, i) {
    return testSet(classifierFunc, options, partition[1], partition[0]);
  });
  return results;
};
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/crossvalidate"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/crossvalidate"];
});

_browserifyRequire.modules["brain/neuralnetwork"] = function () {
    var module = { exports : {} };
    var exports = module.exports;
    var __dirname = "brain";
    var __filename = "brain/neuralnetwork.js";
    
    var require = function (path) {
        return _browserifyRequire.fromFile("brain/neuralnetwork", path);
    };
    
    (function () {
        var NeuralNetwork = function(options) {
  options = options || {};
  this.learningRate = options.learningRate || 0.5;
  this.growthRate = options.growthRate || 0.5;
  this.momentum = options.momentum || 0.1;

  this.createLayers(options.hidden);
}

NeuralNetwork.prototype = {
  createLayers : function(hidden, json) {
    var nlayers = 3; // one hidden layer is default
    if(hidden)
      nlayers = hidden.length + 2;
    else if(json)
      nlayers = json.layers.length;

    this.layers = [];
    for(var i = 0; i < nlayers; i++) {
      var nnodes = hidden ? hidden[i - 1] : 0;
      var layerJSON = json ? json.layers[i] : null;
      var layer = new Layer(this, layer, nnodes, layerJSON);
      this.layers.push(layer);
    }

    this.inputLayer = this.layers[0];
    this.outputLayer = this.layers[nlayers - 1];
    if(!hidden && !json)
      this.hiddenLayer = this.layers[1]; // hold onto for growing
    else
      this.hiddenLayer = null;
  },

  run : function(inputs) {
    this.inputLayer.createNodes(inputs);
    if(this.hiddenLayer)
      this.hiddenLayer.growLayer(this.inputLayer.getSize());

    this.inputLayer.setOutputs(inputs);
    for(var i = 1; i < this.layers.length; i++)
      this.layers[i].calcOutputs();

    var outputs = this.outputLayer.getOutputs();
    return this.formatOutput(outputs);
  },

  trainItem : function(inputs, targets) {
    this.outputLayer.createNodes(targets);

    this.run(inputs);

    this.outputLayer.calcErrors(targets);
    for(var i = this.layers.length - 2; i >= 0; i--)
      this.layers[i].calcErrors();

    for(var i = 1; i < this.layers.length; i++)
      this.layers[i].adjustWeights();

    return this.outputLayer.getError();
  },

  train : function(data, iterations, errorThresh, callback, resolution) {
    iterations = iterations || 20000;
    errorThresh = errorThresh || 0.007;

    var error = 1;
    for(var i = 0; i < iterations && error > errorThresh; i++) {
      var sum = 0;
      for(var j = 0; j < data.length; j++) {
        var err = this.trainItem(data[j].input, data[j].output);
        sum += Math.pow(err, 2);
      }
      error = Math.sqrt(sum) / data.length; // mean squared error

      if(callback && (i % resolution == 0))
        callback({error: error, iterations: i});
    }
    return {error: error, iterations: i};
  },
  
  trainAll : function(data) { // called by brain.crossValidate()
    this.train(data);
  },
  
  getError : function(output, target) {
    var error = 0, count = 0;
    for(var id in output) {
      error += Math.pow(output[id] - target[id], 2);
      count++;
    }
    return error / count; // average mse
  },
  
  test : function(data) {
    var error = 0;
    for(var i = 0; i < data.length; i++) {
      var output = this.run(data[i].input);
      error += this.getError(output, data[i].output);
    }
    return error / data.length; // average error
  },

  formatOutput : function(outputs) {
    /* we use hashes internally, turn back into array if needed */
    var values = [];
    for(var id in outputs) {
      if(parseInt(id) != id) // not an array index
        return outputs;
      values.push(outputs[id]);
    }
    return values;
  },

  toJSON : function() {
    var json = {layers: []};
    for(var i = 0; i < this.layers.length; i++)
      json.layers.push(this.layers[i].toJSON());
    return json;
  },

  fromJSON : function(json) {
    this.createLayers(null, json);
    return this;
  },

  toFunction: function() {
    var json = this.toJSON();
    // currying w/ closures won't do, this needs to be standalone
    return new Function("inputs",
'  var net = ' + JSON.stringify(json) + ';\n\n\
  for(var i = 1; i < net.layers.length; i++) {\n\
    var nodes = net.layers[i].nodes;\n\
    var outputs = {};\n\
    for(var id in nodes) {\n\
      var node = nodes[id];\n\
      var sum = node.bias;\n\
      for(var iid in node.weights)\n\
        sum += node.weights[iid] * inputs[iid];\n\
      outputs[id] = (1/(1 + Math.exp(-sum)));\n\
    }\n\
    inputs = outputs;\n\
  }\n\
  return outputs;');
    // note: this doesn't handle never-been-seen before inputs
  },

  toString : function() {
    return JSON.stringify(this.toJSON());
  }
}

function Layer(network, prevLayer, numNodes, json) {
  this.network = network;
  this.prevLayer = prevLayer;
  if(this.prevLayer) 
    this.prevLayer.nextLayer = this;

  this.nodes = {};
  if(json) {
    this.fromJSON(json);
  }
  else if(numNodes) {
    for(var i = 0; i < numNodes; i++)
      this.createNode(i);
  }
}

Layer.prototype = {
  getOutputs : function() { // output is kept as state for backpropagation
    return this.map(function(node) { return node.output; });
  },

  setOutputs : function(outputs) {
    this.map(function(node, id) { node.output = outputs[id] || 0; });
  },

  getError : function() {
    var sum = this.reduce(function(sum, node) {
      return sum + Math.pow(node.error, 2);
    }, 0);
    return Math.sqrt(sum) / this.getSize(); // mean squared error
  },

  getSize : function() {
    return this.reduce(function(count) { return ++count; }, 0);
  },

  map : function(callback) {
    var values = {};
    for(var id in this.nodes)
      values[id] = callback(this.nodes[id], id);
    return values;
  },

  reduce : function(callback, value) {
    for(var id in this.nodes)
      value = callback(value, this.nodes[id]);
    return value;  
  },

  growLayer : function(inputSize) {
    var targetSize = inputSize;
    if(inputSize > 5)
      targetSize *= this.network.growthRate;
    for(var i = this.getSize(); i < targetSize; i++)
      this.createNode(i);
  },

  createNodes : function(ids) {
    for(var id in ids) {
      if(!this.nodes[id])
        this.createNode(id);
    }
  },

  createNode : function(id) {
    var node = new Node(this, id);
    this.nodes[id] = node;
    
    if(this.nextLayer) {
      var outgoing = this.nextLayer.nodes;
      for(var outid in outgoing)
        outgoing[outid].addIncoming(id);
    }
  },

  calcOutputs : function() {
    for(var id in this.nodes)
      this.nodes[id].calcOutput();
  },

  calcErrors : function(targets) {
    for(var id in this.nodes)
      this.nodes[id].calcError(targets);
  },

  adjustWeights : function() {
    for(var id in this.nodes)
      this.nodes[id].adjustWeights();
  },

  toJSON : function() {
    var json = { nodes: {}};
    for(var id in this.nodes)
      json.nodes[id] = this.nodes[id].toJSON();
    return json;
  },

  fromJSON : function(json) {
    this.nodes = {};
    for(var id in json.nodes)
      this.nodes[id] = new Node(this, id, json.nodes[id]);
  },
}

function Node(layer, id, json) {
  this.layer = layer;
  this.id = id;
  this.output = 0;

  if(json) {
    this.fromJSON(json);
  }
  else if(this.layer.prevLayer) {
    this.weights = {};
    this.change = {};
    for(var id in this.getIncoming())
      this.addIncoming(id);
    this.bias = this.randomWeight(); // instead of having a seperate bias node
  }
}

Node.prototype = {
  getIncoming : function() { return this.layer.prevLayer.nodes; },
 
  getOutgoing : function() { return this.layer.nextLayer.nodes; },

  randomWeight : function() {
    return Math.random() * 0.4  - 0.2;
  },

  sigmoid : function(num) {
    return 1/(1 + Math.exp(-num));
  },

  dsigmoid : function(num) {
    return num * (1 - num);
  },
 
  addIncoming : function(id) {
    this.weights[id] = this.randomWeight();
    this.change[id] = 0;
  },

  calcOutput : function() {
    var sum = this.bias;
    var inputs = this.getIncoming();
    for(var id in this.weights)
      sum += this.weights[id] * inputs[id].output;
    this.output = this.sigmoid(sum);
  },

  calcError : function(targets) {
    if(targets) {
      var expected = targets[this.id] || 0;
      this.error = expected - this.output;
    }
    else {
      this.error = 0;
      var outgoing = this.getOutgoing();
      for(var id in outgoing)
        this.error += outgoing[id].delta * outgoing[id].weights[this.id];
    }
    this.delta = this.error * this.dsigmoid(this.output);
  },

  adjustWeights : function() {
    var rate = this.layer.network.learningRate;
    var momentum = this.layer.network.momentum;

    var inputs = this.getIncoming();
    for(var id in inputs) {
      var change = rate * this.delta * inputs[id].output + momentum * this.change[id];
      this.change[id] = change;
      this.weights[id] += change;
    }
    this.bias += rate * this.delta; 
  },

  toJSON : function() {
    return { weights: this.weights, bias: this.bias };
  },

  fromJSON : function(json) {
    this.weights = json.weights;
    this.bias = json.bias;
  },
}

exports.NeuralNetwork = NeuralNetwork;
;
    }).call(module.exports);
    
    _browserifyRequire.modules["brain/neuralnetwork"]._cached = module.exports;
    return module.exports;
};

[].forEach(function (a) {
    _browserifyRequire.modules[a] = _browserifyRequire.modules["brain/neuralnetwork"];
});
 return require('brain')})();