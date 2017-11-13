import * as assert from 'assert-diff';
import {
  preprocess as p,
} from 'test/helpers/print-equal';
import { nodeToLabel } from 'test/helpers/node';

import { nodeIndex } from 'ember-template-rewrite/utils/node';

function nodeIndexes(...nodes) {
  const allNodes = nodes.reduce((acc, n) => acc.concat(n), []);
  return allNodes.reduce((acc, a) => {
    const key = nodeToLabel(a);
    acc[key] = nodeIndex(a, ...allNodes);
    return acc;
  }, {});
}

describe('Unit: nodeIndex', () => {
  it('calculates node index in given sorted lists', () => {
    const node = p('<p a="b" {{bind-attr c=d}} e="f"></p>').body[0];
    const { modifiers, attributes } = node;
    let indexes;
    indexes = nodeIndexes(modifiers, attributes);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
    indexes = nodeIndexes(attributes, modifiers);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
  });
});
