var identity = function (x) { return x; };

describe('Function', function () {
  describe('#name', function () {
    it('returns the name for named functions', function () {
      var foo = function bar() {};
      expect(foo.name).to.equal('bar');

      // pre-ES6, this property is nonconfigurable.
      var configurable = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(foo, 'name').configurable : false;

      expect(foo).to.have.ownPropertyDescriptor('name', {
        configurable: !!configurable,
        enumerable: false,
        writable: false,
        value: 'bar'
      });
    });

    it('does not poison every name when accessed on Function.prototype', function () {
      expect((function foo() {}).name).to.equal('foo');
      expect(Function.prototype.name).to.equal('');
      expect((function foo() {}).name).to.equal('foo');
    });

    it('returns empty string for anonymous functions', function () {
      var anon = identity(function () {});
      expect(anon.name).to.equal('');

      // pre-ES6, this property is nonconfigurable.
      var configurable = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(anon, 'name').configurable : false;

      expect(anon).to.have.ownPropertyDescriptor('name', {
        configurable: !!configurable,
        enumerable: false,
        writable: false,
        value: ''
      });
    });

    it('returns "anomymous" for Function functions', function () {
      // eslint-disable-next-line no-new-func
      var func = identity(Function(''));
      expect(typeof func.name).to.equal('string');
      expect(func.name === 'anonymous' || func.name === '').to.equal(true);

      // pre-ES6, this property is nonconfigurable.
      var configurable = Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(func, 'name').configurable : false;

      expect(func).to.have.ownPropertyDescriptor('name', {
        configurable: !!configurable,
        enumerable: false,
        writable: false,
        value: func.name
      });
    });
  });
});
