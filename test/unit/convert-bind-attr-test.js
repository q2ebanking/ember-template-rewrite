import assert from '../helpers/assert';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import convertBindAttr, {
  attributeBindingToAttribute,
  removeBindAttr,
} from '../../lib/formulas/convert-bind-attr';
import {
  sortNodes as sort,
  offsetNode,
} from '../../lib/utils/node';
import gridToLocations from '../helpers/grid-to-locations';
import _printEqual, {
  preprocess as p,
} from '../helpers/print-equal';
import { nodeToLabel } from '../helpers/node';

const printEqual = (input, output) => {
  _printEqual(input, output, { formulas: [convertBindAttr] });
};

describe('Unit: convertBindAttr', () => {
  it('converts class binding', () => {
    const input = '<h1 {{bind-attr class="active"}}></h1>';
    const output = '<h1 class={{active}}></h1>';
    printEqual(input, output);
  });

  it('converts multiple class bindings', () => {
    const input = '<h1 {{bind-attr class="active status"}}></h1>';
    const output = '<h1 class="{{active}} {{status}}"></h1>';
    printEqual(input, output);
  });

  it('converts class ternary', () => {
    const input = '<h1 {{bind-attr class="isActive:active:inactive"}}></h1>';
    const output = '<h1 class={{if isActive "active" "inactive"}}></h1>';
    printEqual(input, output);
  });

  it('converts class ternary with special chars', () => {
    const input = '<h1 {{bind-attr class="model.isActive:is-active:is-inactive"}}></h1>';
    const output = '<h1 class={{if model.isActive "is-active" "is-inactive"}}></h1>';
    printEqual(input, output);
  });

  it('converts class ternary with static classes', () => {
    const input = '<h1 {{bind-attr class="active:a:b"}}></h1>';
    const output = '<h1 class={{if active "a" "b"}}></h1>';
    printEqual(input, output);
  });

  it('converts with static classes', () => {
    const input = '<h1 {{bind-attr class=":static-before activeClass :static-after"}}></h1>';
    const output = '<h1 class="static-before {{activeClass}} static-after"></h1>';
    printEqual(input, output);
  });

  it('converts with static class ternary and binding', () => {
    const input = '<h1 {{bind-attr class=":static-before' +
                  ' isActive:active-class:inactive-class binding"}}></h1>';
    const output = '<h1 class="static-before ' +
      '{{if isActive "active-class" "inactive-class"}} {{binding}}"></h1>';
    printEqual(input, output);
  });

  it('converts class with single if with no quotes', () => {
    const input = '<h1 {{bind-attr class="isActive:active"}}></h1>';
    const output = '<h1 class={{if isActive "active"}}></h1>';
    printEqual(input, output);
  });

  it('converts arbitrary attributes', () => {
    const input = '<h1 {{bind-attr title="foo"}}></h1>';
    const output = '<h1 title={{foo}}></h1>';
    printEqual(input, output);
  });

  it('converts arbitrary with no quotes', () => {
    const input = '<h2 {{bind-attr title=title id="id"}}>Welcome to Ember.js</h2>';
    const output = '<h2 title={{title}} id={{id}}>Welcome to Ember.js</h2>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes', () => {
    const input = '<h1 {{bind-attr src=foo title="bar"}}></h1>';
    const output = '<h1 src={{foo}} title={{bar}}></h1>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes in separate bind-attrs preserving order', () => {
    const input = '<h1 {{bind-attr title=foo}} {{bind-attr class="isActive:active"}} src="after"></h1>';
    const output = '<h1 title={{foo}} class={{if isActive "active"}} src="after"></h1>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes preserving order', () => {
    const input = '<h1 role="before" {{bind-attr title=foo class="isActive:active"}} src="after"></h1>';
    const output = '<h1 role="before" title={{foo}} class={{if isActive "active"}} src="after"></h1>';
    printEqual(input, output);
  });

  it('converts inside block helper', () => {
    const input = '{{#if foo}}\n  <h1 {{bind-attr foo=bar baz=foo}}></h1>{{/if}}';
    const output = '{{#if foo}}\n  <h1 foo={{bar}} baz={{foo}}></h1>{{/if}}';
    printEqual(input, output);
  });

  it('converts mixed attribute list', () => {
    const input = '<h1 role="before" {{bind-attr title=foo id="id" class="isActive:active"}} src="after"></h1>';
    const output = '<h1 role="before" title={{foo}} id={{id}} class={{if isActive "active"}} src="after"></h1>';
    printEqual(input, output);
  });

  it('converts with action first', () => {
    const input = '<div {{action "toggleIsOpen"}} {{bind-attr a=b}}></div>';
    const output = '<div {{action "toggleIsOpen"}} a={{b}}></div>';
    printEqual(input, output);
  });

  xit('converts with no space between modifier', () => {
    const input = '<div test-id="btnManageLabels"{{bind-attr class="" title=title}} {{action "manageLabels"}}></div>';
    const output = '<div test-id="btnManageLabels"class="" title={{title}} {{action "manageLabels"}}></div>';
    printEqual(input, output);
  });
});

describe('Unit: attributeBindingToAttribute', () => {
  describe('given a key pair with a path expression value', () => {
    it('constructs a mustache attribute', () => {
      const pair = p('{{bind-attr foo=bar}}').body[0].hash.pairs[0];
      const actual = attributeBindingToAttribute(pair);
      const expected = attributes('foo={{bar}}')[0];
      assert.includeDeepMembers(actual, expected);
    });
  });
});

describe('Unit: removeBindAttr', () => {
  it('removes bind-attr modifier', () => {
    const ast = p('<p {{bind-attr a=b}}></p>');
    const node = ast.body[0];
    const modifiers = node.modifiers;
    const modifier = modifiers[0];

    removeBindAttr(modifier, node, ast);

    assert.equal(modifiers.length, 0);
  });

  it('inserts new attributes', () => {
    const ast = p('<p {{bind-attr a=b}}></p>');
    const node = ast.body[0];
    const modifiers = node.modifiers;
    const modifier = modifiers[0];
    assert.equal(node.attributes.length, 0);

    removeBindAttr(modifier, node, ast);

    assert.equal(node.attributes.length, 1);
    const expected = p('<p a={{b}}></p>');
    assert.includeDeepMembers(ast, expected);
  });

  function attrColumns(attrs) {
    return attrs.map(a => a.loc.start.column);
  }

  function attrLines(attrs) {
    return attrs.map(a => a.loc.start.line);
  }

  it('places new attributes in the right order', () => {
    const ast = p('<p a="b" {{bind-attr c=d}} e="f"></p>');
    const node = ast.body[0];
    const modifiers = node.modifiers;
    const modifier = modifiers[0];
    let attrOrder;
    // <p a="b" {{bind-attr c=d}} e="f"></p>
    attrOrder = node.attributes.map(a => nodeToLabel(a));
    assert.deepEqual(attrOrder, ['a', 'e']);

    removeBindAttr(modifier, node, ast);

    // <p a="b" c={{d}} e="f"></p>
    attrOrder = node.attributes.map(a => nodeToLabel(a));
    assert.deepEqual(attrOrder, ['a', 'c', 'e']);
  });

  it('shifts locations of following attributes', () => {
    const ast = p('<p a="b" {{bind-attr c=d}} e="f"></p>');
    const node = ast.body[0];
    const modifiers = node.modifiers;
    const modifier = modifiers[0];
    // <p a="b" {{bind-attr c=d}} e="f"></p>
    //   ^     ^                ^^
    //   3     9              26  27
    assert.deepEqual(attrColumns(node.attributes), [3, 27]);

    removeBindAttr(modifier, node, ast);

    // <p a="b" c={{d}} e="f"></p>
    //   3     9       17
    assert.deepEqual(attrColumns(node.attributes), [3, 9, 17]);
  });

  it('shifts multiline attributes up', () => {
    const ast = p('<p {{bind-attr\n   c=d\n   e="f"}} g="h"></p>');
    const node = ast.body[0];
    const modifiers = node.modifiers;
    const modifier = modifiers[0];
    // <p {{bind-attr\n   c=d\n   e="f"}} g="h"></p>
    // ^  ^            ^  ^       ^       ^
    // 0  3            0  3       3       11
    assert.deepEqual(attrColumns(node.attributes), [11]);
    assert.deepEqual(attrLines(node.attributes), [3]);

    removeBindAttr(modifier, node, ast);

    // <p c={{d}}\n   e={{f}} g="h"></p>
    // ^  ^        ^  ^       ^
    // 0  3        0  3       11
    assert.deepEqual(attrColumns(node.attributes), [3, 3, 11]);
    assert.deepEqual(attrLines(node.attributes), [1, 2, 2]);
  });
});

function attributes(source) {
  const expected = `<p ${source}></p>`;
  const attributes = p(expected).body[0].attributes;
  offsetNode(attributes, { column: -3, line: 0 }, { recursive: true });
  return attributes;
}
