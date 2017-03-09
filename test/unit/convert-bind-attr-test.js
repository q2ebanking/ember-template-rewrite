import assert from 'assert-diff';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import convertBindAttr, {
  offsetLoc,
  nodesAfter,
  nodesBefore,
  attributeBindingToAttribute,
  removeBindAttr,
  nodeIndex
} from '../../lib/formulas/convert-bind-attr';
import { sort } from '../../lib/location';
import gridToLocations from '../helpers/grid-to-locations';
import _printEqual, {
  preprocess as p
} from '../helpers/print-equal';

const printEqual = (input, output) => {
  _printEqual(input, output, { formulas: [convertBindAttr] });
};

describe('Unit: convertBindAttr', function() {
  it('converts class binding', function() {
    let input = '<h1 {{bind-attr class="active"}}></h1>';
    let output = '<h1 class={{active}}></h1>';
    printEqual(input, output);
  });

  it('converts multiple class bindings', function() {
    let input = '<h1 {{bind-attr class="active status"}}></h1>';
    let output = '<h1 class="{{active}} {{status}}"></h1>';
    printEqual(input, output);
  });

  it('converts class ternary', function() {
    let input = '<h1 {{bind-attr class="isActive:active:inactive"}}></h1>';
    let output = '<h1 class={{if isActive "active" "inactive"}}></h1>';
    printEqual(input, output);
  });

  it('converts class ternary with special chars', function() {
    let input = '<h1 {{bind-attr class="model.isActive:is-active:is-inactive"}}></h1>';
    let output = '<h1 class={{if model.isActive "is-active" "is-inactive"}}></h1>';
    printEqual(input, output);
  });

  it('converts class ternary with static classes', function() {
    let input = '<h1 {{bind-attr class="active:a:b"}}></h1>';
    let output = '<h1 class={{if active "a" "b"}}></h1>';
    printEqual(input, output);
  });

  it('converts with static classes', function() {
    let input = '<h1 {{bind-attr class=":static-before activeClass :static-after"}}></h1>';
    let output = '<h1 class="static-before {{activeClass}} static-after"></h1>';
    printEqual(input, output);
  });

  it('converts with static class ternary and binding', function() {
    let input = '<h1 {{bind-attr class=":static-before' +
                  ' isActive:active-class:inactive-class binding"}}></h1>';
    let output = '<h1 class="static-before ' +
      '{{if isActive "active-class" "inactive-class"}} {{binding}}"></h1>';
    printEqual(input, output);
  });

  it('converts class with single if with no quotes', function() {
    let input = '<h1 {{bind-attr class="isActive:active"}}></h1>';
    let output = '<h1 class={{if isActive "active"}}></h1>';
    printEqual(input, output);
  });

  it('converts arbitrary attributes', function() {
    let input = '<h1 {{bind-attr title="foo"}}></h1>';
    let output = '<h1 title={{foo}}></h1>';
    printEqual(input, output);
  });

  it('converts arbitrary with no quotes', function() {
    let input = '<h2 {{bind-attr title=title id="id"}}>Welcome to Ember.js</h2>';
    let output = '<h2 title={{title}} id={{id}}>Welcome to Ember.js</h2>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes', function() {
    let input = '<h1 {{bind-attr src=foo title="bar"}}></h1>';
    let output = '<h1 src={{foo}} title={{bar}}></h1>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes in separate bind-attrs preserving order', function() {
    let input = '<h1 {{bind-attr title=foo}} {{bind-attr class="isActive:active"}} src="after"></h1>';
    let output = '<h1 title={{foo}} class={{if isActive "active"}} src="after"></h1>';
    printEqual(input, output);
  });

  it('converts multiple arbitrary attributes preserving order', function() {
    let input = '<h1 role="before" {{bind-attr title=foo class="isActive:active"}} src="after"></h1>';
    let output = '<h1 role="before" title={{foo}} class={{if isActive "active"}} src="after"></h1>';
    printEqual(input, output);
  });

  it('converts multiline attribute lists', function() {
    let input = '<h1 a="b"\n  {{bind-attr c="d"}}\n  e="f"></h1>';
    let output = '<h1 a="b"\n  c={{d}}\n  e="f"></h1>';
    printEqual(input, output);
  });
});

describe('Unit: attributeBindingToAttribute', function() {
  describe('given a key pair with a path expression value', function() {
    it('constructs a mustache attribute', function() {
      let pair = p('{{bind-attr foo=bar}}').body[0].hash.pairs[0];
      let actual = attributeBindingToAttribute(pair);
      let expected = {
        type: 'AttrNode',
        name: 'foo',
        value: {
          type: 'MustacheStatement',
          path: {
            type: 'PathExpression',
            original: 'bar'
          }
        }
      };
      assert.includeDeepMembers(actual, expected);
    });
  });
});

describe('Unit: offsetLoc', function() {
  describe('no line change', function() {
    it('adds column offset to loc start and end', function() {
      let input = builders.loc(1,5,2,8);
      let offset = { column: 3, line: 0 };
      let expected = builders.loc(1,8,2,11);
      let actual = offsetLoc(input, offset);
      assert.deepEqual(actual, expected);
    });
  });

  describe('with line offset', function() {
    it('adds only line offset to loc start and end', function() {
      let input = builders.loc(1,5,2,8);
      let offset = { column: 3, line: 2 };
      let expected = builders.loc(3,5,4,8);
      let actual = offsetLoc(input, offset);
      assert.deepEqual(actual, expected);
    });
  });
});

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
});

