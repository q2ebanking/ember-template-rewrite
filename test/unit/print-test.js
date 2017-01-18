import assert from 'assert-diff';
import { parse, print } from '../../';

function parsePrint(source) {
  return print(parse(source));
}

describe('print', function() {
  it('preserves element text nodes', function() {
    let expected = '<div> </div>';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves element attributes', function() {
    let expected = '<div foo="bar" baz="qux"></div>';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves mustache params', function() {
    let expected = '{{foo bar baz=qux}}';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves mustaches in attributes', function() {
    let expected = '<div class="a {{if foo "bar"}} b"></div>';
    assert.equal(parsePrint(expected), expected);
  });
});
