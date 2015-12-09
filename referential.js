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
}.call(this, this))//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmNvZmZlZSIsInJlZmVyLmNvZmZlZSIsInJlZi5jb2ZmZWUiLCJub2RlX21vZHVsZXMvZXh0ZW5kL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWFycmF5L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLW51bWJlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9raW5kLW9mL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2lzLWJ1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pcy1vYmplY3QvaW5kZXguanMiLCJub2RlX21vZHVsZXMvaXMtc3RyaW5nL2luZGV4LmpzIiwiYnJvd3Nlci5jb2ZmZWUiXSwibmFtZXMiOlsicmVmZXIiLCJyZXF1aXJlIiwiUmVmIiwibW9kdWxlIiwiZXhwb3J0cyIsInN0YXRlIiwicmVmIiwiZm4iLCJpIiwibGVuIiwibWV0aG9kIiwicmVmMSIsIndyYXBwZXIiLCJrZXkiLCJnZXQiLCJhcHBseSIsImFyZ3VtZW50cyIsImxlbmd0aCIsImNsb25lIiwiZXh0ZW5kIiwiaXNBcnJheSIsImlzTnVtYmVyIiwiaXNPYmplY3QiLCJpc1N0cmluZyIsIl92YWx1ZSIsInBhcmVudCIsImtleTEiLCJwcm90b3R5cGUiLCJ2YWx1ZSIsInNldCIsImluZGV4Iiwib2JqIiwicHJldiIsIm5hbWUiLCJuYW1lMSIsIm5leHQiLCJTdHJpbmciLCJzcGxpdCIsInNsaWNlIiwiaGFzT3duIiwiT2JqZWN0IiwiaGFzT3duUHJvcGVydHkiLCJ0b1N0ciIsInRvU3RyaW5nIiwiYXJyIiwiQXJyYXkiLCJjYWxsIiwiaXNQbGFpbk9iamVjdCIsImhhc093bkNvbnN0cnVjdG9yIiwiaGFzSXNQcm90b3R5cGVPZiIsImNvbnN0cnVjdG9yIiwib3B0aW9ucyIsInNyYyIsImNvcHkiLCJjb3B5SXNBcnJheSIsInRhcmdldCIsImRlZXAiLCJzdHIiLCJ2YWwiLCJ0eXBlT2YiLCJudW0iLCJ0eXBlIiwibiIsImlzQnVmZmVyIiwia2luZE9mIiwiQm9vbGVhbiIsIk51bWJlciIsIkZ1bmN0aW9uIiwiUmVnRXhwIiwiRGF0ZSIsIkJ1ZmZlciIsIl9pc0J1ZmZlciIsIngiLCJzdHJWYWx1ZSIsInZhbHVlT2YiLCJ0cnlTdHJpbmdPYmplY3QiLCJlIiwic3RyQ2xhc3MiLCJoYXNUb1N0cmluZ1RhZyIsIlN5bWJvbCIsInRvU3RyaW5nVGFnIiwiZ2xvYmFsIiwiUmVmZXJlbnRpYWwiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lBQUEsSUFBSUEsS0FBSixDO0lBRUFBLEtBQUEsR0FBUUMsT0FBQSxDQUFRLFNBQVIsQ0FBUixDO0lBRUFELEtBQUEsQ0FBTUUsR0FBTixHQUFZRCxPQUFBLENBQVEsT0FBUixDQUFaLEM7SUFFQUUsTUFBQSxDQUFPQyxPQUFQLEdBQWlCSixLOzs7O0lDTmpCLElBQUlFLEdBQUosRUFBU0YsS0FBVCxDO0lBRUFFLEdBQUEsR0FBTUQsT0FBQSxDQUFRLE9BQVIsQ0FBTixDO0lBRUFFLE1BQUEsQ0FBT0MsT0FBUCxHQUFpQkosS0FBQSxHQUFRLFVBQVNLLEtBQVQsRUFBZ0JDLEdBQWhCLEVBQXFCO0FBQUEsTUFDNUMsSUFBSUMsRUFBSixFQUFRQyxDQUFSLEVBQVdDLEdBQVgsRUFBZ0JDLE1BQWhCLEVBQXdCQyxJQUF4QixFQUE4QkMsT0FBOUIsQ0FENEM7QUFBQSxNQUU1QyxJQUFJTixHQUFBLElBQU8sSUFBWCxFQUFpQjtBQUFBLFFBQ2ZBLEdBQUEsR0FBTSxJQURTO0FBQUEsT0FGMkI7QUFBQSxNQUs1QyxJQUFJQSxHQUFBLElBQU8sSUFBWCxFQUFpQjtBQUFBLFFBQ2ZBLEdBQUEsR0FBTSxJQUFJSixHQUFKLENBQVFHLEtBQVIsQ0FEUztBQUFBLE9BTDJCO0FBQUEsTUFRNUNPLE9BQUEsR0FBVSxVQUFTQyxHQUFULEVBQWM7QUFBQSxRQUN0QixPQUFPUCxHQUFBLENBQUlRLEdBQUosQ0FBUUQsR0FBUixDQURlO0FB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