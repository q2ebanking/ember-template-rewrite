import assert from 'assert-diff';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import { offsetNode } from '../../lib/utils/node';
import _printEqual, {
  preprocess as p,
  print
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
      //                  ^      ^  ^      ^  ^      ^
      //    attrs         3     10 13     20 23     30
      //                    ^    ^    ^    ^    ^    ^
      //    mustaches       5   10   15   20   25   30
      //                      ^         ^         ^
      //    paths             7-8       17-18    27-28

      let node = program.body[0];
      let cAttr = node.attributes[1];
      let sortedAttrs = sort(node.attributes);

      let attrCols = mapColumns(sortedAttrs);
      let mustacheCols = mapColumns(sortedAttrs, 'value');
      let pathCols = mapColumns(sortedAttrs, 'value.path');

      assert.deepEqual(attrCols,     [[ 3,10], [13,20], [23,30]]);
      assert.deepEqual(mustacheCols, [[ 5,10], [15,20], [25,30]]);
      assert.deepEqual(pathCols,     [[ 7, 8], [17,18], [27,28]]);

      let expected = p('<p a={{b}}     c={{d}} e={{f}}></p>');
      //                   ^      ^    ^      ^^      ^
      //    attrs          3     10   15     22 23   30
      //                     ^    ^      ^    ^  ^    ^
      //    mustaches        5   10     17   22  25  30
      //                       ^           ^       ^
      //    paths              7-8         19-20  27-28


      let actual = offsetNode(cAttr, { column: 2, line: 0 }, { recursive: true });

      assert.deepEqual(program, expected);
      assert.equal(print(program), print(expected));

      attrCols = mapColumns(sortedAttrs);
      mustacheCols = mapColumns(sortedAttrs, 'value');
      pathCols = mapColumns(sortedAttrs, 'value.path');

      assert.deepEqual(attrCols,     [[ 3,10], [15,22], [23,30]]);
      assert.deepEqual(mustacheCols, [[ 5,10], [17,22], [25,30]]);
      assert.deepEqual(pathCols,     [[ 7, 8], [19,20], [27,28]]);
    });

    it('offsets child nodes starting at a location', function() {
      let program = p('<p a={{b}}   c={{d}}   e={{f}}></p>');
      //               ^                                  ^
      //    element    0                                  35
      //                  ^      ^  ^      ^  ^      ^
      //    attrs         3     10 13     20 23     30
      //                    ^    ^    ^    ^    ^    ^
      //    mustaches       5   10   15   20   25   30
      //                      ^         ^         ^
      //    paths             7-8       17-18    27-28

      let node = program.body[0];
      let cAttr = node.attributes[1];
      let sortedAttrs = sort(node.attributes);

      let elCols = mapColumns([node]);
      let attrCols = mapColumns(sortedAttrs);
      let mustacheCols = mapColumns(sortedAttrs, 'value');
      let pathCols = mapColumns(sortedAttrs, 'value.path');

      assert.deepEqual(elCols,       [[ 0,35]]);
      assert.deepEqual(attrCols,     [[ 3,10], [13,20], [23,30]]);
      assert.deepEqual(mustacheCols, [[ 5,10], [15,20], [25,30]]);
      assert.deepEqual(pathCols,     [[ 7, 8], [17,18], [27,28]]);

      let expected = p('<p a={{b}}     c={{d}}   e={{f}}></p>');
      //                ^                                    ^
      //    element     0                                    37
      //                   ^      ^    ^      ^  ^      ^
      //    attrs          3     10   15     22  25    32
      //                     ^    ^      ^    ^    ^    ^
      //    mustaches        5   10     17   22    27  32
      //                       ^           ^         ^
      //    paths              7-8         19-20    29-30


      let offset = { column: 2, line: 0 };
      let startingAt = { column: 13, line: 1 };
      let actual = offsetNode(program, offset, { recursive: true, startingAt });

      elCols = mapColumns([node]);
      attrCols = mapColumns(sortedAttrs);
      mustacheCols = mapColumns(sortedAttrs, 'value');
      pathCols = mapColumns(sortedAttrs, 'value.path');

      assert.deepEqual(pathCols,     [[ 7, 8], [19,20], [29,30]]);
      assert.equal(print(program), print(expected));
      assert.deepEqual(elCols,       [[ 0,37]]);
      assert.deepEqual(attrCols,     [[ 3,10], [15,22], [25,32]]);
      assert.deepEqual(mustacheCols, [[ 5,10], [17,22], [27,32]]);
      assert.deepEqual(pathCols,     [[ 7, 8], [19,20], [29,30]]);
      assert.equal(print(program), print(expected));
      assert.deepEqual(program, expected);
    });
  });
});

function mapColumns(nodes, path) {
  return nodes
    .map(a => get(a, path ? `${path}.loc` : 'loc'))
    .map(l => [l.start.column, l.end.column]);
}
