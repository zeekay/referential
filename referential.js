var Referential = (function () {
'use strict';

// node_modules/es-object-assign/index.mjs
var getOwnPropertySymbols;
var hasOwnProperty;
var objectAssign;
var propIsEnumerable;
var shouldUseNative;
var toObject;
var slice = [].slice;

getOwnPropertySymbols = Object.getOwnPropertySymbols;

hasOwnProperty = Object.prototype.hasOwnProperty;

propIsEnumerable = Object.prototype.propertyIsEnumerable;

toObject = function(val) {
  if (val === null || val === void 0) {
    throw new TypeError('Object.assign cannot be called with null or undefined');
  }
  return Object(val);
};

shouldUseNative = function() {
  var err, i, j, k, len, letter, order2, ref, test1, test2, test3;
  try {
    if (!Object.assign) {
      return false;
    }
    test1 = new String('abc');
    test1[5] = 'de';
    if (Object.getOwnPropertyNames(test1)[0] === '5') {
      return false;
    }
    test2 = {};
    for (i = j = 0; j <= 9; i = ++j) {
      test2['_' + String.fromCharCode(i)] = i;
    }
    order2 = Object.getOwnPropertyNames(test2).map(function(n) {
      return test2[n];
    });
    if (order2.join('') !== '0123456789') {
      return false;
    }
    test3 = {};
    ref = 'abcdefghijklmnopqrst'.split('');
    for (k = 0, len = ref.length; k < len; k++) {
      letter = ref[k];
      test3[letter] = letter;
    }
    if (Object.keys(Object.assign({}, test3)).join('') !== 'abcdefghijklmnopqrst') {
      return false;
    }
    return true;
  } catch (error) {
    err = error;
    return false;
  }
};

var index = objectAssign = (function() {
  if (shouldUseNative()) {
    return Object.assign;
  }
  return function() {
    var from, j, k, key, len, len1, ref, source, sources, symbol, target, to;
    target = arguments[0], sources = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    to = toObject(target);
    for (j = 0, len = sources.length; j < len; j++) {
      source = sources[j];
      from = Object(source);
      for (key in from) {
        if (hasOwnProperty.call(from, key)) {
          to[key] = from[key];
        }
      }
      if (getOwnPropertySymbols) {
        ref = getOwnPropertySymbols(from);
        for (k = 0, len1 = ref.length; k < len1; k++) {
          symbol = ref[k];
          if (propIsEnumerable.call(from, symbol)) {
            to[symbol] = from[symbol];
          }
        }
      }
    }
    return to;
  };
})();

// node_modules/es-is/dist/index.mjs
var isActualNaN;
var isArgs;
var isFn;
var objProto;
var owns;
var symbolValueOf;
var toStr;

objProto = Object.prototype;

owns = objProto.hasOwnProperty;

toStr = objProto.toString;

symbolValueOf = void 0;

if (typeof Symbol === 'function') {
  symbolValueOf = Symbol.prototype.valueOf;
}

isActualNaN = function(value) {
  return value !== value;
};

var isEqual = function(value, other) {
  var key, type;
  if (value === other) {
    return true;
  }
  type = toStr.call(value);
  if (type !== toStr.call(other)) {
    return false;
  }
  if (type === '[object Object]') {
    for (key in value) {
      if (!isEqual(value[key], other[key]) || !(key in other)) {
        return false;
      }
    }
    for (key in other) {
      if (!isEqual(value[key], other[key]) || !(key in value)) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Array]') {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (key--) {
      if (!isEqual(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }
  if (type === '[object Function]') {
    return value.prototype === other.prototype;
  }
  if (type === '[object Date]') {
    return value.getTime() === other.getTime();
  }
  return false;
};

var isArrayLike = function(value) {
  return !!value && !isBool(value) && owns.call(value, 'length') && isFinite(value.length) && isNumber(value.length) && value.length >= 0;
};

var isArguments = isArgs = function(value) {
  var isOldArguments, isStandardArguments;
  isStandardArguments = toStr.call(value) === '[object Arguments]';
  isOldArguments = !isArray(value) && isArrayLike(value) && isObject(value) && isFn(value.callee);
  return isStandardArguments || isOldArguments;
};

var isArray = Array.isArray || function(value) {
  return toStr.call(value) === '[object Array]';
};

var isBool = function(value) {
  return toStr.call(value) === '[object Boolean]';
};

var isFunction = isFn = function(value) {
  var isAlert, str;
  isAlert = typeof window !== 'undefined' && value === window.alert;
  if (isAlert) {
    return true;
  }
  str = toStr.call(value);
  return str === '[object Function]' || str === '[object GeneratorFunction]' || str === '[object AsyncFunction]';
};

var isNumber = function(value) {
  return toStr.call(value) === '[object Number]';
};

var isObject = function(value) {
  return toStr.call(value) === '[object Object]';
};

// node_modules/riot-observable/dist/es6.observable.js
var observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {};

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice;

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given `event` ands
     * execute the `callback` each time an event is triggered.
     * @param  { String } event - event id
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(event, fn) {
        if (typeof fn == 'function')
          (callbacks[event] = callbacks[event] || []).push(fn);
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given `event` listeners
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(event, fn) {
        if (event == '*' && !fn) callbacks = {};
        else {
          if (fn) {
            var arr = callbacks[event];
            for (var i = 0, cb; cb = arr && arr[i]; ++i) {
              if (cb == fn) arr.splice(i--, 1);
            }
          } else delete callbacks[event];
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given `event` and
     * execute the `callback` at most once
     * @param   { String } event - event id
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(event, fn) {
        function on() {
          el.off(event, on);
          fn.apply(el, arguments);
        }
        return el.on(event, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given `event`
     * @param   { String } event - event id
     * @returns { Object } el
     */
    trigger: {
      value: function(event) {

        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns,
          fn,
          i;

        for (i = 0; i < arglen; i++) {
          args[i] = arguments[i + 1]; // skip first argument
        }

        fns = slice.call(callbacks[event] || [], 0);

        for (i = 0; fn = fns[i]; ++i) {
          fn.apply(el, args);
        }

        if (callbacks['*'] && event != '*')
          el.trigger.apply(el, ['*', event].concat(args));

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  });

  return el

};

// src/ref.coffee
var Ref;
var nextId;

nextId = (function() {
  var ids;
  ids = 0;
  return function() {
    return ids++;
  };
})();

var Ref$1 = Ref = (function() {
  function Ref(_value, parent, key1) {
    this._value = _value;
    this.parent = parent;
    this.key = key1;
    this._cache = {};
    this._children = {};
    this._id = nextId();
    if (this.parent != null) {
      this.parent._children[this._id] = this;
    }
    observable(this);
    this;
  }

  Ref.prototype._mutate = function(key) {
    var child, id, ref;
    this._cache = {};
    ref = this._children;
    for (id in ref) {
      child = ref[id];
      child._mutate();
    }
    return this;
  };

  Ref.prototype.destroy = function() {
    var child, id, ref;
    ref = this._children;
    for (id in ref) {
      child = ref[id];
      child.destroy();
    }
    delete this._cache;
    delete this._children;
    delete this.parent._children[this._id];
    return this;
  };

  Ref.prototype.value = function(state) {
    if (!this.parent) {
      if (state != null) {
        this._value = state;
      }
      return this._value;
    }
    if (state != null) {
      return this.parent.set(this.key, state);
    } else {
      return this.parent.get(this.key);
    }
  };

  Ref.prototype.ref = function(key) {
    if (!key) {
      return this;
    }
    return new Ref(null, this, key);
  };

  Ref.prototype.get = function(key) {
    if (!key) {
      return this.value();
    } else {
      if (this._cache[key]) {
        return this._cache[key];
      }
      return this._cache[key] = this.index(key);
    }
  };

  Ref.prototype.set = function(key, value) {
    var k, oldValue, v;
    if (isObject(key)) {
      for (k in key) {
        v = key[k];
        this.set(k, v);
      }
      return this;
    }
    oldValue = this.get(key);
    this._mutate(key);
    if (value == null) {
      this.value(index(this.value(), key));
    } else {
      this.index(key, value);
    }
    this._triggerSet(key, value, oldValue);
    return this;
  };

  Ref.prototype._triggerSet = function(key, value, oldValue) {
    var parentKey;
    this.trigger('set', key, value, oldValue);
    if (this.parent) {
      parentKey = this.key + '.' + key;
      return this.parent._triggerSet(parentKey, value, oldValue);
    }
  };

  Ref.prototype.extend = function(key, value) {
    var clone;
    this._mutate(key);
    if (value == null) {
      this.value(index(this.value(), key));
    } else {
      if (isObject(value)) {
        this.value(index((this.ref(key)).get(), value));
      } else {
        clone = this.clone();
        this.set(key, value);
        this.value(index(clone.get(), this.value()));
      }
    }
    return this;
  };

  Ref.prototype.clone = function(key) {
    return new Ref(index({}, this.get(key)));
  };

  Ref.prototype.index = function(key, value, obj, prev) {
    var next, prop, props;
    if (obj == null) {
      obj = this.value();
    }
    if (this.parent) {
      return this.parent.index(this.key + '.' + key, value);
    }
    if (isNumber(key)) {
      key = String(key);
    }
    props = key.split('.');
    if (value == null) {
      while (prop = props.shift()) {
        if (!props.length) {
          return obj != null ? obj[prop] : void 0;
        }
        obj = obj != null ? obj[prop] : void 0;
      }
      return;
    }
    while (prop = props.shift()) {
      if (!props.length) {
        return obj[prop] = value;
      } else {
        next = props[0];
        if (obj[prop] == null) {
          if (isNaN(Number(next))) {
            if (obj[prop] == null) {
              obj[prop] = {};
            }
          } else {
            if (obj[prop] == null) {
              obj[prop] = [];
            }
          }
        }
      }
      obj = obj[prop];
    }
  };

  return Ref;

})();

// src/index.coffee
var methods;
var refer;

methods = ['extend', 'get', 'index', 'ref', 'set', 'value', 'on', 'off', 'one', 'trigger'];

refer = function(state, ref) {
  var fn, i, len, method, wrapper;
  if (ref == null) {
    ref = null;
  }
  if (ref == null) {
    ref = new Ref$1(state);
  }
  wrapper = function(key) {
    return ref.get(key);
  };
  fn = function(method) {
    return wrapper[method] = function() {
      return ref[method].apply(ref, arguments);
    };
  };
  for (i = 0, len = methods.length; i < len; i++) {
    method = methods[i];
    fn(method);
  }
  wrapper.refer = function(key) {
    return refer(null, ref.ref(key));
  };
  wrapper.clone = function(key) {
    return refer(null, ref.clone(key));
  };
  return wrapper;
};

refer.Ref = Ref$1;

var refer$1 = refer;

return refer$1;

}());
