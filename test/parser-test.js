import assert from 'assert-diff';
import { parse, print, convertBindAttr } from '../';

function parsePrint(source) {
  return print(parse(source));
}

describe('parse', function() {
  it('parses source to AST', function() {
    let ast = parse('<div> </div>');
    assert.equal(ast.type, 'Program');
  });
});

describe('print', function() {
  it('preserves element text nodes', function() {
    let expected = '<div> </div>';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves element attributes', function() {
    let expected = '<div foo="bar" baz="qux"></div>';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves mustache params', function() {
    let expected = '{{foo bar baz=qux}}';
    assert.equal(parsePrint(expected), expected);
  });

  it('preserves mustaches in attributes', function() {
    let expected = '<div class="a {{if foo "bar"}} b"></div>';
    assert.equal(parsePrint(expected), expected);
  });
});

describe('convertBindAttr', function() {
  it('converts class binding', function() {
    let input = '<h1 {{bind-attr class="active"}}></h1>';
    // TODO - (upstream) remove quotes, remove trailing space
    let output = '<h1 class="{{active}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts multiple class bindings', function() {
    let input = '<h1 {{bind-attr class="active  status"}}></h1>';
    let output = '<h1 class="{{active}} {{status}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts class ternary', function() {
    let input = '<h1 {{bind-attr class="isActive:active:inactive"}}></h1>';
    let output = '<h1 class="{{if isActive "active" "inactive"}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts class ternary with special chars', function() {
    let input = '<h1 {{bind-attr class="model.isActive:is-active:is-inactive"}}></h1>';
    let output = '<h1 class="{{if model.isActive "is-active" "is-inactive"}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts with static classes', function() {
    let input = '<h1 {{bind-attr class=":static-before activeClass :static-after"}}></h1>';
    let output = '<h1 class="static-before {{activeClass}} static-after" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts with static class ternary and binding', function() {
    let input = '<h1 {{bind-attr class=":static-before' +
                  ' isActive:active-class:inactive-class binding"}}></h1>';
    let output = '<h1 class="static-before ' +
      '{{if isActive "active-class" "inactive-class"}} {{binding}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts class if', function() {
    let input = '<h1 {{bind-attr class="isActive:active"}}></h1>';
    let output = '<h1 class="{{if isActive "active"}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('combines with existing class attribute after', function() {
    let input = '<h1 {{bind-attr class="isActive:active"}} class="after"></h1>';
    let output = '<h1 class="{{if isActive "active"}} after" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('combines with existing class attribute before', function() {
    let input = '<h1 class="before" {{bind-attr class="isActive:active"}}></h1>';
    let output = '<h1 class="before {{if isActive "active"}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('combines multiple class bindings', function() {
    let input = '<h1 class="before" {{bind-attr class="isActive:active"}}' +
                                  ' {{bind-attr class="isDisabled:disabled"}}></h1>';
    let output = '<h1 class="before {{if isActive "active"}} {{if isDisabled "disabled"}}" ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts arbitrary attributes', function() {
    let input = '<h1 {{bind-attr title="foo"}}></h1>';
    let output = '<h1 title={{foo}} ></h1>';
    assert.equal(convertBindAttr(input), output);
  });

  it('converts arbitrary with no quotes', function() {
    let input = '<h1 {{bind-attr src=foo}}></h1>';
    let output = '<h1 src={{foo}} ></h1>';
    assert.equal(convertBindAttr(input), output);
  });
});
