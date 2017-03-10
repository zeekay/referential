require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

task 'clean', 'clean project', ->
  exec 'rm -rf dist'

task 'build', 'build project', ->
  handroll = require 'handroll'

  # Browser (single file)
  bundle = yield handroll.bundle
    entry:     'src/index.coffee'
    minify:    true
    sourceMap: false

  yield bundle.write format: 'web'

  # CommonJS && ES Module
  bundle = yield handroll.bundle
    entry:    'src/index.coffee'
    external: true

  yield bundle.write format: 'cjs'
  yield bundle.write format: 'es'
