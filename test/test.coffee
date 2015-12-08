require './helper'

Ref         = require '../lib/ref'
referential = require '../lib'

describe 'referential', ->
  it 'should return underlying values', ->
    ref = referential a: 1
    ref().should.eql a: 1

describe 'Ref', ->
  it 'should create new refs', ->
    ref = new Ref 1

  it 'should encapsulate values', ->
    ref = new Ref 1
    ref.get().should.eq 1

  it 'should encapsulate objects', ->
    ref = new Ref a: 1
    ref.get().should.eql a: 1

  it 'should encapsulate arrays', ->
    ref = new Ref [1,2,3]
    ref.get().should.eql [1,2,3]

  it 'should set encapsulated values', ->
    ref = new Ref a: 1

    ref.set {a: 2}
    ref.get().should.eql {a: 2}

    ref.set 'b', 3
    ref.get().should.eql {a: 2, b: 3}

    ref = new Ref [1,2,3]
    ref.set 0, 4
    ref.get().should.eql [4,2,3]

    nested =
      a: 1
      b:
        c: 2
        d: 3
        e:
          f: 4
    ref = new Ref nested

    ref.set a: 2
    ref.set b: {c: 5}
    ref.get().should.eql a: 2, b: {c: 5}

  it 'should extend encapsulated values', ->
    nested =
      a: 1
      b:
        c: 2
        d: 3
        e:
          f: 4
    ref = new Ref nested
    ref.extend b: {e: {f: 5}}
    nested.b.e.f = 5
    ref.get().should.eql nested
    console.log ref.get()
