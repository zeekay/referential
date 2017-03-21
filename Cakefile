require 'shortcake'

use 'cake-bundle'
use 'cake-outdated'
use 'cake-publish'
use 'cake-test'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', ->
  # Browser (single file)
  yield bundle.write
    entry:     'src/index.coffee'
    format:    'web'
    external:  false
    minify:    true
    sourceMap: false

  # Library for Bundlers, Node
  yield bundle.write
    entry:   'src/index.coffee'
    formats: ['es', 'cjs']
