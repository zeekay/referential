chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

extend = require 'node.extend'

before ->
  global.clone = (obj) ->
    extend true, {}, obj
