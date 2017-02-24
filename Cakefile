require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

rollup      = require 'rollup'
commonjs    = require 'rollup-plugin-commonjs'
coffee      = require 'rollup-plugin-coffee-script'
nodeResolve = require 'rollup-plugin-node-resolve'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', ->
  bundle = yield rollup.rollup
    entry: 'src/index.coffee',
    plugins: [
      coffee()
      nodeResolve
        browser: true
        extensions: ['.js', '.coffee']
        module:  true
      commonjs
        extensions: ['.js', '.coffee']
        sourceMap: true
    ]

  bundle.write
    format: 'es'
    dest:   'lib/es.mjs'

  bundle.write
    format: 'cjs'
    dest:   'lib/cjs.js'

  yield bundle.write
    format: 'iife'
    dest:   'referential.js'
    moduleName: 'Referential'

task 'build:min', 'build project', ['build'], ->
  exec 'uglifyjs referential.js --compress --mangle --lint=false > referential.min.js'

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
