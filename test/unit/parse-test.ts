import * as assert from 'assert-diff';
import { preprocess } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

describe('Upstream: parse', () => {
  it('parses source to AST', () => {
    const ast = preprocess('<div> </div>');
    assert.equal(ast.type, 'Program');
  });
});
