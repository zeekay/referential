var Referential = (function (isNumber,isObject,objectAssign,observable) {
'use strict';

isNumber = 'default' in isNumber ? isNumber['default'] : isNumber;
isObject = 'default' in isObject ? isObject['default'] : isObject;
objectAssign = 'default' in objectAssign ? objectAssign['default'] : objectAssign;
observable = 'default' in observable ? observable['default'] : observable;

// src/ref.coffee
var Ref;
var nextId;
var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    this._numChildren = 0;
    this._id = nextId();
    if (this.parent != null) {
      this.parent._children[this._id] = this;
      this.parent._numChildren++;
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
    this.off('*');
    if (this.parent) {
      delete this.parent._children[this._id];
      this.parent._numChildren--;
    }
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
      this.value(objectAssign(this.value(), key));
    } else {
      this.index(key, value);
    }
    this._triggerSet(key, value, oldValue);
    this._triggerSetChildren(key, value, oldValue);
    return this;
  };

  Ref.prototype._triggerSetChildren = function(key, value, oldValue) {
    var child, childKeys, childRemainderKey, i, id, keyPart, keyParts, partialKey, ref, ref1, regExps, results;
    if (this._numChildren === 0) {
      return this;
    }
    key = key + '';
    keyParts = key.split('.');
    partialKey = '';
    childKeys = [];
    regExps = {};
    for (i in keyParts) {
      keyPart = keyParts[i];
      if (partialKey === '') {
        partialKey = keyPart;
      } else {
        partialKey += '.' + keyPart;
      }
      childKeys[i] = partialKey;
      regExps[partialKey] = new RegExp('^' + partialKey + '\.?');
    }
    ref = this._children;
    results = [];
    for (id in ref) {
      child = ref[id];
      if (ref1 = child.key, indexOf.call(childKeys, ref1) >= 0) {
        childRemainderKey = key.replace(regExps[child.key], '');
        child.trigger('set', childRemainderKey, value, oldValue);
        results.push(child._triggerSetChildren(childRemainderKey, value, oldValue));
      } else {
        results.push(void 0);
      }
    }
    return results;
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
      this.value(objectAssign(this.value(), key));
    } else {
      if (isObject(value)) {
        this.value(objectAssign((this.ref(key)).get(), value));
      } else {
        clone = this.clone();
        this.set(key, value);
        this.value(objectAssign(clone.get(), this.value()));
      }
    }
    return this;
  };

  Ref.prototype.clone = function(key) {
    return new Ref(objectAssign({}, this.get(key)));
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

}(isNumber,isObject,objectAssign,observable));
