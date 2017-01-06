import assert from 'assert-diff';
import { parse, compile } from '../';

function parseCompile(source) {
  return compile(parse(source));
}

describe('parse', function() {
  it('parses source to AST', function() {
    let ast = parse('<div> </div>');
    assert.equal(ast.type, 'Program');
  });
});

describe('compile', function() {
  it('preserves element text nodes', function() {
    let expected = '<div> </div>';
    assert.equal(parseCompile(expected), expected);
  });
});
