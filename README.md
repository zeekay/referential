# referential [![Build Status][travis-image]][travis-url] [![Coverage Status][coveralls-image]][coveralls-url] [![NPM version][npm-image]][npm-url]  [![Gitter chat][gitter-image]][gitter-url]
#### Safely contain mutable state using references.

Sometimes you just want to pass a big bag of state round. Lightweight immutable datastructures for JavaScript.

## Install
```bash
$ npm install referential
```

## Usage
```javascript
refer = require('referential')

// Create a reference
ref = refer({a: 1})

// Get underlying value of reference
ref()    // {a: 1}
ref('a') // 1

// Mutate state
ref.set('b', 2)     // {a: 1, b: 2}
ref.set({c: 3})     // {a: 1, b: 2, c: 3}}
ref.set('d.e.f', 4) // {a: 1, b: 2, c: 3, d: {e: {f: 4}}}

// Get reference to subtree
ref2 = ref.refer('d.e')
ref2()       // {f: 4}
ref2.set('g', 5) // {f: 4, g: 5}

// Mutate subtree (and update parent)
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

[referential.js]: https://cdn.rawgit.com/zeekay/referential/v0.1.0/referential.min.js
[travis-url]: https://travis-ci.org/zeekay/referential
[travis-image]: https://img.shields.io/travis/zeekay/referential.svg
[coveralls-url]: https://coveralls.io/r/zeekay/referential/
[coveralls-image]: https://img.shields.io/coveralls/zeekay/referential.svg
[npm-url]: https://www.npmjs.com/package/referential
[npm-image]: https://img.shields.io/npm/v/referential.svg
[downloads-image]: https://img.shields.io/npm/dm/referential.svg
[downloads-url]: http://badge.fury.io/js/referential
[gitter-url]: https://gitter.im/zeekay/referential
[gitter-image]: https://img.shields.io/badge/gitter-join_chat-brightgreen.svg
