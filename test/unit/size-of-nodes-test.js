import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import assert from 'assert-diff';
import {
  preprocess as p,
} from '../helpers/print-equal';
import { sizeOfNodes } from '../../lib/utils/node';

describe('Unit: sizeOfNodes', () => {
  it('calculates the min/max line/column for a list of nodes', () => {
    const ast = p('{{#if foo}}\n  <h1 {{bind-attr foo=bar baz=foo}}></h1>{{/if}}');
    const node = ast.body[0];
    const el = node.program.body[1];
    const modifiers = el.modifiers;
    const actual = sizeOfNodes(modifiers);
    const expected = builders.loc(0, 0, 0, 29).end;
    assert.includeDeepMembers(actual, expected);
  });
});
