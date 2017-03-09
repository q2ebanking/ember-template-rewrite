import assert from 'assert-diff';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import { offsetNode } from '../../lib/utils/node';
import _printEqual, {
  preprocess as p
} from '../helpers/print-equal';
import { get } from '../helpers/support';
import { sortNodes as sort } from '../../lib/utils/node';

describe('Unit: offsetNode', function() {
  describe('no line change', function() {
    it('adds column offset to loc start and end', function() {
      let input = { loc: builders.loc(1,5,2,8) };
      let offset = { column: 3, line: 0 };
      let expected = { loc: builders.loc(1,8,2,11) };
      let actual = offsetNode(input, offset);
      assert.deepEqual(actual, expected);
    });
  });

  describe('with line offset', function() {
    it('adds only line offset to loc start and end', function() {
      let input = { loc: builders.loc(1,5,2,8) };
      let offset = { column: 3, line: 2 };
      let expected = { loc: builders.loc(3,5,4,8) };
      let actual = offsetNode(input, offset);
      assert.deepEqual(actual, expected);
    });
  });

  describe('recursive', function() {
    it('offsets child nodes', function() {
      let program = p('<p a={{b}}   c={{d}}   e={{f}}></p>');
      //               ^  ^      ^  ^      ^  ^      ^
      //    attrs      0  3     10 13     20 23     30
      //                    ^    ^    ^    ^    ^    ^
      //    mustaches       5   10   15   20   25   30
      //                      ^         ^         ^
      //    paths             7-8       17-18    27-28
      let node = program.body[0];
      let sortedAttrs = sort(node.attributes);
      let attrCols = mapColumns(sortedAttrs);
      let mustacheCols = mapColumns(sortedAttrs, 'value');
      let pathCols = mapColumns(sortedAttrs, 'value.path');
      assert.deepEqual(attrCols,     [[ 3,10], [13,20], [23,30]]);
      assert.deepEqual(mustacheCols, [[ 5,10], [15,20], [25,30]]);
      assert.deepEqual(pathCols,     [[ 7, 8], [17,18], [27,28]]);
    });
  });
});

function mapColumns(nodes, path) {
  return nodes
    .map(a => get(a, path ? `${path}.loc` : 'loc'))
    .map(l => [l.start.column, l.end.column]);
}
