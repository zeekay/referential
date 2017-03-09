chai = require 'chai'
chai.should()
chai.use require 'chai-as-promised'

before ->
  global.clone = (obj) ->
    Object.assign {}, obj
