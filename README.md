# referential [![NPM version][npm-img]][npm-url] [![Build Status][travis-img]][travis-url] [![Coverage Status][coveralls-img]][coveralls-url] [![Dependency Status][dependency-img]][dependency-url] [![Gitter chat][gitter-img]][gitter-url]
#### Safely contain mutable state with references.

Share mutable state safely. References and subtrees always refer to same
underlying data regardless where in your application it's mutated.

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
ref.set('b', 2) // {a: 1, b: 2}
ref.set({c: 3}) // {a: 1, b: 2, c: 3}

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

Check the tests for [more examples][examples].

[examples]:         https://github.com/zeekay/referential/blob/master/test/test.coffee

[travis-img]:     https://img.shields.io/travis/zeekay/referential.svg
[travis-url]:     https://travis-ci.org/zeekay/referential
[coveralls-img]:  https://coveralls.io/repos/zeekay/referential/badge.svg?branch=master&service=github
[coveralls-url]:  https://coveralls.io/github/zeekay/referential?branch=master
[dependency-url]: https://david-dm.org/zeekay/referential
[dependency-img]: https://david-dm.org/zeekay/referential.svg
[npm-img]:        https://img.shields.io/npm/v/referential.svg
[npm-url]:        https://www.npmjs.com/package/referential
[gitter-img]:     https://badges.gitter.im/join-chat.svg
[gitter-url]:     https://gitter.im/zeekay/hi

<!-- not used -->
[downloads-img]:     https://img.shields.io/npm/dm/referential.svg
[downloads-url]:     http://badge.fury.io/js/referential
[devdependency-img]: https://david-dm.org/zeekay/referential/dev-status.svg
[devdependency-url]: https://david-dm.org/zeekay/referential#info=devDependencies
