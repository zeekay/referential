(function (global) {
  var process = {
    title: 'browser',
    browser: true,
    env: {},
    argv: [],
    nextTick: function (fn) {
      setTimeout(fn, 0)
    },
    cwd: function () {
      return '/'
    },
    chdir: function () {
    }
  };
  // Require module
  function require(file, callback) {
    if ({}.hasOwnProperty.call(require.cache, file))
      return require.cache[file];
    // Handle async require
    if (typeof callback == 'function') {
      require.load(file, callback);
      return
    }
    var resolved = require.resolve(file);
    if (!resolved)
      throw new Error('Failed to resolve module ' + file);
    var module$ = {
      id: file,
      require: require,
      filename: file,
      exports: {},
      loaded: false,
      parent: null,
      children: []
    };
    var dirname = file.slice(0, file.lastIndexOf('/') + 1);
    require.cache[file] = module$.exports;
    resolved.call(module$.exports, module$, module$.exports, dirname, file);
    module$.loaded = true;
    return require.cache[file] = module$.exports
  }
  require.modules = {};
  require.cache = {};
  require.resolve = function (file) {
    return {}.hasOwnProperty.call(require.modules, file) ? require.modules[file] : void 0
  };
  // define normal static module
  require.define = function (file, fn) {
    require.modules[file] = fn
  };
  require.waiting = {};
  // define asynchrons module
  require.async = function (url, fn) {
    require.modules[url] = fn;
    while (cb = require.waiting[url].shift())
      cb(require(url))
  };
  // Load module asynchronously
  require.load = function (url, cb) {
    var script = document.createElement('script'), existing = document.getElementsByTagName('script')[0], callbacks = require.waiting[url] = require.waiting[url] || [];
    // we'll be called when asynchronously defined.
    callbacks.push(cb);
    // load module
    script.type = 'text/javascript';
    script.async = true;
    script.src = url;
    existing.parentNode.insertBefore(script, existing)
  };
  // source: src/ref.coffee
  require.define('./ref', function (module, exports, __dirname, __filename) {
    var Ref, extend, isArray, isNumber, isObject, isString;
    extend = require('extend');
    isArray = require('is-array');
    isNumber = require('is-number');
    isObject = require('is-object');
    isString = require('is-string');
    module.exports = Ref = function () {
      function Ref(_value, parent, selector1) {
        this._value = _value;
        this.parent = parent;
        this.selector = selector1
      }
      Ref.prototype.value = function (state) {
        if (this.parent != null) {
          return this.parent.get(this.selector)
        }
        if (state != null) {
          this._value = state
        }
        return this._value
      };
      Ref.prototype.ref = function (key) {
        if (key == null) {
          this
        }
        return new Ref(null, this, key)
      };
      Ref.prototype.get = function (key) {
        if (key == null) {
          return this.value()
        } else {
          return this.index(key)
        }
      };
      Ref.prototype.set = function (key, value) {
        if (value == null) {
          this.value(extend(this.value(), key))
        } else {
          this.index(key, value)
        }
        return this
      };
      Ref.prototype.clone = function (key) {
        return new Ref(extend(true, {}, this.get(key)))
      };
      Ref.prototype.extend = function (key, value) {
        var clone;
        if (value == null) {
          this.value(extend, true, this.value(), key)
        } else {
          if (isObject(value)) {
            this.value(extend(true, this.ref(key).get(), value))
          } else {
            clone = this.clone();
            this.set(key, value);
            this.value(extend(true, clone.get(), this.value()))
          }
        }
        return this
      };
      Ref.prototype.index = function (selector, value, obj, prev) {
        var next;
        if (obj == null) {
          obj = this.value()
        }
        if (prev == null) {
          prev = null
        }
        if (isNumber(selector)) {
          selector = String(selector)
        }
        if (isString(selector)) {
          return this.index(selector.split('.'), value, obj)
        } else if (selector.length === 0) {
          return obj
        } else if (selector.length === 1) {
          if (value != null) {
            return obj[selector[0]] = value
          } else {
            return obj[selector[0]]
          }
        } else {
          next = selector[1];
          if (obj[next] == null) {
            if (isNumber(next)) {
              obj[selector[0]] = []
            } else {
              obj[selector[0]] = {}
            }
          }
          return this.index(selector.slice(1), value, obj[selector[0]], obj)
        }
      };
      return Ref
    }()
  });
  // source: node_modules/extend/index.js
  require.define('extend', function (module, exports, __dirname, __filename) {
    'use strict';
    var hasOwn = Object.prototype.hasOwnProperty;
    var toStr = Object.prototype.toString;
    var isArray = function isArray(arr) {
      if (typeof Array.isArray === 'function') {
        return Array.isArray(arr)
      }
      return toStr.call(arr) === '[object Array]'
    };
    var isPlainObject = function isPlainObject(obj) {
      if (!obj || toStr.call(obj) !== '[object Object]') {
        return false
      }
      var hasOwnConstructor = hasOwn.call(obj, 'constructor');
      var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
      // Not own constructor property must be Object
      if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
        return false
      }
      // Own properties are enumerated firstly, so to speed up,
      // if last one is own, then all properties are own.
      var key;
      for (key in obj) {
      }
      return typeof key === 'undefined' || hasOwn.call(obj, key)
    };
    module.exports = function extend() {
      var options, name, src, copy, copyIsArray, clone, target = arguments[0], i = 1, length = arguments.length, deep = false;
      // Handle a deep copy situation
      if (typeof target === 'boolean') {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2
      } else if (typeof target !== 'object' && typeof target !== 'function' || target == null) {
        target = {}
      }
      for (; i < length; ++i) {
        options = arguments[i];
        // Only deal with non-null/undefined values
        if (options != null) {
          // Extend the base object
          for (name in options) {
            src = target[name];
            copy = options[name];
            // Prevent never-ending loop
            if (target !== copy) {
              // Recurse if we're merging plain objects or arrays
              if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && isArray(src) ? src : []
                } else {
                  clone = src && isPlainObject(src) ? src : {}
                }
                // Never move original objects, clone them
                target[name] = extend(deep, clone, copy)  // Don't bring in undefined values
              } else if (typeof copy !== 'undefined') {
                target[name] = copy
              }
            }
          }
        }
      }
      // Return the modified object
      return target
    }
  });
  // source: node_modules/is-array/index.js
  require.define('is-array', function (module, exports, __dirname, __filename) {
    /**
 * isArray
 */
    var isArray = Array.isArray;
    /**
 * toString
 */
    var str = Object.prototype.toString;
    /**
 * Whether or not the given `val`
 * is an array.
 *
 * example:
 *
 *        isArray([]);
 *        // > true
 *        isArray(arguments);
 *        // > false
 *        isArray('');
 *        // > false
 *
 * @param {mixed} val
 * @return {bool}
 */
    module.exports = isArray || function (val) {
      return !!val && '[object Array]' == str.call(val)
    }
  });
  // source: node_modules/is-number/index.js
  require.define('is-number', function (module, exports, __dirname, __filename) {
    /*!
 * is-number <https://github.com/jonschlinkert/is-number>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert.
 * Licensed under the MIT License.
 */
    'use strict';
    var typeOf = require('is-number/node_modules/kind-of');
    module.exports = function isNumber(num) {
      var type = typeOf(num);
      if (type !== 'number' && type !== 'string') {
        return false
      }
      var n = +num;
      return n - n + 1 >= 0 && num !== ''
    }
  });
  // source: node_modules/is-number/node_modules/kind-of/index.js
  require.define('is-number/node_modules/kind-of', function (module, exports, __dirname, __filename) {
    var isBuffer = require('is-buffer');
    var toString = Object.prototype.toString;
    /**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */
    module.exports = function kindOf(val) {
      // primitivies
      if (typeof val === 'undefined') {
        return 'undefined'
      }
      if (val === null) {
        return 'null'
      }
      if (val === true || val === false || val instanceof Boolean) {
        return 'boolean'
      }
      if (typeof val === 'string' || val instanceof String) {
        return 'string'
      }
      if (typeof val === 'number' || val instanceof Number) {
        return 'number'
      }
      // functions
      if (typeof val === 'function' || val instanceof Function) {
        return 'function'
      }
      // array
      if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
        return 'array'
      }
      // check for instances of RegExp and Date before calling `toString`
      if (val instanceof RegExp) {
        return 'regexp'
      }
      if (val instanceof Date) {
        return 'date'
      }
      // other objects
      var type = toString.call(val);
      if (type === '[object RegExp]') {
        return 'regexp'
      }
      if (type === '[object Date]') {
        return 'date'
      }
      if (type === '[object Arguments]') {
        return 'arguments'
      }
      // buffer
      if (typeof Buffer !== 'undefined' && isBuffer(val)) {
        return 'buffer'
      }
      // es6: Map, WeakMap, Set, WeakSet
      if (type === '[object Set]') {
        return 'set'
      }
      if (type === '[object WeakSet]') {
        return 'weakset'
      }
      if (type === '[object Map]') {
        return 'map'
      }
      if (type === '[object WeakMap]') {
        return 'weakmap'
      }
      if (type === '[object Symbol]') {
        return 'symbol'
      }
      // typed arrays
      if (type === '[object Int8Array]') {
        return 'int8array'
      }
      if (type === '[object Uint8Array]') {
        return 'uint8array'
      }
      if (type === '[object Uint8ClampedArray]') {
        return 'uint8clampedarray'
      }
      if (type === '[object Int16Array]') {
        return 'int16array'
      }
      if (type === '[object Uint16Array]') {
        return 'uint16array'
      }
      if (type === '[object Int32Array]') {
        return 'int32array'
      }
      if (type === '[object Uint32Array]') {
        return 'uint32array'
      }
      if (type === '[object Float32Array]') {
        return 'float32array'
      }
      if (type === '[object Float64Array]') {
        return 'float64array'
      }
      // must be a plain object
      return 'object'
    }
  });
  // source: node_modules/is-buffer/index.js
  require.define('is-buffer', function (module, exports, __dirname, __filename) {
    /**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */
    module.exports = function (obj) {
      return !!(obj != null && (obj._isBuffer || obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)))
    }
  });
  // source: node_modules/is-object/index.js
  require.define('is-object', function (module, exports, __dirname, __filename) {
    'use strict';
    module.exports = function isObject(x) {
      return typeof x === 'object' && x !== null
    }
  });
  // source: node_modules/is-string/index.js
  require.define('is-string', function (module, exports, __dirname, __filename) {
    'use strict';
    var strValue = String.prototype.valueOf;
    var tryStringObject = function tryStringObject(value) {
      try {
        strValue.call(value);
        return true
      } catch (e) {
        return false
      }
    };
    var toStr = Object.prototype.toString;
    var strClass = '[object String]';
    var hasToStringTag = typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';
    module.exports = function isString(value) {
      if (typeof value === 'string') {
        return true
      }
      if (typeof value !== 'object') {
        return false
      }
      return hasToStringTag ? tryStringObject(value) : toStr.call(value) === strClass
    }
  });
  // source: src/browser.coffee
  require.define('./browser', function (module, exports, __dirname, __filename) {
    global.Referential = module.exports = require('./ref')
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJleHRlbmQiLCJpc0FycmF5IiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzU3RyaW5nIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJfdmFsdWUiLCJwYXJlbnQiLCJzZWxlY3RvcjEiLCJzZWxlY3RvciIsInByb3RvdHlwZSIsInZhbHVlIiwic3RhdGUiLCJnZXQiLCJyZWYiLCJrZXkiLCJpbmRleCIsInNldCIsImNsb25lIiwib2JqIiwicHJldiIsIm5leHQiLCJTdHJpbmciLCJzcGxpdCIsImxlbmd0aCIsInNsaWNlIiwiaGFzT3duIiwiT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiYXJyIiwiQXJyYXkiLCJjYWxsIiwiaXNQbGFpbk9iamVjdCIsImhhc093bkNvbnN0cnVjdG9yIiwiaGFzSXNQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJ0YXJnZXQiLCJhcmd1bWVudHMiLCJpIiwiZGVlcCIsInN0ciIsInZhbCIsInR5cGVPZiIsIm51bSIsInR5cGUiLCJuIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCb29sZWFuIiwiTnVtYmVyIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJEYXRlIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidmFsdWVPZiIsInRyeVN0cmluZ09iamVjdCIsImUiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJnbG9iYWwiLCJSZWZlcmVudGlhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLE1BQVQsRUFBaUJDLE9BQWpCLEVBQTBCQyxRQUExQixFQUFvQ0MsUUFBcEMsRUFBOENDLFFBQTlDLEM7SUFFQUosTUFBQSxHQUFTSyxPQUFBLENBQVEsUUFBUixDQUFULEM7SUFFQUosT0FBQSxHQUFVSSxPQUFBLENBQVEsVUFBUixDQUFWLEM7SUFFQUgsUUFBQSxHQUFXRyxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUYsUUFBQSxHQUFXRSxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUQsUUFBQSxHQUFXQyxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCUixHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDLFNBQVNBLEdBQVQsQ0FBYVMsTUFBYixFQUFxQkMsTUFBckIsRUFBNkJDLFNBQTdCLEVBQXdDO0FBQUEsUUFDdEMsS0FBS0YsTUFBTCxHQUFjQSxNQUFkLENBRHNDO0FBQUEsUUFFdEMsS0FBS0MsTUFBTCxHQUFjQSxNQUFkLENBRnNDO0FBQUEsUUFHdEMsS0FBS0UsUUFBTCxHQUFnQkQsU0FIc0I7QUFBQSxPQURQO0FBQUEsTUFPakNYLEdBQUEsQ0FBSWEsU0FBSixDQUFjQyxLQUFkLEdBQXNCLFVBQVNDLEtBQVQsRUFBZ0I7QUFBQSxRQUNwQyxJQUFJLEtBQUtMLE1BQUwsSUFBZSxJQUFuQixFQUF5QjtBQUFBLFVBQ3ZCLE9BQU8sS0FBS0EsTUFBTCxDQUFZTSxHQUFaLENBQWdCLEtBQUtKLFFBQXJCLENBRGdCO0FBQUEs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