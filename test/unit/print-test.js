import assert from 'assert-diff';
import {
  preprocess,
  print,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function parsePrint(source) {
  return print(preprocess(source));
}

describe('Upstream: print', function() {
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
