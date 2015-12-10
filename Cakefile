require 'shortcake'

use 'cake-test'
use 'cake-publish'
use 'cake-version'

fs        = require 'fs'
requisite = require 'requisite'

option '-b', '--browser [browser]', 'browser to use for tests'
option '-g', '--grep [filter]',     'test filter'
option '-t', '--test [test]',       'specify test to run'
option '-v', '--verbose',           'enable verbose test logging'

task 'clean', 'clean project', ->
  exec 'rm -rf lib'

task 'build', 'build project', (cb) ->
  todo = 2
  done = (err) ->
    throw err if err?
    cb() if --todo is 0

  exec 'coffee -bcm -o lib/ src/', done

  opts =
    entry:      'src/browser.coffee'
    stripDebug: true

  requisite.bundle opts, (err, bundle) ->
    return done err if err?
    fs.writeFile 'referential.js', (bundle.toString opts), 'utf8', done

task 'build-min', 'build project', ['build'], ->
  exec 'uglifyjs referential.js --compress --mangle --lint=false > referential.min.js'

task 'watch', 'watch for changes and recompile project', ->
  exec 'coffee -bcmw -o lib/ src/'
