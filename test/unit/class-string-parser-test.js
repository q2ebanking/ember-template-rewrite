import assert from '../helpers/assert';
import classStringParser from '../../lib/class-string-parser';
import preprocess from '../../lib/preprocess';

describe('Unit: classStringParser', function() {
  it('single binding', function() {
    let expected = preprocess('{{foo}}').body;
    let actual = classStringParser('foo');
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('multiple binding', function() {
    let actual = classStringParser('foo  bar');
    let expected = preprocess('{{foo}}{{bar}}').body;
    assert.equal(actual.length, 2);
    assert.includeDeepMembers(actual[0], expected[0]);
    assert.includeDeepMembers(actual[1], expected[1]);
  });

  it('single ternary', function() {
    let actual = classStringParser('foo:bar:baz');
    let expected = preprocess('{{if foo "bar" "baz"}}').body;
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('single ternary with special chars', function() {
    let actual = classStringParser('a.foo:is-bar:is-baz');

    let expected = [{
      type: 'MustacheStatement',
      path: {
        type: 'PathExpression',
        parts: [ 'if' ],
      },
      params: [
        {
          type: 'PathExpression',
          parts: [ 'a', 'foo' ],
        },
        { type: 'StringLiteral', value: 'is-bar' },
        { type: 'StringLiteral', value: 'is-baz' }
      ],
    }];
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('single binary', function() {
    let actual = classStringParser('foo:bar');

    let expected = [{
      type: 'MustacheStatement',
      path: {
        type: 'PathExpression',
        parts: [ 'if' ],
      },
      params: [
        {
          type: 'PathExpression',
          parts: [ 'foo' ],
        },
        { type: 'StringLiteral', value: 'bar' }
      ],
    }];
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('static class', function() {
    let actual = classStringParser(':bar-baz');

    let expected = [{
      type: 'StringLiteral',
      value: 'bar-baz',
    }];
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('mixed static ternary binding', function() {
    let actual = classStringParser(':is-static isActive:active:inactive bound');

    let expected = [{
      type: 'StringLiteral',
      value: 'is-static',
    }, {
      type: 'MustacheStatement',
      path: {
        type: 'PathExpression',
        parts: [ 'if' ],
      },
      params: [
        {
          type: 'PathExpression',
          parts: [ 'isActive' ],
        },
        { type: 'StringLiteral', value: 'active' },
        { type: 'StringLiteral', value: 'inactive' }
      ],
    }, {
      type: 'MustacheStatement',
      path: {
        type: 'PathExpression',
        parts: ['bound'],
      },
    }];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('delineates with spaces if defined as number', function() {
    let actual = classStringParser('foo bar', { spaces: 2 });
    let expected = [{
      type: 'MustacheStatement',
    }, { type: 'TextNode', chars: '  ' }, {
      type: 'MustacheStatement',
    }];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('delineates with spaces if defined as bool', function() {
    let actual = classStringParser('foo bar', { spaces: true });
    let expected = [{
      type: 'MustacheStatement',
    }, { type: 'TextNode', chars: ' ' }, {
      type: 'MustacheStatement',
    }];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('does not delineate with spaces if defined as false', function() {
    let actual = classStringParser('foo bar', { spaces: false });
    let expected = [{
      type: 'MustacheStatement',
    }, {
      type: 'MustacheStatement',
    }];
    assert.equal(actual.length, 2);
    assert.includeDeepMembers(actual, expected);
  });
});

