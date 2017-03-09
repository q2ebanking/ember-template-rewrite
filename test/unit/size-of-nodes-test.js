import assert from 'assert-diff';
import _printEqual, {
  preprocess as p,
  print
} from '../helpers/print-equal';
import { sizeOfNodes } from '../../lib/utils/node';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

describe('Unit: sizeOfNodes', function() {
  it('calculates the min/max line/column for a list of nodes', function() {
    let ast = p('{{#if foo}}\n  <h1 {{bind-attr foo=bar baz=foo}}></h1>{{/if}}');
    let node = ast.body[0];
    let el = node.program.body[1];
    let modifiers = el.modifiers;
    let actual = sizeOfNodes(modifiers);
    let expected = builders.loc(0, 0, 0, 29).end;
    assert.includeDeepMembers(actual, expected);
  });
});
