extend   = require 'node.extend'
isArray  = require 'is-array'
isNumber = require 'is-number'
isObject = require 'is-object'
isString = require 'is-string'

module.exports = class Ref
  constructor: (@_value, @parent, @key) ->
    @_cache = {}

  # Clear the cache in case we've mutated
  _mutated: ->
    @_cache = {}

  # Get value of this or parent Ref
  value: (state) ->
    unless @parent?
      if state?
        @_value = state
      return @_value

    if state?
      @parent.set @key, state
    else
      @parent.get @key

  # Get a ref to this or subtree
  ref: (key) ->
    unless key?
      return @

    new Ref null, @, key

  # Get state or subtree
  get: (key) ->
    unless key?
      @value()
    else
      @index key

  # Set value overwriting tree alogn way
  set: (key, value) ->
    unless value?
      @value extend @value(), key
    else
      @index key, value
    @_mutated()
    @

  clone: (key) ->
    new Ref extend true, {}, @get key

  # Deep set some value
  extend: (key, value) ->
    unless value?
      @value extend, true, @value(), key
    else
      if isObject value
        @value extend true, (@ref key).get(), value
      else
        clone = @clone()
        @set key, value
        @value extend true, clone.get(), @value()
    @_mutated()
    @

  # Walk tree using key, optionally update value
  index: (key, value, obj=@value(), prev=null) ->
    if @parent?
      return @parent.index @key + '.' + key, value

    if isNumber key
      key = String key

    # Return cached copy if we have one
    return @_cache[key] if @_cache[key]?

    props = key.split '.'

    while prop = props.shift()
      if props.length == 0
        if value?
          return obj[prop] = value
        else
          return obj[prop]
      else
        next = props[0]
        unless obj[next]?
          if isNumber next
            obj[prop] ?= []
          else
            obj[prop] ?= {}

      obj = obj[prop]

    @_cache[key] = obj
