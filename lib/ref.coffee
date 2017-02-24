import extend   from 'extend'
import isNumber from 'is-number'
import isObject from 'is-object'

nextId = do ->
  ids = 0
  -> ids++

export default class Ref
  constructor: (@_value, @parent, @key) ->
    @_cache    = {}
    @_children = {}
    @_id       = nextId()

    @parent._children[@_id] = @ if @parent?
    @

  # Clear the cache
  _mutate: (key) ->
    # TODO: do something smarter with key rather than wiping out entire cache
    @_cache = {}

    # clear children as well
    child._mutate() for id, child of @_children

    @

  # Removes reference
  destroy: ->
    child.destroy() for id, child of @_children
    delete @_cache
    delete @_children
    delete @parent._children[@_id]
    @

  # Get value of this or parent Ref
  value: (state) ->
    unless @parent
      if state?
        @_value = state
      return @_value

    if state?
      @parent.set @key, state
    else
      @parent.get @key

  # Get a ref to this or subtree
  ref: (key) ->
    unless key
      return @

    new Ref null, @, key

  # Get state or subtree
  get: (key) ->
    unless key
      @value()
    else
      return @_cache[key] if @_cache[key]
      @_cache[key] = @index key

  # Set value overwriting tree along way
  set: (key, value) ->
    @_mutate key

    unless value?
      @value extend @value(), key
    else
      @index key, value
    @

  # Deep set some value
  extend: (key, value) ->
    @_mutate key

    unless value?
      @value extend true, @value(), key
    else
      if isObject value
        @value extend true, (@ref key).get(), value
      else
        clone = @clone()
        @set key, value
        @value extend true, clone.get(), @value()
    @

  clone: (key) ->
    new Ref extend true, {}, @get key

  # Walk tree using key, optionally update value
  index: (key, value, obj=@value(), prev) ->
    if @parent
      return @parent.index @key + '.' + key, value

    if isNumber key
      key = String key

    props = key.split '.'

    unless value?
      # Get is simple, doesn't need to create properties as it goes
      while prop = props.shift()
        unless props.length
          return obj?[prop]
        obj = obj?[prop]
      return

    # Set version creates tree if necessary
    while prop = props.shift()
      unless props.length
        return obj[prop] = value
      else
        next = props[0]
        unless obj[next]?
          if isNumber next
            obj[prop] ?= []
          else
            obj[prop] ?= {}
      obj = obj[prop]
    return
