# executive [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]  [![Gitter chat][gitter-image]][gitter-url]
#### Safely contain mutable state using references.

Sometimes you just want to pass a big bag of state round. Lightweight immutable datastructures for JavaScript.

## Install
```bash
$ npm install executive
```

## Usage
```javascript
refer = require('executive')

// Create a reference
ref = refer({a: 1})

// Get underlying value of reference
ref()    // {a: 1}
ref('a') // 1

// Mutate state
ref.set('b', 2)     // {a: 1, b: 2}
ref.set({c: 3})     // {a: 1, b: 2, c: 3}}

// Create entire tree as needed
ref.set('d.e.f', 4) // {a: 1, b: 2, c: 3, d: {e: {f: 4}}}

// Get reference to subtree
ref2 = ref.refer('d.e')
ref2() // {f: 4}

// Mutate subtree (and update parent)
ref2.set('g', 5)
ref2() // {f: 4, g: 5}

// Mutate parent (and update subtree)
ref.set('d.e.f', 6)
ref()  // {a: 1, b: 2, c: 3, d: {e: {f: 6, g: 5}}}
ref2() // {f: 6, g: 5}

// Clone ref, create new tree
ref3 = ref2.clone()
ref3.set('g', 6)
ref3() // {f: 6, g: 6}
ref2() // {f: 6, g: 5}
```

More examples in [`test/`](test).

[travis-url]: https://travis-ci.org/zeekay/executive
[travis-image]: https://img.shields.io/travis/zeekay/executive.svg
[coveralls-url]: https://coveralls.io/r/zeekay/executive/
[coveralls-image]: https://img.shields.io/coveralls/zeekay/executive.svg
[npm-url]: https://www.npmjs.com/package/executive
[npm-image]: https://img.shields.io/npm/v/executive.svg
[downloads-image]: https://img.shields.io/npm/dm/executive.svg
[downloads-url]: http://badge.fury.io/js/executive
[gitter-url]: https://gitter.im/zeekay/executive
[gitter-image]: https://img.shields.io/badge/gitter-join_chat-brightgreen.svg
