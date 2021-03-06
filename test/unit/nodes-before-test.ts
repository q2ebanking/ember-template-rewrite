import * as assert from 'assert-diff';
import gridToLocations from 'test/helpers/grid-to-locations';

import { nodesBefore } from 'ember-template-rewrite/utils/node';

describe('Unit: nodesBefore', () => {
  it('find all nodes with locs before given node from unsorted input list', () => {
    const grid = `| B  D |
                |  A  F|
                | E  C |`;
    const nodes = gridToLocations(grid);
    const indexOfF = nodes.findIndex((n) => n.name === 'F');
    const after = nodes.splice(indexOfF, 1)[0];

    const actual = nodesBefore(after, nodes).map((n) => n.name);

    const expected = ['A'];
    assert.deepEqual(actual, expected);
  });
});
