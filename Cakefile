use 'sake-bundle'
use 'sake-outdated'
use 'sake-publish'
use 'sake-version'

use 'cake-test' # Deprecated

task 'clean', 'clean project', ->
  exec '''
  rm -rf lib
  rm referential.js
  rm referential.min.js
  '''

task 'build', 'build project', ->
  b = new Bundle
    entry: 'src/index.coffee'
    compilers:
      coffee:
        version: 1

  # Browser (single file)
  Promise.all [
    b.write format: 'es'
    b.write
      format:   'cjs'
      external: false
    b.write
      format:    'web'
      external:  false
      sourceMap: false
  ]

task 'build:min', 'build project', ->
  exec 'uglifyjs referential.js -o referential.min.js'
