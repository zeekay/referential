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
        'index',
        'ref'
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
      wrapper.refer = function (key) {
        return refer(null, ref.ref(key))
      };
      wrapper.clone = function (key) {
        return refer(null, ref.clone(key))
      };
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
      function Ref(_value, parent, key1) {
        this._value = _value;
        this.parent = parent;
        this.key = key1
      }
      Ref.prototype.value = function (state) {
        if (this.parent == null) {
          if (state != null) {
            this._value = state
          }
          return this._value
        }
        if (state != null) {
          return this.parent.set(this.key, state)
        } else {
          return this.parent.get(this.key)
        }
      };
      Ref.prototype.ref = function (key) {
        if (key == null) {
          return this
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
      Ref.prototype.index = function (key, value, obj, prev) {
        var name, name1, next;
        if (obj == null) {
          obj = this.value()
        }
        if (prev == null) {
          prev = null
        }
        if (this.parent != null) {
          return this.parent.index(this.key + '.' + key, value)
        }
        if (isNumber(key)) {
          key = String(key)
        }
        if (isString(key)) {
          return this.index(key.split('.'), value, obj)
        } else if (key.length === 0) {
          return obj
        } else if (key.length === 1) {
          if (value != null) {
            return obj[key[0]] = value
          } else {
            return obj[key[0]]
          }
        } else {
          next = key[1];
          if (obj[next] == null) {
            if (isNumber(next)) {
              if (obj[name = key[0]] == null) {
                obj[name] = []
              }
            } else {
              if (obj[name1 = key[0]] == null) {
                obj[name1] = {}
              }
            }
          }
          return this.index(key.slice(1), value, obj[key[0]], obj)
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW50aWFsLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJyZWZlciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwic3RhdGUiLCJyZWYiLCJmbiIsImkiLCJsZW4iLCJtZXRob2QiLCJyZWYxIiwid3JhcHBlciIsImtleSIsImdldCIsImFwcGx5IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiY2xvbmUiLCJleHRlbmQiLCJpc0FycmF5IiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzU3RyaW5nIiwiX3ZhbHVlIiwicGFyZW50Iiwia2V5MSIsInByb3RvdHlwZSIsInZhbHVlIiwic2V0IiwiaW5kZXgiLCJvYmoiLCJwcmV2IiwibmFtZSIsIm5hbWUxIiwibmV4dCIsIlN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJoYXNPd24iLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyIiwidG9TdHJpbmciLCJhcnIiLCJBcnJheSIsImNhbGwiLCJpc1BsYWluT2JqZWN0IiwiaGFzT3duQ29uc3RydWN0b3IiLCJoYXNJc1Byb3RvdHlwZU9mIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3JjIiwiY29weSIsImNvcHlJc0FycmF5IiwidGFyZ2V0IiwiZGVlcCIsInN0ciIsInZhbCIsInR5cGVPZiIsIm51bSIsInR5cGUiLCJuIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCb29sZWFuIiwiTnVtYmVyIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJEYXRlIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidmFsdWVPZiIsInRyeVN0cmluZ09iamVjdCIsImUiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJnbG9iYWwiLCJSZWZlcmVudGlhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxHQUFKLEVBQVNDLEtBQVQsQztJQUVBRCxHQUFBLEdBQU1FLE9BQUEsQ0FBUSxPQUFSLENBQU4sQztJQUVBQyxNQUFBLENBQU9DLE9BQVAsR0FBaUJILEtBQUEsR0FBUSxVQUFTSSxLQUFULEVBQWdCQyxHQUFoQixFQUFxQjtBQUFBLE1BQzVDLElBQUlDLEVBQUosRUFBUUMsQ0FBUixFQUFXQyxHQUFYLEVBQWdCQyxNQUFoQixFQUF3QkMsSUFBeEIsRUFBOEJDLE9BQTlCLENBRDRDO0FBQUEsTUFFNUMsSUFBSU4sR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxRQUNmQSxHQUFBLEdBQU0sSUFEUztBQUFBLE9BRjJCO0FBQUEsTUFLNUMsSUFBSUEsR0FBQSxJQUFPLElBQVgsRUFBaUI7QUFBQSxRQUNmQSxHQUFBLEdBQU0sSUFBSU4sR0FBSixDQUFRSyxLQUFSLENBRFM7QUFBQSxPQUwyQjtBQUFBLE1BUTVDTyxPQUFBLEdBQVUsVUFBU0MsR0FBVCxFQUFjO0FBQUEsUUFDdEIsT0FBT1AsR0FBQSxDQUFJUSxHQUFKLENBQVFELEdBQVIsQ0FEZTtBQUFBLE9BQXhCLENBUjRDO0FBQUEsTUFXNUNGLElBQUEsR0FBTztBQUFBLFFBQUMsT0FBRDtBQUFBLFFBQVUsS0FBVjtBQUFBLFFBQWlCLEtBQWpCO0FBQUEsUUFBd0IsUUFBeEI7QUFBQSxRQUFrQyxPQUFsQztBQUFBLFFBQTJD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