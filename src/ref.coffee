extend   = require 'extend'
isArray  = require 'is-array'
isNumber = require 'is-number'
isObject = require 'is-object'
isString = require 'is-string'

module.exports = class Ref
  constructor: (@_value, @parent, @selector) ->

  # Get value of this or parent Ref
  value: (state) ->
    if @parent?
      return @parent.get @selector

    if state?
      @_value = state
    @_value

  # Get a ref to this or subtree
  ref: (key) ->
    unless key?
      @
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

  clone: (key, value) ->
    new Ref extend true, {}, @value()

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

  # Walk tree using selector, optionally update value
  index: (selector, value, obj=@value(), prev=null) ->
    if isNumber selector
      selector = String selector

    if isString selector
      @index (selector.split '.'), value, obj
    else if selector.length == 0
      obj
    else if selector.length == 1
      if value?
        obj[selector[0]] = value
      else
        obj[selector[0]]
    else
      next = selector[1]
      unless obj[next]?
        if isNumber next
          obj[selector[0]] = []
        else
          obj[selector[0]] = {}

      @index (selector.slice 1), value, obj[selector[0]], obj
