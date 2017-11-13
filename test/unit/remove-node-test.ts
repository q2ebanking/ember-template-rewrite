import * as assert from 'assert-diff';
import {
  preprocess as p,
  print,
} from 'test/helpers/print-equal';

import { removeNode } from 'ember-template-rewrite/utils/node';

describe('Unit: removeNode', () => {
  it('shifts nodes on the same line to fill in the hole', () => {
    const ast = p('<p a="b" {{bind-attr c=d}} e="f"></p>');
    const expected = p('<p a="b"  e="f"></p>');
    const node = ast.body[0];
    const bindAttr = node.modifiers[0];

    const actual = removeNode(bindAttr, ast);

    assert.equal(print(ast), print(expected));
    assert.deepEqual(actual, expected);
  });

  it('does not shift nodes below left', () => {
    const ast = p('<p a="b"\n  {{bind-attr c=d}}\n  e="f"></p>');
    const expected = p('<p a="b"\n  \n  e="f"></p>');
    const node = ast.body[0];
    const bindAttr = node.modifiers[0];

    const actual = removeNode(bindAttr, ast);

    assert.equal(print(ast), print(expected));
    assert.deepEqual(actual, expected);
  });
});
