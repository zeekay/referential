require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

coffee      = require 'rollup-plugin-coffee-script'
commonjs    = require 'rollup-plugin-commonjs'
nodeResolve = require 'rollup-plugin-node-resolve'
rollup      = require 'rollup'

pkg         = require './package'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', ->
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

  # Browser (single file)
  bundle = yield rollup.rollup
    entry:   'src/index.coffee'
    plugins:  plugins

  yield bundle.write
    dest:       'referential.js'
    format:     'iife'
    moduleName: 'Referential'

  # CommonJS && ES Module
  bundle = yield rollup.rollup
    entry:    'src/index.coffee'
    external: Object.keys pkg.dependencies
    plugins:  plugins

  bundle.write
    dest:       pkg.main
    format:     'cjs'
    moduleName: 'referential'
    sourceMap:  'inline'

  bundle.write
    dest:      pkg.module
    format:    'es'
    sourceMap: 'inline'

task 'build:min', 'build project', ['build'], ->
  exec 'uglifyjs referential.js --compress --mangle --lint=false > referential.min.js'
