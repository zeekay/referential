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
      Ref.prototype.clone = function (key, value) {
        return new Ref(extend(true, {}, this.value()))
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJleHRlbmQiLCJpc0FycmF5IiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzU3RyaW5nIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJfdmFsdWUiLCJwYXJlbnQiLCJzZWxlY3RvcjEiLCJzZWxlY3RvciIsInByb3RvdHlwZSIsInZhbHVlIiwic3RhdGUiLCJnZXQiLCJyZWYiLCJrZXkiLCJpbmRleCIsInNldCIsImNsb25lIiwib2JqIiwicHJldiIsIm5leHQiLCJTdHJpbmciLCJzcGxpdCIsImxlbmd0aCIsInNsaWNlIiwiaGFzT3duIiwiT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiYXJyIiwiQXJyYXkiLCJjYWxsIiwiaXNQbGFpbk9iamVjdCIsImhhc093bkNvbnN0cnVjdG9yIiwiaGFzSXNQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsIm5hbWUiLCJzcmMiLCJjb3B5IiwiY29weUlzQXJyYXkiLCJ0YXJnZXQiLCJhcmd1bWVudHMiLCJpIiwiZGVlcCIsInN0ciIsInZhbCIsInR5cGVPZiIsIm51bSIsInR5cGUiLCJuIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCb29sZWFuIiwiTnVtYmVyIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJEYXRlIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidmFsdWVPZiIsInRyeVN0cmluZ09iamVjdCIsImUiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJnbG9iYWwiLCJSZWZlcmVudGlhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLE1BQVQsRUFBaUJDLE9BQWpCLEVBQTBCQyxRQUExQixFQUFvQ0MsUUFBcEMsRUFBOENDLFFBQTlDLEM7SUFFQUosTUFBQSxHQUFTSyxPQUFBLENBQVEsUUFBUixDQUFULEM7SUFFQUosT0FBQSxHQUFVSSxPQUFBLENBQVEsVUFBUixDQUFWLEM7SUFFQUgsUUFBQSxHQUFXRyxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUYsUUFBQSxHQUFXRSxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUQsUUFBQSxHQUFXQyxPQUFBLENBQVEsV0FBUixDQUFYLEM7SUFFQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCUixHQUFBLEdBQU8sWUFBVztBQUFBLE1BQ2pDLFNBQVNBLEdBQVQsQ0FBYVMsTUFBYixFQUFxQkMsTUFBckIsRUFBNkJDLFNBQTdCLEVBQXdDO0FBQUEsUUFDdEMsS0FBS0YsTUFBTCxHQUFjQSxNQUFkLENBRHNDO0FBQUEsUUFFdEMsS0FBS0MsTUFBTCxHQUFjQSxNQUFkLENBRnNDO0FBQUEsUUFHdEMsS0FBS0UsUUFBTCxHQUFnQkQsU0FIc0I7QUFBQSxPQURQO0FBQUEsTUFPakNYLEdBQUEsQ0FBSWEsU0FBSixDQUFjQyxLQUFkLEdBQXNCLFVBQVNDLEtBQVQsRUFBZ0I7QUFBQSxRQUNwQyxJQUFJLEtBQUtMLE1BQUwsSUFBZSxJQUFuQixFQUF5QjtBQUFBLFVBQ3ZCLE9BQU8sS0FBS0EsTUFBTCxDQUFZTSxHQUFaLENBQWdCLEtBQUtKLFFBQXJCLENBRGdCO0FBQUEsU0FEVztBQUFBLFFBSXBDLElBQUlHLEtBQUEsSUFBUyxJQUFiLEVBQW1CO0FBQUEsVUFDakIsS0FBS04sTUFBTCxHQUFjTSxLQURHO0FBQUEsU0FKaUI7QUFBQSxRQU9wQyxPQUFPLEtBQUtOLE1BUHdCO0FBQUEsT0FBdEMsQ0FQaUM7QUFBQSxNQWlCakNULEdBQUEsQ0FBSWEsU0FBSixDQUFjSSxHQUFkLEdBQW9CLFVBQVNDLEdBQVQsRUFBYztBQUFBLFFBQ2hDLElBQUlBLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsVUFDZixJQURlO0FBQUEsU0FEZTtBQUFBLFFBSWhDLE9BQU8sSUFBSWxCLEdBQUosQ0FBUSxJQUFSLEVBQWMsSUFBZCxFQUFvQmtCLEdBQXBCLENBSnlCO0FBQUEsT0FBbEMsQ0FqQmlDO0FBQUEsTUF3QmpDbEIsR0FBQSxDQUFJYSxTQUFKLENBQWNHLEdBQWQsR0FBb0IsVUFBU0UsR0FBVCxFQUFjO0FBQUEsUUFDaEMsSUFBSUEsR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxVQUNmLE9BQU8sS0FBS0osS0FBTCxFQURRO0FBQUEsU0FBakIsTUFFTztBQUFBLFVBQ0wsT0FBTyxLQUFLSyxLQUFMLENBQVdELEdBQVgsQ0FERjtBQUFBLFNBSHlCO0FBQUEsT0FBbEMsQ0F4QmlDO0FBQUEsTUFnQ2pDbEIsR0FBQSxDQUFJYSxTQUFKLENBQWNPLEdBQWQsR0FBb0IsVUFBU0YsR0FBVCxFQUFjSixLQUFkLEVBQXFCO0FBQUEsUUFDdkMsSUFBSUEsS0FBQSxJQUFTLElBQWIsRUFBbUI7QUFBQSxVQUNqQixLQUFLQSxLQUFMLENBQVdiLE1BQUEsQ0FBTyxLQUFLYSxLQUFMLEVBQVAsRUFBcUJJLEdBQXJCLENBQVgsQ0FEaUI7QUFBQSxTQUFuQixNQUVPO0FBQUEsVUFDTCxLQUFLQyxLQUFMLENBQVdELEdBQVgsRUFBZ0JKLEtBQWhCLENBREs7QUFBQSxTQUhnQztBQUFBLFFBTXZDLE9BQU8sSUFOZ0M7QUFBQSxPQUF6QyxDQWhDaUM7QUFBQSxNQXlDakNkLEdBQUEsQ0FBSWEsU0FBSixDQUFjUSxLQUFkLEdBQXNCLFVBQVNILEdBQVQsRUFBY0osS0FBZCxFQUFxQjtBQUFBLFFBQ3pDLE9BQU8sSUFBSWQsR0FBSixDQUFRQyxNQUFBLENBQU8sSUFBUCxFQUFhLEVBQWIsRUFBaUIsS0FBS2EsS0FBTCxFQUFqQixDQUFSLENBRGtDO0FBQUEsT0FBM0MsQ0F6Q2lDO0FBQUEsTUE2Q2pDZCxHQUFBLENBQUlhLFNBQUosQ0FBY1osTUFBZCxHQUF1QixVQUFTaUIsR0FBVCxFQUFjSixLQUFkLEVBQXFCO0FBQUEsUUFDMUMsSUFBSU8sS0FBSixDQUQwQztBQUFBLFFBRTFDLElBQUlQLEtBQUEsSUFBUyxJQUFiLEVBQW1CO0FBQUEsVUFDakIsS0FBS0EsS0FBTCxDQUFXYixNQUFYLEVBQW1CLElBQW5CLEVBQXlCLEtBQUthLEtBQUwsRUFBekIsRUFBdUNJLEdBQXZDLENBRGlCO0FBQUEsU0FBbkIsTUFFTztBQUFBLFVBQ0wsSUFBSWQsUUFBQSxDQUFTVSxLQUFULENBQUosRUFBcUI7QUFBQSxZQUNuQixLQUFLQSxLQUFMLENBQVdiLE1BQUEsQ0FBTyxJQUFQLEVBQWMsS0FBS2dCLEdBQUwsQ0FBU0MsR0FBVCxDQUFELENBQWdCRixHQUFoQixFQUFiLEVBQW9DRixLQUFwQyxDQUFYLENBRG1CO0FBQUEsV0FBckIsTUFFTztBQUFBLFlBQ0xPLEtBQUEsR0FBUSxLQUFLQSxLQUFMLEVBQVIsQ0FESztBQUFBLFlBRUwsS0FBS0QsR0FBTCxDQUFTRixHQUFULEVBQWNKLEtBQWQsRUFGSztBQUFBLFlBR0wsS0FBS0EsS0FBTCxDQUFXYixNQUFBLENBQU8sSUFBUCxFQUFhb0IsS0FBQSxDQUFNTCxHQUFOLEVBQWIsRUFBMEIsS0FBS0YsS0FBTCxFQUExQixDQUFYLENBSEs7QUFBQSxXQUhGO0FBQUEsU0FKbUM7QUFBQSxRQWExQyxPQUFPLElBYm1DO0FBQUEsT0FBNUMsQ0E3Q2lDO0FBQUEsTUE2RGpDZCxHQUFBLENBQUlhLFNBQUosQ0FBY00sS0FBZCxHQUFzQixVQUFTUCxRQUFULEVBQW1CRSxLQUFuQixFQUEwQlEsR0FBMUIsRUFBK0JDLElBQS9CLEVBQXFDO0FBQUEsUUFDekQsSUFBSUMsSUFBSixDQUR5RDtBQUFBLFFBRXpELElBQUlGLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsVUFDZkEsR0FBQSxHQUFNLEtBQUtSLEtBQUwsRUFEUztBQUFBLFNBRndDO0FBQUEsUUFLekQsSUFBSVMsSUFBQSxJQUFRLElBQVosRUFBa0I7QUFBQSxVQUNoQkEsSUFBQSxHQUFPLElBRFM7QUFBQSxTQUx1QztBQUFBLFFBUXpELElBQUlwQixRQUFBLENBQVNTLFFBQVQsQ0FBSixFQUF3QjtBQUFBLFVBQ3RCQSxRQUFBLEdBQVdhLE1BQUEsQ0FBT2IsUUFBUCxDQURXO0FBQUEsU0FSaUM7QUFBQSxRQVd6RCxJQUFJUCxRQUFBLENBQVNPLFFBQVQsQ0FBSixFQUF3QjtBQUFBLFVBQ3RCLE9BQU8sS0FBS08sS0FBTCxDQUFXUCxRQUFBLENBQVNjLEtBQVQsQ0FBZSxHQUFmLENBQVgsRUFBZ0NaLEtBQWhDLEVBQXVDUSxHQUF2QyxDQURlO0FBQUEsU0FBeEIsTUFFTyxJQUFJVixRQUFBLENBQVNlLE1BQVQsS0FBb0IsQ0FBeEIsRUFBMkI7QUFBQSxVQUNoQyxPQUFPTCxHQUR5QjtBQUFBLFNBQTNCLE1BRUEsSUFBSVYsUUFBQSxDQUFTZSxNQUFULEtBQW9CLENBQXhCLEVBQTJCO0FBQUEsVUFDaEMsSUFBSWIsS0FBQSxJQUFTLElBQWIsRUFBbUI7QUFBQSxZQUNqQixPQUFPUSxHQUFBLENBQUlWLFFBQUEsQ0FBUyxDQUFULENBQUosSUFBbUJFLEtBRFQ7QUFBQSxXQUFuQixNQUVPO0FBQUEsWUFDTCxPQUFPUSxHQUFBLENBQUlWLFFBQUEsQ0FBUyxDQUFULENBQUosQ0FERjtBQUFBLFdBSHlCO0FBQUEsU0FBM0IsTUFNQTtBQUFBLFVBQ0xZLElBQUEsR0FBT1osUUFBQSxDQUFTLENBQVQsQ0FBUCxDQURLO0FBQUEsVUFFTCxJQUFJVSxHQUFBLENBQUlFLElBQUosS0FBYSxJQUFqQixFQUF1QjtBQUFBLFlBQ3JCLElBQUlyQixRQUFBLENBQVNxQixJQUFULENBQUosRUFBb0I7QUFBQSxjQUNsQkYsR0FBQSxDQUFJVixRQUFBLENBQVMsQ0FBVCxDQUFKLElBQW1CLEVBREQ7QUFBQSxhQUFwQixNQUVPO0FBQUEsY0FDTFUsR0FBQSxDQUFJVixRQUFBLENBQVMsQ0FBVCxDQUFKLElBQW1CLEVBRGQ7QUFBQSxhQUhjO0FBQUEsV0FGbEI7QUFBQSxVQVNMLE9BQU8sS0FBS08sS0FBTCxDQUFXUCxRQUFBLENBQVNnQixLQUFULENBQWUsQ0FBZixDQUFYLEVBQThCZCxLQUE5QixFQUFxQ1EsR0FBQSxDQUFJVixRQUFBLENBQVMsQ0FBVCxDQUFKLENBQXJDLEVBQXVEVSxHQUF2RCxDQVRGO0FBQUEsU0FyQmtEO0FBQUEsT0FBM0QsQ0E3RGlDO0FBQUEsTUErRmpDLE9BQU90QixHQS9GMEI7QUFBQSxLQUFaLEU7Ozs7SUNadkIsYTtJQUVBLElBQUk2QixNQUFBLEdBQVNDLE1BQUEsQ0FBT2pCLFNBQVAsQ0FBaUJrQixjQUE5QixDO0lBQ0EsSUFBSUMsS0FBQSxHQUFRRixNQUFBLENBQU9qQixTQUFQLENBQWlCb0IsUUFBN0IsQztJQUVBLElBQUkvQixPQUFBLEdBQVUsU0FBU0EsT0FBVCxDQUFpQmdDLEdBQWpCLEVBQXNCO0FBQUEsTUFDbkMsSUFBSSxPQUFPQyxLQUFBLENBQU1qQyxPQUFiLEtBQXlCLFVBQTdCLEVBQXlDO0FBQUEsUUFDeEMsT0FBT2lDLEtBQUEsQ0FBTWpDLE9BQU4sQ0FBY2dDLEdBQWQsQ0FEaUM7QUFBQSxPQUROO0FBQUEsTUFLbkMsT0FBT0YsS0FBQSxDQUFNSSxJQUFOLENBQVdGLEdBQVgsTUFBb0IsZ0JBTFE7QUFBQSxLQUFwQyxDO0lBUUEsSUFBSUcsYUFBQSxHQUFnQixTQUFTQSxhQUFULENBQXVCZixHQUF2QixFQUE0QjtBQUFBLE1BQy9DLElBQUksQ0FBQ0EsR0FBRCxJQUFRVSxLQUFBLENBQU1JLElBQU4sQ0FBV2QsR0FBWCxNQUFvQixpQkFBaEMsRUFBbUQ7QUFBQSxRQUNsRCxPQUFPLEtBRDJDO0FBQUEsT0FESjtBQUFBLE1BSy9DLElBQUlnQixpQkFBQSxHQUFvQlQsTUFBQSxDQUFPTyxJQUFQLENBQVlkLEdBQVosRUFBaUIsYUFBakIsQ0FBeEIsQ0FMK0M7QUFBQSxNQU0vQyxJQUFJaUIsZ0JBQUEsR0FBbUJqQixHQUFBLENBQUlrQixXQUFKLElBQW1CbEIsR0FBQSxDQUFJa0IsV0FBSixDQUFnQjNCLFNBQW5DLElBQWdEZ0IsTUFBQSxDQUFPTyxJQUFQLENBQVlkLEdBQUEsQ0FBSWtCLFdBQUosQ0FBZ0IzQixTQUE1QixFQUF1QyxlQUF2QyxDQUF2RSxDQU4rQztBQUFBLE1BUS9DO0FBQUEsVUFBSVMsR0FBQSxDQUFJa0IsV0FBSixJQUFtQixDQUFDRixpQkFBcEIsSUFBeUMsQ0FBQ0MsZ0JBQTlDLEVBQWdFO0FBQUEsUUFDL0QsT0FBTyxLQUR3RDtBQUFBLE9BUmpCO0FBQUEsTUFjL0M7QUFBQTtBQUFBLFVBQUlyQixHQUFKLENBZCtDO0FBQUEsTUFlL0MsS0FBS0EsR0FBTCxJQUFZSSxHQUFaLEVBQWlCO0FBQUEsT0FmOEI7QUFBQSxNQWlCL0MsT0FBTyxPQUFPSixHQUFQLEtBQWUsV0FBZixJQUE4QlcsTUFBQSxDQUFPTyxJQUFQLENBQVlkLEdBQVosRUFBaUJKLEdBQWpCLENBakJVO0FBQUEsS0FBaEQsQztJQW9CQVgsTUFBQSxDQUFPQyxPQUFQLEdBQWlCLFNBQVNQLE1BQVQsR0FBa0I7QUFBQSxNQUNsQyxJQUFJd0MsT0FBSixFQUFhQyxJQUFiLEVBQW1CQyxHQUFuQixFQUF3QkMsSUFBeEIsRUFBOEJDLFdBQTlCLEVBQTJDeEIsS0FBM0MsRUFDQ3lCLE1BQUEsR0FBU0MsU0FBQSxDQUFVLENBQVYsQ0FEVixFQUVDQyxDQUFBLEdBQUksQ0FGTCxFQUdDckIsTUFBQSxHQUFTb0IsU0FBQSxDQUFVcEIsTUFIcEIsRUFJQ3NCLElBQUEsR0FBTyxLQUpSLENBRGtDO0FBQUEsTUFRbEM7QUFBQSxVQUFJLE9BQU9ILE1BQVAsS0FBa0IsU0FBdEIsRUFBaUM7QUFBQSxRQUNoQ0csSUFBQSxHQUFPSCxNQUFQLENBRGdDO0FBQUEsUUFFaENBLE1BQUEsR0FBU0MsU0FBQSxDQUFVLENBQVYsS0FBZ0IsRUFBekIsQ0FGZ0M7QUFBQSxRQUloQztBQUFBLFFBQUFDLENBQUEsR0FBSSxDQUo0QjtBQUFBLE9BQWpDLE1BS08sSUFBSyxPQUFPRixNQUFQLEtBQWtCLFFBQWxCLElBQThCLE9BQU9BLE1BQVAsS0FBa0IsVUFBakQsSUFBZ0VBLE1BQUEsSUFBVSxJQUE5RSxFQUFvRjtBQUFBLFFBQzFGQSxNQUFBLEdBQVMsRUFEaUY7QUFBQSxPQWJ6RDtBQUFBLE1BaUJsQyxPQUFPRSxDQUFBLEdBQUlyQixNQUFYLEVBQW1CLEVBQUVxQixDQUFyQixFQUF3QjtBQUFBLFFBQ3ZCUCxPQUFBLEdBQVVNLFNBQUEsQ0FBVUMsQ0FBVixDQUFWLENBRHVCO0FBQUEsUUFHdkI7QUFBQSxZQUFJUCxPQUFBLElBQVcsSUFBZixFQUFxQjtBQUFBLFVBRXBCO0FBQUEsZUFBS0MsSUFBTCxJQUFhRCxPQUFiLEVBQXNCO0FBQUEsWUFDckJFLEdBQUEsR0FBTUcsTUFBQSxDQUFPSixJQUFQLENBQU4sQ0FEcUI7QUFBQSxZQUVyQkUsSUFBQSxHQUFPSCxPQUFBLENBQVFDLElBQVIsQ0FBUCxDQUZxQjtBQUFBLFlBS3JCO0FBQUEsZ0JBQUlJLE1BQUEsS0FBV0YsSUFBZixFQUFxQjtBQUFBLGNBRXBCO0FBQUEsa0JBQUlLLElBQUEsSUFBUUwsSUFBUixJQUFpQixDQUFBUCxhQUFBLENBQWNPLElBQWQsS0FBd0IsQ0FBQUMsV0FBQSxHQUFjM0MsT0FBQSxDQUFRMEMsSUFBUixDQUFkLENBQXhCLENBQXJCLEVBQTRFO0FBQUEsZ0JBQzNFLElBQUlDLFdBQUosRUFBaUI7QUFBQSxrQkFDaEJBLFdBQUEsR0FBYyxLQUFkLENBRGdCO0FBQUEsa0JBRWhCeEIsS0FBQSxHQUFRc0IsR0FBQSxJQUFPekMsT0FBQSxDQUFReUMsR0FBUixDQUFQLEdBQXNCQSxHQUF0QixHQUE0QixFQUZwQjtBQUFBLGlCQUFqQixNQUdPO0FBQUEsa0JBQ050QixLQUFBLEdBQVFzQixHQUFBLElBQU9OLGFBQUEsQ0FBY00sR0FBZCxDQUFQLEdBQTRCQSxHQUE1QixHQUFrQyxFQURwQztBQUFBLGlCQUpvRTtBQUFBLGdCQVMzRTtBQUFBLGdCQUFBRyxNQUFBLENBQU9KLElBQVAsSUFBZXpDLE1BQUEsQ0FBT2dELElBQVAsRUFBYTVCLEtBQWIsRUFBb0J1QixJQUFwQixDQUFmO0FBVDJFLGVBQTVFLE1BWU8sSUFBSSxPQUFPQSxJQUFQLEtBQWdCLFdBQXBCLEVBQWlDO0FBQUEsZ0JBQ3ZDRSxNQUFBLENBQU9KLElBQVAsSUFBZUUsSUFEd0I7QUFBQSxlQWRwQjtBQUFBLGFBTEE7QUFBQSxXQUZGO0FBQUEsU0FIRTtBQUFBLE9BakJVO0FBQUEsTUFrRGxDO0FBQUEsYUFBT0UsTUFsRDJCO0FBQUEsSzs7OztJQzVCbkM7QUFBQTtBQUFBO0FBQUEsUUFBSTVDLE9BQUEsR0FBVWlDLEtBQUEsQ0FBTWpDLE9BQXBCLEM7SUFNQTtBQUFBO0FBQUE7QUFBQSxRQUFJZ0QsR0FBQSxHQUFNcEIsTUFBQSxDQUFPakIsU0FBUCxDQUFpQm9CLFFBQTNCLEM7SUFtQkE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQSxJQUFBMUIsTUFBQSxDQUFPQyxPQUFQLEdBQWlCTixPQUFBLElBQVcsVUFBVWlELEdBQVYsRUFBZTtBQUFBLE1BQ3pDLE9BQU8sQ0FBQyxDQUFFQSxHQUFILElBQVUsb0JBQW9CRCxHQUFBLENBQUlkLElBQUosQ0FBU2UsR0FBVCxDQURJO0FBQUEsSzs7OztJQ3ZCM0M7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsaUI7SUFFQSxJQUFJQyxNQUFBLEdBQVM5QyxPQUFBLENBQVEsZ0NBQVIsQ0FBYixDO0lBRUFDLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQixTQUFTTCxRQUFULENBQWtCa0QsR0FBbEIsRUFBdUI7QUFBQSxNQUN0QyxJQUFJQyxJQUFBLEdBQU9GLE1BQUEsQ0FBT0MsR0FBUCxDQUFYLENBRHNDO0FBQUEsTUFFdEMsSUFBSUMsSUFBQSxLQUFTLFFBQVQsSUFBcUJBLElBQUEsS0FBUyxRQUFsQyxFQUE0QztBQUFBLFFBQzFDLE9BQU8sS0FEbUM7QUFBQSxPQUZOO0FBQUEsTUFLdEMsSUFBSUMsQ0FBQSxHQUFJLENBQUNGLEdBQVQsQ0FMc0M7QUFBQSxNQU10QyxPQUFRRSxDQUFBLEdBQUlBLENBQUosR0FBUSxDQUFULElBQWUsQ0FBZixJQUFvQkYsR0FBQSxLQUFRLEVBTkc7QUFBQSxLOzs7O0lDWHhDLElBQUlHLFFBQUEsR0FBV2xELE9BQUEsQ0FBUSxXQUFSLENBQWYsQztJQUNBLElBQUkyQixRQUFBLEdBQVdILE1BQUEsQ0FBT2pCLFNBQVAsQ0FBaUJvQixRQUFoQyxDO0lBU0E7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQTFCLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQixTQUFTaUQsTUFBVCxDQUFnQk4sR0FBaEIsRUFBcUI7QUFBQSxNQUVwQztBQUFBLFVBQUksT0FBT0EsR0FBUCxLQUFlLFdBQW5CLEVBQWdDO0FBQUEsUUFDOUIsT0FBTyxXQUR1QjtBQUFBLE9BRkk7QUFBQSxNQUtwQyxJQUFJQSxHQUFBLEtBQVEsSUFBWixFQUFrQjtBQUFBLFFBQ2hCLE9BQU8sTUFEUztBQUFBLE9BTGtCO0FBQUEsTUFRcEMsSUFBSUEsR0FBQSxLQUFRLElBQVIsSUFBZ0JBLEdBQUEsS0FBUSxLQUF4QixJQUFpQ0EsR0FBQSxZQUFlTyxPQUFwRCxFQUE2RDtBQUFBLFFBQzNELE9BQU8sU0FEb0Q7QUFBQSxPQVJ6QjtBQUFBLE1BV3BDLElBQUksT0FBT1AsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLEdBQUEsWUFBZTFCLE1BQTlDLEVBQXNEO0FBQUEsUUFDcEQsT0FBTyxRQUQ2QztBQUFBLE9BWGxCO0FBQUEsTUFjcEMsSUFBSSxPQUFPMEIsR0FBUCxLQUFlLFFBQWYsSUFBMkJBLEdBQUEsWUFBZVEsTUFBOUMsRUFBc0Q7QUFBQSxRQUNwRCxPQUFPLFFBRDZDO0FBQUEsT0FkbEI7QUFBQSxNQW1CcEM7QUFBQSxVQUFJLE9BQU9SLEdBQVAsS0FBZSxVQUFmLElBQTZCQSxHQUFBLFlBQWVTLFFBQWhELEVBQTBEO0FBQUEsUUFDeEQsT0FBTyxVQURpRDtBQUFBLE9BbkJ0QjtBQUFBLE1Bd0JwQztBQUFBLFVBQUksT0FBT3pCLEtBQUEsQ0FBTWpDLE9BQWIsS0FBeUIsV0FBekIsSUFBd0NpQyxLQUFBLENBQU1qQyxPQUFOLENBQWNpRCxHQUFkLENBQTVDLEVBQWdFO0FBQUEsUUFDOUQsT0FBTyxPQUR1RDtBQUFBLE9BeEI1QjtBQUFBLE1BNkJwQztBQUFBLFVBQUlBLEdBQUEsWUFBZVUsTUFBbkIsRUFBMkI7QUFBQSxRQUN6QixPQUFPLFFBRGtCO0FBQUEsT0E3QlM7QUFBQSxNQWdDcEMsSUFBSVYsR0FBQSxZQUFlVyxJQUFuQixFQUF5QjtBQUFBLFFBQ3ZCLE9BQU8sTUFEZ0I7QUFBQSxPQWhDVztBQUFBLE1BcUNwQztBQUFBLFVBQUlSLElBQUEsR0FBT3JCLFFBQUEsQ0FBU0csSUFBVCxDQUFjZSxHQUFkLENBQVgsQ0FyQ29DO0FBQUEsTUF1Q3BDLElBQUlHLElBQUEsS0FBUyxpQkFBYixFQUFnQztBQUFBLFFBQzlCLE9BQU8sUUFEdUI7QUFBQSxPQXZDSTtBQUFBLE1BMENwQyxJQUFJQSxJQUFBLEtBQVMsZUFBYixFQUE4QjtBQUFBLFFBQzVCLE9BQU8sTUFEcUI7QUFBQSxPQTFDTTtBQUFBLE1BNkNwQyxJQUFJQSxJQUFBLEtBQVMsb0JBQWIsRUFBbUM7QUFBQSxRQUNqQyxPQUFPLFdBRDBCO0FBQUEsT0E3Q0M7QUFBQSxNQWtEcEM7QUFBQSxVQUFJLE9BQU9TLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNQLFFBQUEsQ0FBU0wsR0FBVCxDQUFyQyxFQUFvRDtBQUFBLFFBQ2xELE9BQU8sUUFEMkM7QUFBQSxPQWxEaEI7QUFBQSxNQXVEcEM7QUFBQSxVQUFJRyxJQUFBLEtBQVMsY0FBYixFQUE2QjtBQUFBLFFBQzNCLE9BQU8sS0FEb0I7QUFBQSxPQXZETztBQUFBLE1BMERwQyxJQUFJQSxJQUFBLEtBQVMsa0JBQWIsRUFBaUM7QUFBQSxRQUMvQixPQUFPLFNBRHdCO0FBQUEsT0ExREc7QUFBQSxNQTZEcEMsSUFBSUEsSUFBQSxLQUFTLGNBQWIsRUFBNkI7QUFBQSxRQUMzQixPQUFPLEtBRG9CO0FBQUEsT0E3RE87QUFBQSxNQWdFcEMsSUFBSUEsSUFBQSxLQUFTLGtCQUFiLEVBQWlDO0FBQUEsUUFDL0IsT0FBTyxTQUR3QjtBQUFBLE9BaEVHO0FBQUEsTUFtRXBDLElBQUlBLElBQUEsS0FBUyxpQkFBYixFQUFnQztBQUFBLFFBQzlCLE9BQU8sUUFEdUI7QUFBQSxPQW5FSTtBQUFBLE1Bd0VwQztBQUFBLFVBQUlBLElBQUEsS0FBUyxvQkFBYixFQUFtQztBQUFBLFFBQ2pDLE9BQU8sV0FEMEI7QUFBQSxPQXhFQztBQUFBLE1BMkVwQyxJQUFJQSxJQUFBLEtBQVMscUJBQWIsRUFBb0M7QUFBQSxRQUNsQyxPQUFPLFlBRDJCO0FBQUEsT0EzRUE7QUFBQSxNQThFcEMsSUFBSUEsSUFBQSxLQUFTLDRCQUFiLEVBQTJDO0FBQUEsUUFDekMsT0FBTyxtQkFEa0M7QUFBQSxPQTlFUDtBQUFBLE1BaUZwQyxJQUFJQSxJQUFBLEtBQVMscUJBQWIsRUFBb0M7QUFBQSxRQUNsQyxPQUFPLFlBRDJCO0FBQUEsT0FqRkE7QUFBQSxNQW9GcEMsSUFBSUEsSUFBQSxLQUFTLHNCQUFiLEVBQXFDO0FBQUEsUUFDbkMsT0FBTyxhQUQ0QjtBQUFBLE9BcEZEO0FBQUEsTUF1RnBDLElBQUlBLElBQUEsS0FBUyxxQkFBYixFQUFvQztBQUFBLFFBQ2xDLE9BQU8sWUFEMkI7QUFBQSxPQXZGQTtBQUFBLE1BMEZwQyxJQUFJQSxJQUFBLEtBQVMsc0JBQWIsRUFBcUM7QUFBQSxRQUNuQyxPQUFPLGFBRDRCO0FBQUEsT0ExRkQ7QUFBQSxNQTZGcEMsSUFBSUEsSUFBQSxLQUFTLHVCQUFiLEVBQXNDO0FBQUEsUUFDcEMsT0FBTyxjQUQ2QjtBQUFBLE9BN0ZGO0FBQUEsTUFnR3BDLElBQUlBLElBQUEsS0FBUyx1QkFBYixFQUFzQztBQUFBLFFBQ3BDLE9BQU8sY0FENkI7QUFBQSxPQWhHRjtBQUFBLE1BcUdwQztBQUFBLGFBQU8sUUFyRzZCO0FBQUEsSzs7OztJQ0R0QztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBQS9DLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQixVQUFVYyxHQUFWLEVBQWU7QUFBQSxNQUM5QixPQUFPLENBQUMsQ0FBRSxDQUFBQSxHQUFBLElBQU8sSUFBUCxJQUNQLENBQUFBLEdBQUEsQ0FBSTBDLFNBQUosSUFDRTFDLEdBQUEsQ0FBSWtCLFdBQUosSUFDRCxPQUFPbEIsR0FBQSxDQUFJa0IsV0FBSixDQUFnQmdCLFFBQXZCLEtBQW9DLFVBRG5DLElBRURsQyxHQUFBLENBQUlrQixXQUFKLENBQWdCZ0IsUUFBaEIsQ0FBeUJsQyxHQUF6QixDQUhELENBRE8sQ0FEb0I7QUFBQSxLOzs7O0lDVGhDLGE7SUFFQWYsTUFBQSxDQUFPQyxPQUFQLEdBQWlCLFNBQVNKLFFBQVQsQ0FBa0I2RCxDQUFsQixFQUFxQjtBQUFBLE1BQ3JDLE9BQU8sT0FBT0EsQ0FBUCxLQUFhLFFBQWIsSUFBeUJBLENBQUEsS0FBTSxJQUREO0FBQUEsSzs7OztJQ0Z0QyxhO0lBRUEsSUFBSUMsUUFBQSxHQUFXekMsTUFBQSxDQUFPWixTQUFQLENBQWlCc0QsT0FBaEMsQztJQUNBLElBQUlDLGVBQUEsR0FBa0IsU0FBU0EsZUFBVCxDQUF5QnRELEtBQXpCLEVBQWdDO0FBQUEsTUFDckQsSUFBSTtBQUFBLFFBQ0hvRCxRQUFBLENBQVM5QixJQUFULENBQWN0QixLQUFkLEVBREc7QUFBQSxRQUVILE9BQU8sSUFGSjtBQUFBLE9BQUosQ0FHRSxPQUFPdUQsQ0FBUCxFQUFVO0FBQUEsUUFDWCxPQUFPLEtBREk7QUFBQSxPQUp5QztBQUFBLEtBQXRELEM7SUFRQSxJQUFJckMsS0FBQSxHQUFRRixNQUFBLENBQU9qQixTQUFQLENBQWlCb0IsUUFBN0IsQztJQUNBLElBQUlxQyxRQUFBLEdBQVcsaUJBQWYsQztJQUNBLElBQUlDLGNBQUEsR0FBaUIsT0FBT0MsTUFBUCxLQUFrQixVQUFsQixJQUFnQyxPQUFPQSxNQUFBLENBQU9DLFdBQWQsS0FBOEIsUUFBbkYsQztJQUVBbEUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCLFNBQVNILFFBQVQsQ0FBa0JTLEtBQWxCLEVBQXlCO0FBQUEsTUFDekMsSUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQXJCLEVBQStCO0FBQUEsUUFBRSxPQUFPLElBQVQ7QUFBQSxPQURVO0FBQUEsTUFFekMsSUFBSSxPQUFPQSxLQUFQLEtBQWlCLFFBQXJCLEVBQStCO0FBQUEsUUFBRSxPQUFPLEtBQVQ7QUFBQSxPQUZVO0FBQUEsTUFHekMsT0FBT3lELGNBQUEsR0FBaUJILGVBQUEsQ0FBZ0J0RCxLQUFoQixDQUFqQixHQUEwQ2tCLEtBQUEsQ0FBTUksSUFBTixDQUFXdEIsS0FBWCxNQUFzQndELFFBSDlCO0FBQUEsSzs7OztJQ2YxQ0ksTUFBQSxDQUFPQyxXQUFQLEdBQXFCcEUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCRixPQUFBLENBQVEsT0FBUixDIiwic291cmNlUm9vdCI6Ii9zcmMifQ==