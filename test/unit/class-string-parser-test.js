import assert from '../helpers/assert';
import classStringParser from '../../lib/class-string-parser';
import {
  preprocess as p
} from '../helpers/print-equal';
import { offsetNode } from '../../lib/utils/node';

describe('Unit: classStringParser', function() {
  it('single binding', function() {
    let actual = classStringParser('foo');
    let expected = classConcat('{{foo}}');
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('multiple binding', function() {
    let actual = classStringParser('foo  bar');
    let expected = classConcat('{{foo}}  {{bar}}');
    actual[1].loc = null;
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('mixed types', function() {
    let actual = classStringParser(':a  b c::d e:f:g');
    let expected = classConcat('a  {{b}} {{unless c "d"}} {{if e "g" "g"}}');
    assert.equal(actual.length, 6);
    actual[0].loc = null;
    actual[2].loc = null;
    actual[4].loc = null;
    assert.includeDeepMembers(actual[3], expected[3]);
  });

  it('single ternary', function() {
    let actual = classStringParser('foo:bar:baz');
    let expected = classConcat('{{if foo "bar" "baz"}}');
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('single ternary with special chars', function() {
    let actual = classStringParser('a.foo:is-bar:is-baz');
    let expected = classConcat('{{if a.foo "is-bar" "is-baz"}}');
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('single binary', function() {
    let actual = classStringParser('foo:bar');
    let expected = classConcat('{{if foo "bar"}}');
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('static class', function() {
    let actual = classStringParser(':bar-baz');
    let expected = [{
      type: 'TextNode',
      chars: 'bar-baz',
    }];
    assert.equal(actual.length, 1);
    assert.includeDeepMembers(actual, expected);
  });

  it('mixed static ternary binding', function() {
    let actual = classStringParser(':is-static isActive:active:inactive bound');
    let expected = classConcat('is-static {{if isActive "active" "inactive"}} {{bound}}');
    assert.equal(actual.length, 4);
    actual[0].loc = null;
    actual[2].loc = null;
    assert.includeDeepMembers(actual, expected);
  });
});

function classConcat(source) {
  let expected = `<p class="${source}"></p>`;
  let concat = p(expected).body[0].attributes[0].value;
  offsetNode(concat, { column: -10, line: 0 }, { recursive: true });
  return concat.parts;
}

function fromClassConcat(parts) {
  let source = `<p class="{{a}}"></p>`;
  let ast = p(source);
  let concat = ast.body[0].attributes[0].value;
  concat.parts = parts;
  offsetNode(concat, { column: 10, line: 0 }, { recursive: true });
  return ast;
}
