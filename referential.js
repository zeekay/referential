var Referential = (function () {
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {/**/}

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

var index = function extend() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if ((typeof target !== 'object' && typeof target !== 'function') || target == null) {
		target = {};
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
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

/**
 * Determine if an object is Buffer
 *
 * Author:   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * License:  MIT
 *
 * `npm install is-buffer`
 */

var index$4 = function (obj) {
  return !!(obj != null &&
    (obj._isBuffer || // For Safari 5-7 (missing Object.prototype.constructor)
      (obj.constructor &&
      typeof obj.constructor.isBuffer === 'function' &&
      obj.constructor.isBuffer(obj))
    ))
};

var isBuffer = index$4;
var toString = Object.prototype.toString;

/**
 * Get the native `typeof` a value.
 *
 * @param  {*} `val`
 * @return {*} Native javascript type
 */

var index$2 = function kindOf(val) {
  // primitivies
  if (typeof val === 'undefined') {
    return 'undefined';
  }
  if (val === null) {
    return 'null';
  }
  if (val === true || val === false || val instanceof Boolean) {
    return 'boolean';
  }
  if (typeof val === 'string' || val instanceof String) {
    return 'string';
  }
  if (typeof val === 'number' || val instanceof Number) {
    return 'number';
  }

  // functions
  if (typeof val === 'function' || val instanceof Function) {
    return 'function';
  }

  // array
  if (typeof Array.isArray !== 'undefined' && Array.isArray(val)) {
    return 'array';
  }

  // check for instances of RegExp and Date before calling `toString`
  if (val instanceof RegExp) {
    return 'regexp';
  }
  if (val instanceof Date) {
    return 'date';
  }

  // other objects
  var type = toString.call(val);

  if (type === '[object RegExp]') {
    return 'regexp';
  }
  if (type === '[object Date]') {
    return 'date';
  }
  if (type === '[object Arguments]') {
    return 'arguments';
  }

  // buffer
  if (typeof Buffer !== 'undefined' && isBuffer(val)) {
    return 'buffer';
  }

  // es6: Map, WeakMap, Set, WeakSet
  if (type === '[object Set]') {
    return 'set';
  }
  if (type === '[object WeakSet]') {
    return 'weakset';
  }
  if (type === '[object Map]') {
    return 'map';
  }
  if (type === '[object WeakMap]') {
    return 'weakmap';
  }
  if (type === '[object Symbol]') {
    return 'symbol';
  }

  // typed arrays
  if (type === '[object Int8Array]') {
    return 'int8array';
  }
  if (type === '[object Uint8Array]') {
    return 'uint8array';
  }
  if (type === '[object Uint8ClampedArray]') {
    return 'uint8clampedarray';
  }
  if (type === '[object Int16Array]') {
    return 'int16array';
  }
  if (type === '[object Uint16Array]') {
    return 'uint16array';
  }
  if (type === '[object Int32Array]') {
    return 'int32array';
  }
  if (type === '[object Uint32Array]') {
    return 'uint32array';
  }
  if (type === '[object Float32Array]') {
    return 'float32array';
  }
  if (type === '[object Float64Array]') {
    return 'float64array';
  }

  // must be a plain object
  return 'object';
};

var typeOf = index$2;

var index$1 = function isNumber(num) {
  var type = typeOf(num);

  if (type === 'string') {
    if (!num.trim()) return false;
  } else if (type !== 'number') {
    return false;
  }

  return (num - num + 1) >= 0;
};

var index$6 = function isObject(x) {
	return typeof x === "object" && x !== null;
};

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
    this._mutate(key);
    if (value == null) {
      this.value(index(this.value(), key));
    } else {
      this.index(key, value);
    }
    return this;
  };

  Ref.prototype.extend = function(key, value) {
    var clone;
    this._mutate(key);
    if (value == null) {
      this.value(index(true, this.value(), key));
    } else {
      if (index$6(value)) {
        this.value(index(true, (this.ref(key)).get(), value));
      } else {
        clone = this.clone();
        this.set(key, value);
        this.value(index(true, clone.get(), this.value()));
      }
    }
    return this;
  };

  Ref.prototype.clone = function(key) {
    return new Ref(index(true, {}, this.get(key)));
  };

  Ref.prototype.index = function(key, value, obj, prev) {
    var next, prop, props;
    if (obj == null) {
      obj = this.value();
    }
    if (this.parent) {
      return this.parent.index(this.key + '.' + key, value);
    }
    if (index$1(key)) {
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
          if (index$1(next)) {
            if (obj[prop] == null) {
              obj[prop] = [];
            }
          } else {
            if (obj[prop] == null) {
              obj[prop] = {};
            }
          }
        }
      }
      obj = obj[prop];
    }
  };

  return Ref;

})();

var refer;

refer = function(state, ref) {
  var fn, i, len, method, ref1, wrapper;
  if (ref == null) {
    ref = null;
  }
  if (ref == null) {
    ref = new Ref$1(state);
  }
  wrapper = function(key) {
    return ref.get(key);
  };
  ref1 = ['value', 'get', 'set', 'extend', 'index', 'ref'];
  fn = function(method) {
    return wrapper[method] = function() {
      return ref[method].apply(ref, arguments);
    };
  };
  for (i = 0, len = ref1.length; i < len; i++) {
    method = ref1[i];
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
