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
  pkg      = require './package'
  external = Object.keys pkg.dependencies

  plugins = [
    coffee()
    nodeResolve
      browser: true
      extensions: ['.js', '.coffee']
      module:  true
    commonjs
      extensions: ['.js', '.coffee']
      sourceMap: true
  ]

  # Generate code for browser
  bundle = yield rollup.rollup
    entry:   'lib/index.coffee'
    plugins:  plugins

  yield bundle.write
    dest:       'referential.js'
    format:     'umd'
    moduleName: 'Referential'

  # Generate code for node.js and bundlers
  bundle = yield rollup.rollup
    entry:    'lib/index.coffee'
    cache:    bundle
    external: external
    plugins:  plugins

  bundle.write
    dest:      pkg.module
    format:    'es'
    sourceMap: 'inline'

  bundle.write
    dest:       pkg.main
    format:     'umd'
    moduleName: 'referential'
    sourceMap:  'inline'

task 'build:min', 'build project', ['build'], ->
  exec 'uglifyjs referential.js --compress --mangle --lint=false > referential.min.js'

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
