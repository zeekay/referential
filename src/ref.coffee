isObject     = require 'is-object'
isArray      = require 'is-array'
objectAssign = require 'object-assign'

module.exports = class Ref
  constructor: (@value, @parent) ->

  get: ->
    @value

  set: (key, value) ->
    if value?
      @value[key] = value
    else
      for own k, v of key
        @value[k] = v

  extend: (obj) ->
    @value = objectAssign obj, @value

  # encapsulate: (value) ->
  #   if isArray value
  #     for v in value
  #       @encapsulate v, root

  #   else if isObject value
  #     for own k,v of value
  #       @encapsulate v, root

  #   new Ref @obj, @
