Ref = require './ref'

module.exports = (value) ->
  ref = new Ref value

  (k, v) ->
    if k? and v?
      ref.set k, v
    else
      ref.get()
