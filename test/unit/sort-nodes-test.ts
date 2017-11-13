import assert from 'test/helpers/assert';
import gridToLocations from 'test/helpers/grid-to-locations';

import { sortNodes as sort } from 'ember-template-rewrite/utils/node';

describe('Unit: location', () => {
  describe('sort: sorts nodes', () => {
    it('by column on same line', () => {
      const input = [
        { name: 'A', loc: { start: { column: 2, line: 0 } } },
        { name: 'B', loc: { start: { column: 0, line: 0 } } },
        { name: 'C', loc: { start: { column: 1, line: 0 } } },
      ];
      const actual = sort(input).map((n) => n.name);
      const expected = ['B', 'C', 'A'];
      assert.equal(actual.length, 3);
      assert.includeDeepMembers(actual, expected);
    });
  });

  it('by input order when column and line are the same', () => {
    const input = [
      { name: 'A', loc: { start: { column: 0, line: 0 } } },
      { name: 'B', loc: { start: { column: 1, line: 0 } } },
      { name: 'C', loc: { start: { column: 0, line: 0 } } },
    ];
    const actual = sort(input).map((n) => n.name);
    const expected = ['A', 'C', 'B'];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', () => {
    const grid = `| B  D  |
                |   A   |
                |  E  C |`;
    const input = gridToLocations(grid);
    const actual = sort(input).map((n) => n.name);
    const expected = ['B', 'D', 'A', 'E', 'C'];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', () => {
    const grid = `| B  D |
                |  A   |
                | E  C |`;
    const input = gridToLocations(grid);
    const actual = sort(input).map((n) => n.name);
    const expected = ['B', 'D', 'A', 'E', 'C'];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });
});
