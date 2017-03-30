require 'shortcake'

use 'cake-bundle'
use 'cake-outdated'
use 'cake-publish'
use 'cake-test'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', ->
  b = yield bundle
    entry: 'src/index.coffee'
    compilers:
      coffee:
        version: 1

  # Browser (single file)
  yield b.write
    format:    'web'
    external:  false
    minify:    true
    sourceMap: false

  # Library for Bundlers, Node
  yield b.write
    formats: ['es', 'cjs']
