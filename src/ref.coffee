extend   = require 'extend'
isArray  = require 'is-array'
isNumber = require 'is-number'
isObject = require 'is-object'
isString = require 'is-string'

class Ref
  constructor: (@_value, @parent, @key) ->

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
    @

  # Walk tree using key, optionally update value
  index: (key, value, obj=@value(), prev=null) ->
    if @parent?
      return @parent.index @key + '.' + key, value

    if isNumber key
      key = String key

    if isString key
      @index (key.split '.'), value, obj
    else if key.length == 0
      obj
    else if key.length == 1
      if value?
        obj[key[0]] = value
      else
        obj[key[0]]
    else
      next = key[1]
      unless obj[next]?
        if isNumber next
          obj[key[0]] ?= []
        else
          obj[key[0]] ?= {}

      @index (key.slice 1), value, obj[key[0]], obj

module.exports = Ref
