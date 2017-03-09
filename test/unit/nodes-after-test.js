import assert from 'assert-diff';
import gridToLocations from '../helpers/grid-to-locations';
import { nodesAfter } from '../../lib/utils/node';

describe('Unit: nodesAfter', function() {
  it('find all nodes with locs after given node from unsorted input list', function() {
    let grid = `| B  D |
                |  A  F|
                | E  C |`;
    let nodes = gridToLocations(grid);
    let indexOfA = nodes.findIndex(n => n.name === 'A');
    let after = nodes.splice(indexOfA,1)[0];

    let actual = nodesAfter(after, nodes).map(n => n.name);

    let expected = ['F'];
    assert.deepEqual(actual, expected);
  });

  it('last line', function() {
    let grid = `| B   |
                | A   |
                | E C |`;
    let nodes = gridToLocations(grid);
    let indexOfE = nodes.findIndex(n => n.name === 'E');
    let after = nodes.splice(indexOfE,1)[0];

    let actual = nodesAfter(after, nodes).map(n => n.name);

    let expected = ['C'];
    assert.deepEqual(actual, expected);
  });

  it('with duplicates', function() {
    let grid = `| B   |
                | A   |
                | E C |`;
    let nodes = gridToLocations(grid);
    let indexOfE = nodes.findIndex(n => n.name === 'E');
    let after = nodes.slice(indexOfE,indexOfE + 1)[0];

    let actual = nodesAfter(after, nodes, nodes).map(n => n.name);

    let expected = ['C'];
    assert.deepEqual(actual, expected);
  });
});
