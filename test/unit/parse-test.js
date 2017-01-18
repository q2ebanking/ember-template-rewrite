import assert from 'assert-diff';
import { parse } from '../../';

describe('parse', function() {
  it('parses source to AST', function() {
    let ast = parse('<div> </div>');
    assert.equal(ast.type, 'Program');
  });
});
