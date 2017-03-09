import assert from 'assert-diff';
import gridToLocations from '../helpers/grid-to-locations';
import { nodesBefore } from '../../lib/utils/node';

describe('Unit: nodesBefore', function() {
  it('find all nodes with locs before given node from unsorted input list', function() {
    let grid = `| B  D |
                |  A  F|
                | E  C |`;
    let nodes = gridToLocations(grid);
    let indexOfF = nodes.findIndex(n => n.name === 'F');
    let after = nodes.splice(indexOfF,1)[0];

    let actual = nodesBefore(after, nodes).map(n => n.name);

    let expected = ['A'];
    assert.deepEqual(actual, expected);
  });
});
