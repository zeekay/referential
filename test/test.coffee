require './helper'
should = require('chai').should()

refer = require '../'
Ref   = refer.Ref

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

  describe '.get', ->
    it 'should return encapsulate objects', ->
      ref = new Ref a: 1
      ref.get().should.eql a: 1

    it 'should encapsulate arrays', ->
      ref = new Ref [1,2,3]
      ref.get().should.eql [1,2,3]

    it 'should not error on invalid key', ->
      ref = new Ref a: 1
      ref.get('b')
      ref.get('b.c.d')

    it 'should use parent if one exists', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r.set 'b', c: 3
      r2.set 'c', 99
      r.get().should.eql
        a: 1
        b:
          c: 99
      r2.get().should.eql c: 99

    it 'should not use cache erroneously', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r.set 'b', c: 1
      r.get().b.c.should.eq 1
      r2.get().should.eql c: 1

      r2.set 'c', 2
      r.get().b.c.should.eq 2
      r2.get().should.eql c: 2

      r.set 'b', c: 3
      r.get().b.c.should.eq 3
      r2.get().should.eql c: 3

      r2.set 'c', 4
      r.get().b.c.should.eq 4
      r2.get().should.eql c: 4

      r.set 'b', c: 5
      r.get().b.c.should.eq 5
      r2.get().should.eql c: 5

      r2.set 'c', 6
      r.get().b.c.should.eq 6
      r2.get().should.eql c: 6

      r.set 'b', c: 7
      r.get().b.c.should.eq 7
      r2.get().should.eql c: 7

      tree =
        items: [
          {a: 1, b: 2}
          {a: 2, b: 3}
        ]

      r1 = refer clone tree
      r2 = r1.refer 'items.0'
      (r2.get 'a').should.eq 1
      (r1.set 'items.0.a', 42)
      (r1.get 'items.0.a').should.eq 42
      (r2.get 'a').should.eq 42

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

      ref = new Ref
        a:
          count: 1

      ref.set 'a.b.count', 2

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

    it 'should set null and undefined', ->
      tree =
        a: 1
      ref = new Ref clone tree
      ref.set 'a', undefined

      should.not.exist ref.get('a')

      ref.set 'a', null
      should.not.exist ref.get('a')

      ref.set 'a', 2
      ref.get('a').should.equal 2

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

      ref.extend {c: 3}
      ref.get().c.should.eq 3

  describe '.ref', ->
    it 'should return a reference', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r2.get().should.eql c: 2

  describe '.clear', ->
    it 'should clear everything', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r.clear()

      should.not.exist r.get()
      should.not.exist r2.get()

    it 'should be writeable after clear', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r.clear()

      should.not.exist r.get()
      should.not.exist r2.get()

      r.set({b: {c: 2}})
      r2.get().should.eql c: 2
      r.get().should.eql {b: {c: 2}}

    it 'should clear parent from ref', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r2.clear()
      should.not.exist r2.get()
      should.not.exist r.get('b')

    it 'should be writeable after clear parent from ref', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r2 = r.ref('b')
      r2.clear()

      should.not.exist r2.get()
      should.not.exist r.get('b')

      r2.set({c: 2})
      r2.get().should.eql c: 2
      r.get('b').should.eql c: 2
      r.get().should.eql tree

  describe '.value', ->
    it 'should get state and set state', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree
      r.value().should.eql tree
      r.value tree
      r.value().should.eql tree

  describe 'observable sanity check', ->
    it 'should bind events', ->
      tree =
        a: 1
        b:
          c: 2

      r = new Ref clone tree

      # ref
      r2 = r.ref 'b'

      z = 0
      r.on 'set', (k, x, y) ->
        if k == 'a'
          x.should.eql 2
          y.should.eql 1
          z++

      r.on 'set', (k, x, y) ->
        if k == 'b.c'
          if z == 1
            # console.log 'z=1', k, x, y
            x.should.eql 3
            y.should.eql 2
            z++
          else if z == 4
            # console.log 'z=3', k, x, y
            x.should.eql 4
            y.should.eql 3
            z++
        # console.log 'k == b.c', k, x, y

      r2.on 'set', (k, x, y) ->
        if k == 'c'
          if z == 2
            # console.log 'z=2', k, x, y
            x.should.eql 3
            y.should.eql 2
            z++
          else if z == 3
            # console.log 'z=4', k, x, y
            x.should.eql 4
            y.should.eql 3
            z++
        # console.log 'k == c', k, x, y

      # basic cases
      r.set 'a', 2
      r.set 'b.c', 3

      # ref cases
      r2.set 'c', 4

      z.should.eql 5

    it 'events should fire for deeply nested refs', ->
      tree =
        a:
          b:
            c:
              d: 1

      r = new Ref clone tree

      # ref
      r2 = r.ref 'a.b.c'

      z = 0
      r.on 'set', (k, x, y) ->
        if k == 'a.b.c.d'
          if z == 0
            x.should.eql 2
            y.should.eql 1
            z++

      r2.on 'set', (k, x, y) ->
        if k == 'd'
          if z == 1
            x.should.eql 2
            y.should.eql 1
            z++

      r.set 'a.b.c.d', 2

      z.should.eql 2
