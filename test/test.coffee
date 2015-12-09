require './helper'

Ref   = require '../src/ref'
refer = require '../src/refer'

clone = (obj) ->
  extend true, {}, obj

describe 'refer', ->
  it 'should create Ref from values', ->
    ref = refer {a: 1}
    ref().should.eql {a: 1}
    ref('a').should.eq 1

    ref.set('b', 2)
    ref().should.eql {a: 1, b: 2}
    ref.set({c: 3})
    ref().should.eql {a: 1, b: 2, c: 3}

    ref.set('d.e.f', 4)
    ref().should.eql {a: 1, b: 2, c: 3, d: {e: {f: 4}}}

  it 'should create new wrapped Refs with refer', ->
    ref = refer {a: 1, b: 2, c: 3, d: {e: {f: 4}}}
    ref2 = ref.refer('d.e')
    ref2().should.eql {f: 4}

    ref2.set('g', 5)
    ref2().should.eql {f: 4, g: 5}

    ref.set('d.e.f', 6)
    ref().should.eql {a: 1, b: 2, c: 3, d: {e: {f: 6, g: 5}}}
    ref2().should.eql {f: 6, g: 5}

    ref3 = ref2.clone()
    ref3.set('g', 6)
    ref3().should.eql {f: 6, g: 6}
    ref2().should.eql {f: 6, g: 5}

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

  describe '.set', ->
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

  describe '.extend', ->
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

  describe '.ref', ->
    it 'should return a reference', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r2.get().should.eql c: 2
