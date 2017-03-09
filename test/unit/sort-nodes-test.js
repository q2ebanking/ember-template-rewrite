import assert from '../helpers/assert';
import { sortNodes as sort } from '../../lib/utils/node';
import gridToLocations from '../helpers/grid-to-locations';

describe('Unit: location', function() {
  describe('sort: sorts nodes', function() {
    it('by column on same line', function() {
      let input = [
        { name: 'A', loc: { start: { column: 2, line: 0 } } },
        { name: 'B', loc: { start: { column: 0, line: 0 } } },
        { name: 'C', loc: { start: { column: 1, line: 0 } } }
      ];
      let actual = sort(input).map(n => n.name);
      let expected = ['B','C','A'];
      assert.equal(actual.length, 3);
      assert.includeDeepMembers(actual, expected);
    });
  });

  it('by input order when column and line are the same', function() {
    let input = [
      { name: 'A', loc: { start: { column: 0, line: 0 } } },
      { name: 'B', loc: { start: { column: 1, line: 0 } } },
      { name: 'C', loc: { start: { column: 0, line: 0 } } }
    ];
    let actual = sort(input).map(n => n.name);
    let expected = ['A','C','B'];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', function() {
    let grid = `| B  D  |
                |   A   |
                |  E  C |`;
    let input = gridToLocations(grid);
    let actual = sort(input).map(n => n.name);
    let expected = ['B','D','A','E','C'];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', function() {
    let grid = `| B  D |
                |  A   |
                | E  C |`;
    let input = gridToLocations(grid);
    let actual = sort(input).map(n => n.name);
    let expected = ['B','D','A','E','C'];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });
});
