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
  // source: src/referential.coffee
  require.define('./referential', function (module, exports, __dirname, __filename) {
    var Ref, refer;
    Ref = require('./ref');
    module.exports = refer = function (state, ref) {
      var fn, i, len, method, ref1, wrapper;
      if (ref == null) {
        ref = null
      }
      if (ref == null) {
        ref = new Ref(state)
      }
      wrapper = function (key) {
        return ref.get(key)
      };
      ref1 = [
        'value',
        'get',
        'set',
        'extend',
        'index'
      ];
      fn = function (method) {
        return wrapper[method] = function () {
          return ref[method].apply(ref, arguments)
        }
      };
      for (i = 0, len = ref1.length; i < len; i++) {
        method = ref1[i];
        fn(method)
      }
      wrapper.ref = function (key) {
        return refer(null, ref.ref(key))
      };
      wrapper.clone = function (key) {
        return refer(null, ref.clone(key))
      };
      wrapper.refer = wrapper.ref;
      wrapper._ref = ref;
      return wrapper
    }
  });
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
    global.Referential = module.exports = require('./referential')
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW50aWFsLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJyZWZlciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwic3RhdGUiLCJyZWYiLCJmbiIsImkiLCJsZW4iLCJtZXRob2QiLCJyZWYxIiwid3JhcHBlciIsImtleSIsImdldCIsImFwcGx5IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiY2xvbmUiLCJfcmVmIiwiZXh0ZW5kIiwiaXNBcnJheSIsImlzTnVtYmVyIiwiaXNPYmplY3QiLCJpc1N0cmluZyIsIl92YWx1ZSIsInBhcmVudCIsInNlbGVjdG9yMSIsInNlbGVjdG9yIiwicHJvdG90eXBlIiwidmFsdWUiLCJpbmRleCIsInNldCIsIm9iaiIsInByZXYiLCJuZXh0IiwiU3RyaW5nIiwic3BsaXQiLCJzbGljZSIsImhhc093biIsIk9iamVjdCIsImhhc093blByb3BlcnR5IiwidG9TdHIiLCJ0b1N0cmluZyIsImFyciIsIkFycmF5IiwiY2FsbCIsImlzUGxhaW5PYmplY3QiLCJoYXNPd25Db25zdHJ1Y3RvciIsImhhc0lzUHJvdG90eXBlT2YiLCJjb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJuYW1lIiwic3JjIiwiY29weSIsImNvcHlJc0FycmF5IiwidGFyZ2V0IiwiZGVlcCIsInN0ciIsInZhbCIsInR5cGVPZiIsIm51bSIsInR5cGUiLCJuIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCb29sZWFuIiwiTnVtYmVyIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJEYXRlIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidmFsdWVPZiIsInRyeVN0cmluZ09iamVjdCIsImUiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJnbG9iYWwiLCJSZWZlcmVudGlhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLEtBQVQsQztJQUVBRCxHQUFBLEdBQU1FLE9BQUEsQ0FBUSxPQUFSLENBQU4sQztJQUVBQyxNQUFBLENBQU9DLE9BQVAsR0FBaUJILEtBQUEsR0FBUSxVQUFTSSxLQUFULEVBQWdCQyxHQUFoQixFQUFxQjtBQUFBLE1BQzVDLElBQUlDLEVBQUosRUFBUUMsQ0FBUixFQUFXQyxHQUFYLEVBQWdCQyxNQUFoQixFQUF3QkMsSUFBeEIsRUFBOEJDLE9BQTlCLENBRDRDO0FBQUEsTUFFNUMsSUFBSU4sR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxRQUNmQSxHQUFBLEdBQU0sSUFEUztBQUFBLE9BRjJCO0FBQUEsTUFLNUMsSUFBSUEsR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxRQUNmQSxHQUFBLEdBQU0sSUFBSU4sR0FBSixDQUFRSyxLQUFSLENBRFM7QUFBQSxPQUwyQjtBQUFBLE1BUTVDTyxPQUFBLEdBQVUsVUFBU0MsR0FBVCxFQUFjO0FBQUEsUUFDdEIsT0FBT1AsR0FBQSxDQUFJUSxHQUFKLENBQVFELEdBQVIsQ0FEZTtBQUFBLE9BQXhCLENBUjRDO0FBQUEsTUFXNUNGLElBQUEsR0FBTztBQUFBLFFBQUMsT0FBRDtBQUFBLFFBQVUsS0FBVjtBQUFBLFFBQWlCLEtBQWpCO0FBQUEsUUFBd0IsUUFBeEI7QUFBQSxRQUFrQyxP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