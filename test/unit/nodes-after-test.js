import { describe, it } from 'mocha';
import assert from 'assert-diff';
import gridToLocations from '../helpers/grid-to-locations';
import { nodesAfter } from '../../lib/utils/node';

describe('Unit: nodesAfter', () => {
  it('find all nodes with locs after given node from unsorted input list', () => {
    const grid = `| B  D |
                |  A  F|
                | E  C |`;
    const nodes = gridToLocations(grid);
    const indexOfA = nodes.findIndex(n => n.name === 'A');
    const after = nodes.splice(indexOfA, 1)[0];

    const actual = nodesAfter(after, nodes).map(n => n.name);

    const expected = ['F'];
    assert.deepEqual(actual, expected);
  });

  it('last line', () => {
    const grid = `| B   |
                | A   |
                | E C |`;
    const nodes = gridToLocations(grid);
    const indexOfE = nodes.findIndex(n => n.name === 'E');
    const after = nodes.splice(indexOfE, 1)[0];

    const actual = nodesAfter(after, nodes).map(n => n.name);

    const expected = ['C'];
    assert.deepEqual(actual, expected);
  });

  it('with duplicates', () => {
    const grid = `| B   |
                | A   |
                | E C |`;
    const nodes = gridToLocations(grid);
    const indexOfE = nodes.findIndex(n => n.name === 'E');
    const after = nodes.slice(indexOfE, indexOfE + 1)[0];

    const actual = nodesAfter(after, nodes, nodes).map(n => n.name);

    const expected = ['C'];
    assert.deepEqual(actual, expected);
  });
});
