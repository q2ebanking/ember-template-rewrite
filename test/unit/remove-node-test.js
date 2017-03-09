import assert from 'assert-diff';
import _printEqual, {
  preprocess as p,
  print
} from '../helpers/print-equal';
import { removeNode } from '../../lib/utils/node';
import { nodeToLabel } from '../helpers/node';

describe('Unit: removeNode', function() {
  it('shifts nodes on the same line to fill in the hole', function() {
    let ast = p('<p a="b" {{bind-attr c=d}} e="f"></p>');
    let expected = p('<p a="b"  e="f"></p>');
    let node = ast.body[0];
    let bindAttr = node.modifiers[0];

    let actual = removeNode(bindAttr, ast);

    assert.equal(print(ast), print(expected));
    assert.deepEqual(actual, expected);
  });

  it('does not shift nodes below left', function() {
    let ast = p('<p a="b"\n  {{bind-attr c=d}}\n  e="f"></p>');
    let expected = p('<p a="b"\n  \n  e="f"></p>');
    let node = ast.body[0];
    let bindAttr = node.modifiers[0];

    let actual = removeNode(bindAttr, ast);

    assert.equal(print(ast), print(expected));
    assert.deepEqual(actual, expected);
  });
});
