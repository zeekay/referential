use 'sake-bundle'
use 'sake-chai'
use 'sake-mocha'
use 'sake-outdated'
use 'sake-publish'
use 'sake-version'

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

  Promise.all [
    # ES module (for bundlers)
    b.write format: 'es'
    # Node.js
    b.write
      format:   'cjs'
      external: false
      include: ['es-is']
    # Browser (single file)
    b.write
      format:    'web'
      external:  false
      sourceMap: false
  ]

task 'build:min', 'build project', ->
  exec 'uglifyjs referential.js -o referential.min.js'
