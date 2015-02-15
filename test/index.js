var chai = require('chai')
var sinon = require('sinon')
var Logdown = require('../src/index')

sinon.assert.expose(chai.assert, {prefix: ''})
var assert = chai.assert

function createInstances() {
  return [
    new Logdown({prefix: 'foo'}),
    new Logdown({prefix: 'bar'}),
    new Logdown({prefix: 'quz'}),
    new Logdown({prefix: 'baz'})
  ]
}

describe('new Logdown()', function() {
  it('should return an existing instance if the prefix is already in use', function() {
    var foo = new Logdown({prefix: 'foo'})
    var foo2 = new Logdown({prefix: 'foo'})
    assert.equal(foo, foo2)
  })
})

describe('Logdown.enable', function() {
  var sandbox

  beforeEach(function() {
    sandbox = sinon.sandbox.create()

    sandbox.stub(global.console, 'log')
  })

  afterEach(function() {
    sandbox.restore()
  })

  it('`(\'*\')` should enable all instances', function() {
    Logdown.disable('*')
    Logdown.enable('*')
    var instances = createInstances()
    instances.forEach(function(instance) {
      instance.log('Lorem')
    })

    assert.called(console.log)
    sandbox.restore()
  })

  it('`(\'foo\')` should enable only instances with “foo” prefix', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var quz = new Logdown({prefix: 'quz'})
    var baz = new Logdown({prefix: 'baz'})

    Logdown.disable('*')
    Logdown.enable('foo')


    bar.log('lorem')
    assert.notCalled(console.log)
    quz.log('lorem')
    assert.notCalled(console.log)
    baz.log('lorem')
    assert.notCalled(console.log)
    foo.log('lorem')
    assert.called(console.log)

    sandbox.restore()
  })

  it('`(\'*foo\')` should enable only instances with names ending with “foo”', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var foobar = new Logdown({prefix: 'foobar'})
    var barfoo = new Logdown({prefix: 'barfoo'})

    Logdown.disable('*')
    Logdown.enable('*foo')

    bar.log('lorem')
    foobar.log('lorem')
    assert.notCalled(console.log)
    foo.log('lorem')
    barfoo.log('lorem')
    assert.calledTwice(console.log)

    sandbox.restore()
  })

  it('`(\'foo*\')` should enable only instances with names beginning with “foo”', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var foobar = new Logdown({prefix: 'foobar'})
    var barfoo = new Logdown({prefix: 'barfoo'})

    Logdown.disable('*')
    Logdown.enable('foo*')

    bar.log('lorem')
    barfoo.log('lorem')
    assert.notCalled(console.log)
    foobar.log('lorem')
    foo.log('lorem')
    assert.calledTwice(console.log)

    sandbox.restore()
  })
})

describe('`Logdown.disable`', function() {
  var sandbox

  beforeEach(function() {
    sandbox = sinon.sandbox.create()

    sandbox.stub(global.console, 'log')
  })

  it('`(\'*\')` should disable all instances', function() {
    Logdown.enable('*')
    Logdown.disable('*')
    var instances = createInstances()
    instances.forEach(function(instance) {
      instance.log('Lorem')
    })

    assert.notCalled(console.log)

    sandbox.restore()
  })

  it('`(\'foo\')` should disable only instances with “foo” prefix', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var quz = new Logdown({prefix: 'quz'})
    var baz = new Logdown({prefix: 'baz'})

    Logdown.enable('*')
    Logdown.disable('foo')

    foo.log('lorem')
    assert.notCalled(console.log)
    bar.log('lorem')
    quz.log('lorem')
    baz.log('lorem')
    assert.calledThrice(console.log)

    sandbox.restore()
  })

  it('`(\'*foo\')` should disable only instances with names ending with “foo”', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var foobar = new Logdown({prefix: 'foobar'})
    var barfoo = new Logdown({prefix: 'barfoo'})

    Logdown.enable('*')
    Logdown.disable('*foo')

    foo.log('lorem')
    barfoo.log('lorem')
    assert.notCalled(console.log)
    bar.log('lorem')
    foobar.log('lorem')
    assert.calledTwice(console.log)

    sandbox.restore()
  })

  it('`(\'foo*\')` should disable only instances with names beginning with “foo”', function() {
    var foo = new Logdown({prefix: 'foo'})
    var bar = new Logdown({prefix: 'bar'})
    var foobar = new Logdown({prefix: 'foobar'})
    var barfoo = new Logdown({prefix: 'barfoo'})

    Logdown.enable('*')
    Logdown.disable('foo*')

    foobar.log('lorem')
    foo.log('lorem')
    assert.notCalled(console.log)
    bar.log('lorem')
    barfoo.log('lorem')
    assert.calledTwice(console.log)

    sandbox.restore()
  })
})

var methods = ['log', 'info', 'warn', 'error']
methods.forEach(function(method) {
  describe('Logdown::' + method, function() {
    var sandbox

    beforeEach(function() {
      sandbox = sinon.sandbox.create()

      sandbox.stub(global.console, method)
    })

    afterEach(function() {
      sandbox.restore()
    })

    it('should parse markdown if enabled', function() {
      var foo = new Logdown({markdown: true})

      foo[method]('lorem *ipsum*')
      assert.calledWith(
        console[method],
        'lorem %cipsum%c',
        'font-weight: bold;',
        ''
      )

      foo[method]('lorem _ipsum_')
      assert.calledWith(
        console[method],
        'lorem %cipsum%c',
        'font-style: italic;',
        ''
      )

      foo[method]('lorem `ipsum`')
      assert.calledWith(
        console[method],
        'lorem %cipsum%c',
        'background: #FDF6E3;color: #586E75;padding: 1px 5px;border-radius: 4px;',
        ''
      )

      foo[method]('lorem `ipsum` *dolor* sit _amet_')
      assert.calledWith(
        console[method],
        'lorem %cipsum%c %cdolor%c sit %camet%c',
        'background: #FDF6E3;color: #586E75;padding: 1px 5px;border-radius: 4px;',
        '',
        'font-weight: bold;',
        '',
        'font-style: italic;',
        ''
      )

      sandbox.restore()
    })

    it('should not parse markdown if disabled', function() {
      var foo = new Logdown({markdown: false})

      foo[method]('lorem *ipsum*')
      assert.calledWith(
        console[method],
        'lorem *ipsum*'
      )

      foo[method]('lorem _ipsum_ dolor')
      assert.calledWith(
        console[method],
        'lorem _ipsum_ dolor'
      )

      foo[method]('lorem `ipsum` dolor')
      assert.calledWith(
        console[method],
        'lorem `ipsum` dolor'
      )

      sandbox.restore()
    })

    it('should print prefix if present', function() {
      // var foo = new Logdown({prefix: 'foo'})

      // foo[method]('lorem ipsum')
      // try {
      //   assert.calledWith(
      //     console[method],
      //     '%cfoo%c lorem ipsum',
      //     'color:' + foo.prefixColor + '; font-weight:bold;',
      //     ''
      //   )
      // } catch(error) {
      //   sandbox.restore()
      //   throw error
      // }

      // sandbox.restore()
    })
  })
})
