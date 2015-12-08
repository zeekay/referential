Ref = require './ref'

module.exports = refer = (state, ref=null) ->
  ref ?= new Ref state

  wrapper = (key) -> ref.get key

  for method in ['value', 'get', 'set', 'extend', 'index']
    do (method) ->
      wrapper[method] = ->
        ref[method].apply ref, arguments

  wrapper.ref   = (key) -> refer null, ref.ref key
  wrapper.clone = (key) -> refer null, ref.clone key
  wrapper.refer = wrapper.ref
  wrapper._ref  = ref
  wrapper