describe('Unit: nodesBefore', function() {
  it('find all nodes with locs before given node from unsorted input list', function() {
    let grid = `| B  D |
                |  A  F|
                | E  C |`;
    let nodes = gridToLocations(grid);
    let indexOfF = nodes.findIndex(n => n.name === 'F');
    let after = nodes.splice(indexOfF,1)[0];

    let actual = nodesBefore(after, nodes).map(n => n.name);

    let expected = ['A'];
    assert.deepEqual(actual, expected);
  });
});

describe('Unit: removeBindAttr', function() {
  it('removes bind-attr modifier', function() {
    let node = p('<p {{bind-attr a=b}}></p>').body[0];
    let modifiers = node.modifiers;
    let modifier = modifiers[0];
    let sortedAttrs = sort(modifiers);
    removeBindAttr(modifier, node, sortedAttrs);
    assert.equal(modifiers.length, 0);
  });

  it('inserts new attributes', function() {
    let node = p('<p {{bind-attr a=b}}></p>').body[0];
    let modifiers = node.modifiers;
    let modifier = modifiers[0];
    let sortedAttrs = sort(modifiers);
    assert.equal(node.attributes.length, 0);
    removeBindAttr(modifier, node, sortedAttrs);
    assert.equal(node.attributes.length, 1);
    let expected = [{
      type: 'AttrNode',
      name: 'a',
      value: {
        type: 'MustacheStatement',
        path: {
          type: 'PathExpression',
          original: 'b'
        }
      }
    }];
    assert.includeDeepMembers(node.attributes, expected);
  });

  function attrColumns(attrs) {
    return attrs.map(a => a.loc.start.column);
  }

  it('places new attributes in the right order', function() {
    let node = p('<p a="b" {{bind-attr c=d}} e="f"></p>').body[0];
    let modifiers = node.modifiers;
    let modifier = modifiers[0];
    let sortedAttrs = sort(modifiers, node.attributes);
    let attrOrder;
    //<p a="b" {{bind-attr c=d}} e="f"></p>
    attrOrder = node.attributes.map(a => nodeToLabel(a));
    assert.deepEqual(attrOrder, ['a', 'e']);

    removeBindAttr(modifier, node, sortedAttrs);

    //<p a="b" c={{d}} e="f"></p>
    attrOrder = node.attributes.map(a => nodeToLabel(a));
    assert.deepEqual(attrOrder, ['a', 'c', 'e']);
  });

  it('shifts locations of following attributes', function() {
    let program = p('<p a="b" {{bind-attr c=d}} e="f"></p>');
    // let node = p('<p a="b" {{bind-attr c=d}} e="f"></p>').body[0];
    let node = program.body[0];
    let modifiers = node.modifiers;
    let modifier = modifiers[0];
    let sortedAttrs = sort(modifiers, node.attributes);
    //<p a="b" {{bind-attr c=d}} e="f"></p>
    //   3                       27
    assert.deepEqual(attrColumns(node.attributes), [3, 27]);

    removeBindAttr(modifier, node, sortedAttrs);

    //<p a="b" c={{d}} e="f"></p>
    //   3     9       17
    assert.deepEqual(attrColumns(node.attributes), [3, 9, 17]);
  });

  it('calculates node index in given sorted lists', function() {
    let node = p('<p a="b" {{bind-attr c=d}} e="f"></p>').body[0];
    let modifiers = node.modifiers;
    let attributes = node.attributes;
    let indexes;
    indexes = nodeIndexes(modifiers, attributes);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
    indexes = nodeIndexes(attributes, modifiers);
    assert.deepEqual(indexes, { a: 0, 'bind-attr': 1, e: 2 });
  });
});


function nodeToLabel(node) {
  if (node.type === 'ElementModifierStatement') {
    return node.path.original;
  } else if (node.type === 'AttrNode') {
    return node.name;
  }
}

function nodeIndexes(...nodes) {
  nodes = nodes.reduce((acc, n) => acc.concat(n), []);
  return nodes.reduce((acc,a) => {
    let key = nodeToLabel(a);
    acc[key] = nodeIndex(a, ...nodes);
    return acc;
  }, {});
}
