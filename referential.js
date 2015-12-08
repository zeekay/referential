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
    var Ref;
    Ref = require('./ref');
    module.exports = function (value) {
      var ref;
      ref = new Ref(value);
      return function (k, v) {
        if (k != null && v != null) {
          return ref.set(k, v)
        } else {
          return ref.get()
        }
      }
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
    global.Referential = module.exports = require('./referential')
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW50aWFsLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJyZXF1aXJlIiwibW9kdWxlIiwiZXhwb3J0cyIsInZhbHVlIiwicmVmIiwiayIsInYiLCJzZXQiLCJnZXQiLCJleHRlbmQiLCJpc0FycmF5IiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzU3RyaW5nIiwiX3ZhbHVlIiwicGFyZW50Iiwic2VsZWN0b3IxIiwic2VsZWN0b3IiLCJwcm90b3R5cGUiLCJzdGF0ZSIsImtleSIsImluZGV4IiwiY2xvbmUiLCJvYmoiLCJwcmV2IiwibmV4dCIsIlN0cmluZyIsInNwbGl0IiwibGVuZ3RoIiwic2xpY2UiLCJoYXNPd24iLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyIiwidG9TdHJpbmciLCJhcnIiLCJBcnJheSIsImNhbGwiLCJpc1BsYWluT2JqZWN0IiwiaGFzT3duQ29uc3RydWN0b3IiLCJoYXNJc1Byb3RvdHlwZU9mIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInNyYyIsImNvcHkiLCJjb3B5SXNBcnJheSIsInRhcmdldCIsImFyZ3VtZW50cyIsImkiLCJkZWVwIiwic3RyIiwidmFsIiwidHlwZU9mIiwibnVtIiwidHlwZSIsIm4iLCJpc0J1ZmZlciIsImtpbmRPZiIsIkJvb2xlYW4iLCJOdW1iZXIiLCJGdW5jdGlvbiIsIlJlZ0V4cCIsIkRhdGUiLCJCdWZmZXIiLCJfaXNCdWZmZXIiLCJ4Iiwic3RyVmFsdWUiLCJ2YWx1ZU9mIiwidHJ5U3RyaW5nT2JqZWN0IiwiZSIsInN0ckNsYXNzIiwiaGFzVG9TdHJpbmdUYWciLCJTeW1ib2wiLCJ0b1N0cmluZ1RhZyIsImdsb2JhbCIsIlJlZmVyZW50aWFsIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQUFBLElBQUlBLEdBQUosQztJQUVBQSxHQUFBLEdBQU1DLE9BQUEsQ0FBUSxPQUFSLENBQU4sQztJQUVBQyxNQUFBLENBQU9DLE9BQVAsR0FBaUIsVUFBU0MsS0FBVCxFQUFnQjtBQUFBLE1BQy9CLElBQUlDLEdBQUosQ0FEK0I7QUFBQSxNQUUvQkEsR0FBQSxHQUFNLElBQUlMLEdBQUosQ0FBUUksS0FBUixDQUFOLENBRitCO0FBQUEsTUFHL0IsT0FBTyxVQUFTRSxDQUFULEVBQVlDLENBQVosRUFBZTtBQUFBLFFBQ3BCLElBQUtELENBQUEsSUFBSyxJQUFOLElBQWdCQyxDQUFBLElBQUssSUFBekIsRUFBZ0M7QUFBQSxVQUM5QixPQUFPRixHQUFBLENBQUlHLEdBQUosQ0FBUUYsQ0FBUixFQUFXQyxDQUFYLENBRHVCO0FBQUEsU0FBaEMsTUFFTztBQUFBLFVBQ0wsT0FBT0YsR0FBQSxDQUFJSSxHQUFKLEVBREY7QUFBQSxTQUhhO0FBQUEsT0FIUztBQUFBLEs7Ozs7SUNKakMsSUFBSVQsR0FBSixFQUFTVSxNQUFULEVBQWlCQyxPQUFqQixFQUEwQkMsUUFBMUIsRUFBb0NDLFFBQXBDLEVBQThDQyxRQUE5QyxDO0lBRUFKLE1BQUEsR0FBU1QsT0FBQSxDQUFRLFFBQVIsQ0FBVCxDO0lBRUFVLE9BQUEsR0FBVVYsT0FBQSxDQUFRLFVBQVIsQ0FBVixDO0lBRUFXLFFBQUEsR0FBV1gsT0FBQSxDQUFRLFdBQVIsQ0FBWCxDO0lBRUFZLFFBQUEsR0FBV1osT0FB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