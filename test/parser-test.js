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
  it('converts class ternary', function() {
    let input = '<h1 {{bind-attr class="isActive:active:inactive"}}></h1>';
    let output = '<h1 class="{{if isActive "active" "inactive"}}" ></h1>';
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
});
