require './helper'
extend = require 'extend'

Ref         = require '../lib/ref'
referential = require '../lib'

clone = (obj) ->
  extend true, {}, obj

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
    tree =
      a: 1
      b:
        c: 2
        d: 3
        e:
          f: 4
          g: 5
    ref = new Ref clone tree
    ref.extend 'b.e.f', 6
    tree.b.e.f = 6
    ref.get().should.eql tree

  it 'should create tree as necessary', ->
    tree =
      a: 1
    ref = new Ref clone tree
    ref.set('b.c.d', 42)

    ref.get().should.eql
      a: 1
      b: {c: {d: 42}}

    ref.set('b.c.d', {e: 42})

    ref.get().should.eql
      a: 1
      b: {c: {d: {e: 42}}}

  it 'should create tree as necessary including arrays', ->
    tree =
      a: 1
    ref = new Ref clone tree
    ref.set('b.0', 42)

    ref.get().should.eql
      a: 1
      b: [42]

  it 'should use parent if one exists', ->
    tree =
      a: 1
      b:
        c: 2

    r = new Ref clone tree
    r2 = r.ref('b')
    r.set 'b', c: 3
    r.set 'b', c: 88
    r2.set 'c', 99
    r.get().should.eql
      a: 1
      b:
        c: 99
    r2.get().should.eql c: 99

  describe '.ref', ->
    it 'should return a reference', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r2.get().should.eql c: 2
