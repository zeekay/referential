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
  // source: src/index.coffee
  require.define('./index', function (module, exports, __dirname, __filename) {
    var refer;
    refer = require('./refer');
    refer.Ref = require('./ref');
    module.exports = refer
  });
  // source: src/refer.coffee
  require.define('./refer', function (module, exports, __dirname, __filename) {
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
    Ref = function () {
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
        throw new Error('eep');
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
    }();
    module.exports = Ref
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
    var typeOf = require('kind-of');
    module.exports = function isNumber(num) {
      var type = typeOf(num);
      if (type !== 'number' && type !== 'string') {
        return false
      }
      var n = +num;
      return n - n + 1 >= 0 && num !== ''
    }
  });
  // source: node_modules/kind-of/index.js
  require.define('kind-of', function (module, exports, __dirname, __filename) {
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
    global.Referential = module.exports = require('./index')
  });
  require('./browser')
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsInJlZmVyLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9raW5kLW9mL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1vYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtc3RyaW5nL2luZGV4LmpzIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsicmVmZXIiLCJyZXF1aXJlIiwiUmVmIiwibW9kdWxlIiwiZXhwb3J0cyIsInN0YXRlIiwicmVmIiwiZm4iLCJpIiwibGVuIiwibWV0aG9kIiwicmVmMSIsIndyYXBwZXIiLCJrZXkiLCJnZXQiLCJhcHBseSIsImFyZ3VtZW50cyIsImxlbmd0aCIsImNsb25lIiwiZXh0ZW5kIiwiaXNBcnJheSIsImlzTnVtYmVyIiwiaXNPYmplY3QiLCJpc1N0cmluZyIsIl92YWx1ZSIsInBhcmVudCIsImtleTEiLCJwcm90b3R5cGUiLCJ2YWx1ZSIsInNldCIsImluZGV4Iiwib2JqIiwicHJldiIsIm5hbWUiLCJuYW1lMSIsIm5leHQiLCJFcnJvciIsIlN0cmluZyIsInNwbGl0Iiwic2xpY2UiLCJoYXNPd24iLCJPYmplY3QiLCJoYXNPd25Qcm9wZXJ0eSIsInRvU3RyIiwidG9TdHJpbmciLCJhcnIiLCJBcnJheSIsImNhbGwiLCJpc1BsYWluT2JqZWN0IiwiaGFzT3duQ29uc3RydWN0b3IiLCJoYXNJc1Byb3RvdHlwZU9mIiwiY29uc3RydWN0b3IiLCJvcHRpb25zIiwic3JjIiwiY29weSIsImNvcHlJc0FycmF5IiwidGFyZ2V0IiwiZGVlcCIsInN0ciIsInZhbCIsInR5cGVPZiIsIm51bSIsInR5cGUiLCJuIiwiaXNCdWZmZXIiLCJraW5kT2YiLCJCb29sZWFuIiwiTnVtYmVyIiwiRnVuY3Rpb24iLCJSZWdFeHAiLCJEYXRlIiwiQnVmZmVyIiwiX2lzQnVmZmVyIiwieCIsInN0clZhbHVlIiwidmFsdWVPZiIsInRyeVN0cmluZ09iamVjdCIsImUiLCJzdHJDbGFzcyIsImhhc1RvU3RyaW5nVGFnIiwiU3ltYm9sIiwidG9TdHJpbmdUYWciLCJnbG9iYWwiLCJSZWZlcmVudGlhbCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFBQSxJQUFJQSxLQUFKLEM7SUFFQUEsS0FBQSxHQUFRQyxPQUFBLENBQVEsU0FBUixDQUFSLEM7SUFFQUQsS0FBQSxDQUFNRSxHQUFOLEdBQVlELE9BQUEsQ0FBUSxPQUFSLENBQVosQztJQUVBRSxNQUFBLENBQU9DLE9BQVAsR0FBaUJKLEs7Ozs7SUNOakIsSUFBSUUsR0FBSixFQUFTRixLQUFULEM7SUFFQUUsR0FBQSxHQUFNRCxPQUFBLENBQVEsT0FBUixDQUFOLEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCSixLQUFBLEdBQVEsVUFBU0ssS0FBVCxFQUFnQkMsR0FBaEIsRUFBcUI7QUFBQSxNQUM1QyxJQUFJQyxFQUFKLEVBQVFDLENBQVIsRUFBV0MsR0FBWCxFQUFnQkMsTUFBaEIsRUFBd0JDLElBQXhCLEVBQThCQyxPQUE5QixDQUQ0QztBQUFBLE1BRTVDLElBQUlOLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsUUFDZkEsR0FBQSxHQUFNLElBRFM7QUFBQSxPQUYyQjtBQUFBLE1BSzVDLElBQUlBLEdBQUEsSUFBTyxJQUFYLEVBQWlCO0FBQUEsUUFDZkEsR0FBQSxHQUFNLElBQUlKLEdBQUosQ0FBUUcsS0FBUixDQURTO0FBQUEsT0FMMkI7QUFBQSxNQVE1Q08sT0FBQSxHQUFVLFVBQVNDLEdBQVQsRUFBYztBQUFBLFFBQ3RCLE9BQU9QLEdBQUEsQ0FBSVEsR0FBSixDQUFRRCxHQUFS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