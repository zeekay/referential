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
        return ref.ref(key)
      };
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
        if (this.parent != null) {
          return this.parent.get(this.key)
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
      Ref.prototype.index = function (key, value, obj, prev) {
        var next;
        if (obj == null) {
          obj = this.value()
        }
        if (prev == null) {
          prev = null
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
              obj[key[0]] = []
            } else {
              obj[key[0]] = {}
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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlZmVyZW50aWFsLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1udW1iZXIvbm9kZV9tb2R1bGVzL2tpbmQtb2YvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtYnVmZmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW9iamVjdC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1zdHJpbmcvaW5kZXguanMiLCJicm93c2VyLmNvZmZlZSJdLCJuYW1lcyI6WyJSZWYiLCJyZWZlciIsInJlcXVpcmUiLCJtb2R1bGUiLCJleHBvcnRzIiwic3RhdGUiLCJyZWYiLCJmbiIsImkiLCJsZW4iLCJtZXRob2QiLCJyZWYxIiwid3JhcHBlciIsImtleSIsImdldCIsImFwcGx5IiwiYXJndW1lbnRzIiwibGVuZ3RoIiwiY2xvbmUiLCJleHRlbmQiLCJpc0FycmF5IiwiaXNOdW1iZXIiLCJpc09iamVjdCIsImlzU3RyaW5nIiwiX3ZhbHVlIiwicGFyZW50Iiwia2V5MSIsInByb3RvdHlwZSIsInZhbHVlIiwiaW5kZXgiLCJzZXQiLCJvYmoiLCJwcmV2IiwibmV4dCIsIlN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJoYXNPd24iLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyIiwidG9TdHJpbmciLCJhcnIiLCJBcnJheSIsImNhbGwiLCJpc1BsYWluT2JqZWN0IiwiaGFzT3duQ29uc3RydWN0b3IiLCJoYXNJc1Byb3RvdHlwZU9mIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwibmFtZSIsInNyYyIsImNvcHkiLCJjb3B5SXNBcnJheSIsInRhcmdldCIsImRlZXAiLCJzdHIiLCJ2YWwiLCJ0eXBlT2YiLCJudW0iLCJ0eXBlIiwibiIsImlzQnVmZmVyIiwia2luZE9mIiwiQm9vbGVhbiIsIk51bWJlciIsIkZ1bmN0aW9uIiwiUmVnRXhwIiwiRGF0ZSIsIkJ1ZmZlciIsIl9pc0J1ZmZlciIsIngiLCJzdHJWYWx1ZSIsInZhbHVlT2YiLCJ0cnlTdHJpbmdPYmplY3QiLCJlIiwic3RyQ2xhc3MiLCJoYXNUb1N0cmluZ1RhZyIsIlN5bWJvbCIsInRvU3RyaW5nVGFnIiwiZ2xvYmFsIiwiUmVmZXJlbnRpYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsR0FBSixFQUFTQyxLQUFULEM7SUFFQUQsR0FBQSxHQUFNRSxPQUFBLENBQVEsT0FBUixDQUFOLEM7SUFFQUMsTUFBQSxDQUFPQyxPQUFQLEdBQWlCSCxLQUFBLEdBQVEsVUFBU0ksS0FBVCxFQUFnQkMsR0FBaEIsRUFBcUI7QUFBQSxNQUM1QyxJQUFJQyxFQUFKLEVBQVFDLENBQVIsRUFBV0MsR0FBWCxFQUFnQkMsTUFBaEIsRUFBd0JDLElBQXhCLEVBQThCQyxPQUE5QixDQUQ0QztBQUFBLE1BRTVDLElBQUlOLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsUUFDZkEsR0FBQSxHQUFNLElBRFM7QUFBQSxPQUYyQjtBQUFBLE1BSzVDLElBQUlBLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsUUFDZkEsR0FBQSxHQUFNLElBQUlOLEdBQUosQ0FBUUssS0FBUixDQURTO0FBQUEsT0FMMkI7QUFBQSxNQVE1Q08sT0FBQSxHQUFVLFVBQVNDLEdBQVQsRUFBYztBQUFBLFFBQ3RCLE9BQU9QLEdBQUEsQ0FBSVEsR0FBSixDQUFRRCxHQUFSLENBRGU7QUFBQSxPQUF4QixDQVI0QztBQUFBLE1BVzVDRixJQUFBLEdBQU87QUFBQSxRQUFDLE9BQUQ7QUFBQSxRQUFVLEtBQVY7QUFBQSxRQUFpQixLQUFqQjtBQUFBLFFBQXdCLFFBQXhCO0FBQUEsUUFBa0MsT0FBbEM7QUFBQSxPQUFQLENBWDRDO0FB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SXVDLFNBQUosSUFDRXZDLEdBQUEsQ0FBSWlCLFdBQUosSUFDRCxPQUFPakIsR0FBQSxDQUFJaUIsV0FBSixDQUFnQmMsUUFBdkIsS0FBb0MsVUFEbkMsSUFFRC9CLEdBQUEsQ0FBSWlCLFdBQUosQ0FBZ0JjLFFBQWhCLENBQXlCL0IsR0FBekIsQ0FIRCxDQURPLENBRG9CO0FBQUEsSzs7OztJQ1RoQyxhO0lBRUE1QixNQUFBLENBQU9DLE9BQVAsR0FBaUIsU0FBU2tCLFFBQVQsQ0FBa0JpRCxDQUFsQixFQUFxQjtBQUFBLE1BQ3JDLE9BQU8sT0FBT0EsQ0FBUCxLQUFhLFFBQWIsSUFBeUJBLENBQUEsS0FBTSxJQUREO0FBQUEsSzs7OztJQ0Z0QyxhO0lBRUEsSUFBSUMsUUFBQSxHQUFXdEMsTUFBQSxDQUFPUCxTQUFQLENBQWlCOEMsT0FBaEMsQztJQUNBLElBQUlDLGVBQUEsR0FBa0IsU0FBU0EsZUFBVCxDQUF5QjlDLEtBQXpCLEVBQWdDO0FBQUEsTUFDckQsSUFBSTtBQUFBLFFBQ0g0QyxRQUFBLENBQVM1QixJQUFULENBQWNoQixLQUFkLEVBREc7QUFBQSxRQUVILE9BQU8sSUFGSjtBQUFBLE9BQUosQ0FHRSxPQUFPK0MsQ0FBUCxFQUFVO0FBQUEsUUFDWCxPQUFPLEtBREk7QUFBQSxPQUp5QztBQUFBLEtBQXRELEM7SUFRQSxJQUFJbkMsS0FBQSxHQUFRRixNQUFBLENBQU9YLFNBQVAsQ0FBaUJjLFFBQTdCLEM7SUFDQSxJQUFJbUMsUUFBQSxHQUFXLGlCQUFmLEM7SUFDQSxJQUFJQyxjQUFBLEdBQWlCLE9BQU9DLE1BQVAsS0FBa0IsVUFBbEIsSUFBZ0MsT0FBT0EsTUFBQSxDQUFPQyxXQUFkLEtBQThCLFFBQW5GLEM7SUFFQTVFLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQixTQUFTbUIsUUFBVCxDQUFrQkssS0FBbEIsRUFBeUI7QUFBQSxNQUN6QyxJQUFJLE9BQU9BLEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7QUFBQSxRQUFFLE9BQU8sSUFBVDtBQUFBLE9BRFU7QUFBQSxNQUV6QyxJQUFJLE9BQU9BLEtBQVAsS0FBaUIsUUFBckIsRUFBK0I7QUFBQSxRQUFFLE9BQU8sS0FBVDtBQUFBLE9BRlU7QUFBQSxNQUd6QyxPQUFPaUQsY0FBQSxHQUFpQkgsZUFBQSxDQUFnQjlDLEtBQWhCLENBQWpCLEdBQTBDWSxLQUFBLENBQU1JLElBQU4sQ0FBV2hCLEtBQVgsTUFBc0JnRCxRQUg5QjtBQUFBLEs7Ozs7SUNmMUNJLE1BQUEsQ0FBT0MsV0FBUCxHQUFxQjlFLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQkYsT0FBQSxDQUFRLGVBQVIsQyIsInNvdXJjZVJvb3QiOiIvc3JjIn0=