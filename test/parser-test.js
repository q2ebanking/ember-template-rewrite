import assert from 'assert-diff';
import { parseAst } from '../';

describe('parseAst', function() {
  it('parses AST', function() {
    let ast = parseAst('<div></div>');
    assert.equal(ast.type, 'Program');
  });
});
