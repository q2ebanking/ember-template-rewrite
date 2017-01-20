import {
  preprocess,
  print,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import assert from 'assert-diff';
import convertBindAttr from '../../lib/formulas/convert-bind-attr';

function convertSource(source) {
  return print(convertBindAttr(preprocess(source)));
}

describe('Unit: convertBindAttr', function() {
  it('converts class binding', function() {
    let input = '<h1 {{bind-attr class="active"}}></h1>';
    // TODO - (upstream) remove quotes, remove trailing space
    let output = '<h1 class="{{active}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts multiple class bindings', function() {
    let input = '<h1 {{bind-attr class="active  status"}}></h1>';
    let output = '<h1 class="{{active}} {{status}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts class ternary', function() {
    let input = '<h1 {{bind-attr class="isActive:active:inactive"}}></h1>';
    let output = '<h1 class="{{if isActive "active" "inactive"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts class ternary with special chars', function() {
    let input = '<h1 {{bind-attr class="model.isActive:is-active:is-inactive"}}></h1>';
    let output = '<h1 class="{{if model.isActive "is-active" "is-inactive"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts class ternary with static classes', function() {
    let input = '<h1 {{bind-attr class="active:a:b"}}></h1>';
    let output = '<h1 class="{{if active "a" "b"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts with static classes', function() {
    let input = '<h1 {{bind-attr class=":static-before activeClass :static-after"}}></h1>';
    let output = '<h1 class="static-before {{activeClass}} static-after"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts with static class ternary and binding', function() {
    let input = '<h1 {{bind-attr class=":static-before' +
                  ' isActive:active-class:inactive-class binding"}}></h1>';
    let output = '<h1 class="static-before ' +
      '{{if isActive "active-class" "inactive-class"}} {{binding}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts class if', function() {
    let input = '<h1 {{bind-attr class="isActive:active"}}></h1>';
    let output = '<h1 class="{{if isActive "active"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('combines with existing class attribute after', function() {
    let input = '<h1 {{bind-attr class="isActive:active"}} class="after"></h1>';
    let output = '<h1 class="{{if isActive "active"}} after"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('combines with existing class attribute before', function() {
    let input = '<h1 class="before" {{bind-attr class="isActive:active"}}></h1>';
    let output = '<h1 class="before {{if isActive "active"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('combines multiple class bindings', function() {
    let input = '<h1 class="before" {{bind-attr class="isActive:active"}}' +
                                  ' {{bind-attr class="isDisabled:disabled"}}></h1>';
    let output = '<h1 class="before {{if isActive "active"}} {{if isDisabled "disabled"}}"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts arbitrary attributes', function() {
    let input = '<h1 {{bind-attr title="foo"}}></h1>';
    let output = '<h1 title={{foo}}></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts arbitrary with no quotes', function() {
    let input = '<h1 {{bind-attr src=foo}}></h1>';
    let output = '<h1 src={{foo}}></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts multiple arbitrary attributes', function() {
    let input = '<h1 {{bind-attr src=foo title="bar"}}></h1>';
    let output = '<h1 src={{foo}} title={{bar}}></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts multiple arbitrary attributes in separate bind-attrs preserving order', function() {
    let input = '<h1 {{bind-attr title=foo}} {{bind-attr class="isActive:active"}} class="after"></h1>';
    let output = '<h1 title={{foo}} class="{{if isActive "active"}} after"></h1>';
    assert.equal(convertSource(input), output);
  });

  it('converts multiple arbitrary attributes preserving order', function() {
    let input = '<h1 role="before" {{bind-attr title=foo class="isActive:active"}} src="after"></h1>';
    let output = '<h1 role="before" title={{foo}} class="{{if isActive "active"}}" src="after"></h1>';
    assert.equal(convertSource(input), output);
  });
});
