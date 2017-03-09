import assert from 'assert-diff';
import _printEqual, {
  preprocess as p
} from '../helpers/print-equal';
import { nodeIndex } from '../../lib/utils/node';
import { nodeToLabel } from '../helpers/node';

describe('Unit: nodeIndex', function() {
  it('calculates node index in given sorted lists', function() {
    let node = p('<p a="b" {{bind-attr c=d}} e="f"></p>').body[0];
    let modifiers = node.modifiers;
    let attributes = node.attributes;
    let indexes;
    indexes = nodeIndexes(modifiers, attributes);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
    indexes = nodeIndexes(attributes, modifiers);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
  });
});

function nodeIndexes(...nodes) {
  nodes = nodes.reduce((acc, n) => acc.concat(n), []);
  return nodes.reduce((acc,a) => {
    let key = nodeToLabel(a);
    acc[key] = nodeIndex(a, ...nodes);
    return acc;
  }, {});
}
