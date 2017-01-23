import assert from '../helpers/assert';
import { sort } from '../../lib/location';
import _ from 'underscore';

function gridToInput(grid) {
  let nodes = [];
  let column = 0;
  let line = 0;
  let read = false;
  for (let char of grid) {
    let name = char;
    if (read && char === ' ') {
      column++;
    } else if (char === '\n') {
      line++;
      column = 0;
      read = false;
    } else if (char === '|') {
      read = !read;
    } else if (read) {
      nodes.push({ name: char , loc: { start: { column, line } } });
      column++;
    }
  }
  let a = [1,2,3];
  return _.shuffle(nodes);
}

describe('Unit: location', function() {
  describe('sort: sorts nodes', function() {

    it('by column on same line', function() {
      let input = [
        { name: 'A', loc: { start: { column: 2, line: 0 } } },
        { name: 'B', loc: { start: { column: 0, line: 0 } } },
        { name: 'C', loc: { start: { column: 1, line: 0 } } }
      ];
      let actual = sort(input);
      let expected = [{
        name: 'B'
      }, {
        name: 'C'
      }, {
        name: 'A'
      }];
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
    let actual = sort(input);
    let expected = [{
      name: 'A'
    }, {
      name: 'C'
    }, {
      name: 'B'
    }];
    assert.equal(actual.length, 3);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', function() {
    let grid = `| B  D  |
                |   A   |
                |  E  C |
               `;
    let input = gridToInput(grid);
    let actual = sort(input);
    let expected = [{
      name: 'B'
    }, {
      name: 'D'
    }, {
      name: 'A'
    }, {
      name: 'E'
    }, {
      name: 'C'
    }];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });

  it('by line and column', function() {
    let grid = `| B  D |
                |  A   |
                | E  C |
               `;
    let input = gridToInput(grid);
    let actual = sort(input);
    let expected = [{
      name: 'B'
    }, {
      name: 'D'
    }, {
      name: 'A'
    }, {
      name: 'E'
    }, {
      name: 'C'
    }];
    assert.equal(actual.length, 5);
    assert.includeDeepMembers(actual, expected);
  });
});
