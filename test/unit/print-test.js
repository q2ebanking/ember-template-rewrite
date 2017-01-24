import assert from 'assert-diff';
import {
  preprocess,
  builders as b
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import { escape, unescape } from '../../lib/whitespace';
import print from '../../lib/printer';

function printTransform(template) {
  return unescape(print(preprocess(escape(template))));
}

function printEqual(template) {
  assert.equal(printTransform(template), template);
}

describe('Unit: print', function() {
  it('preserves element text nodes', function() {
    printEqual('<div> </div>');
  });

  it('preserves element attributes', function() {
    printEqual('<div foo="bar" baz="qux"></div>');
  });

  it('preserves mustache params', function() {
    printEqual('{{foo bar baz=qux}}');
  });

  it('preserves mustaches in attributes', function() {
    printEqual('<div class="a {{if foo "bar"}} b"></div>');
  });

  it('ElementNode: tag', function() {
    printEqual('<h1></h1>');
  });

  it('ElementNode: nested tags with indent', function() {
    printEqual('<div>\n  <p>Test</p>\n</div>');
  });

  it('ElementNode: attributes', function() {
    printEqual('<h1 class="foo" id="title"></h1>');
  });

  it('TextNode: chars', function() {
    printEqual('<h1>Test</h1>');
  });

  it('MustacheStatement: slash in path', function() {
    printEqual('{{namespace/foo "bar" baz="qux"}}');
  });

  it('MustacheStatement: path', function() {
    printEqual('<h1>{{model.title}}</h1>');
  });

  it('MustacheStatement: StringLiteral param', function() {
    printEqual('<h1>{{link-to "Foo"}}</h1>');
  });

  it('MustacheStatement: hash', function() {
    printEqual('<h1>{{link-to "Foo" class="bar"}}</h1>');
  });

  it('MustacheStatement: as element attribute', function() {
    printEqual('<h1 class={{if foo "foo" "bar"}}>Test</h1>');
  });

  it('MustacheStatement: as element attribute with path', function() {
    printEqual('<h1 class={{color}}>Test</h1>');
  });

  it('ConcatStatement: in element attribute string', function() {
    printEqual('<h1 class="{{if active "active" "inactive"}} foo">Test</h1>');
  });

  it('ElementModifierStatement', function() {
    printEqual('<p {{action "activate"}} {{someting foo="bar"}}>Test</p>');
  });

  it('PartialStatement', function() {
    printEqual('<p>{{>something "param"}}</p>');
  });

  it('SubExpression', function() {
    printEqual('<p>{{my-component submit=(action (mut model.name) (full-name model.firstName "Smith"))}}</p>');
  });

  it('BlockStatement: multiline', function() {
    printEqual('<ul>  \n  {{#each foos as |foo index|}}  \n    <li>{{foo}}: {{index}}</li>  \n   {{/each}}\n</ul>');
  });

  it('BlockStatement: multiline #if', function() {
    printEqual('{{#if foo}}\n   *<div></div>\n{{/if}}');
  });

  it('BlockStatement: inline', function() {
    printEqual('{{#if foo}}<p>{{foo}}</p>{{/if}}');
  });

  it('UndefinedLiteral', function() {
    const ast = b.program([b.mustache(b.undefined())]);
    assert.equal(print(ast), '{{undefined}}');
  });

  it('NumberLiteral', function() {
    printEqual('{{foo bar=5}}');
  });

  it('BooleanLiteral', function() {
    printEqual('{{foo bar=true}}');
  });

  it('HTML comment', function() {
    printEqual('<!-- foo -->');
  });

  it('Handlebars comment', function() {
    assert.equal(printTransform('{{! foo }}'), '{{!-- foo --}}');
  });

  it('Handlebars comment: in ElementNode', function() {
    printEqual('<div {{!-- foo --}}></div>');
  });

  it('Handlebars comment: in ElementNode children', function() {
    printEqual('<div>{{!-- foo bar --}}<b></b></div>');
  });

  it('Handlebars in handlebar comment', function() {
    printEqual('{{!-- {{foo-bar}} --}}');
  });

  it('prints self closing hr tag', function() {
    printEqual('<hr />');
  });

  it('prints &nbsp;', function() {
    printEqual('&nbsp;');
  });

  it('prints &times;', function() {
    printEqual('&times;');
  });

  xit('preserves binary attributes', function() {
    printEqual("<p selected></p><input disabled />");
  });

  xit('preserves else if', function() {
    printEqual("{{#if foo}}{{foo}}{{else if bar}}{{bar}}{{/if}}");
  });

  xit('preserves single quotes in mustaches', function() {
    printEqual("{{foo 'bar'}}");
  });

  xit('preserves handlebars comment', function() {
    printEqual("{{! will not print to HTML output }}");
  });

  xit('preserves action position in attributes', function() {
    printEqual('<div foo="bar" {{action "boom"}} baz="qux"></div>');
  });

  xit('unsafe mustaches', function() {
    printEqual('{{{unsafe}}}');
  });

  xit('preserves newline after mustache hash', function() {
    printEqual('{{foo\n  bar=bar\n}}');
  });

  xit('preserves whitespace between block params', function() {
    printEqual('{{#foo bar=bar as | a b |}}{{/foo}}');
  });
});
