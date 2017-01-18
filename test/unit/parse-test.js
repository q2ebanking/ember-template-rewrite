import assert from 'assert-diff';
import { preprocess } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

describe('Upstream: parse', function() {
  it('parses source to AST', function() {
    let ast = preprocess('<div> </div>');
    assert.equal(ast.type, 'Program');
  });
});
