import assert from 'assert-diff';
import {
  preprocess,
  builders as b
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import _printEqual, {
  preprocess as p
} from '../helpers/print-equal';
import print from '../../lib/printer';

const printEqual = (template, options) => {
  _printEqual(template, template, options);
};

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

  it('preserves bare mustache in attributes', function() {
    printEqual('<div class={{if foo "bar"}}></div>');
  });

  it('preserves multiple if statements in class', function() {
    printEqual('<div class="{{if a "b"}} {{if a "b"}} {{if a "b"}}"></div>');
  });

  it('ElementNode: tag', function() {
    printEqual('<h1></h1>');
  });

  it('ElementNode: nested tags with indent', function() {
    printEqual('<div>\n  <p>Test</p>\n</div>');
  });

  it('ElementNode: nested tags with binding', function() {
    printEqual('<div>\n  <p id={{id}}>Test</p>\n</div>');
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

  it('BlockStatement: multiline #each', function() {
    printEqual('<ul>  \n  {{#each foos as |foo index|}}  \n    <li>{{foo}}: {{index}}</li>  \n   {{/each}}\n</ul>');
  });

  it('BlockStatement: multiline #if', function() {
    printEqual('{{#if foo}}\n   *<div></div>\n{{/if}}');
  });

  it('BlockStatement: multiline nested #if', function() {
    printEqual(`
        <div class="active">
          <span class="name"></span>
          {{#if datum.isExternal}}
            {{toggle-switch
                callbackParam=datum}}
          {{/if}}
        </div>
      `);
  });

  it('BlockStatement: multiline #if with bind-attr', function() {
    printEqual('{{#if foo}}\n  <h1 {{bind-attr foo=bar baz=foo}}></h1>{{/if}}');
  });

  it('BlockStatement: multiple #if on same line', function() {
    printEqual('<p>\n  {{#if foo}}{{#if bar}}\n  <h1></h1>{{/if}}{{/if}}</p>');
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

  it('Handlebars comment: in ElementNode', function() {
    printEqual('<div {{!-- foo --}}></div>');
  });

  it('Handlebars comment: in ElementNode children', function() {
    printEqual('<div>{{!-- foo bar --}}<b></b></div>');
  });

  it('Handlebars in handlebar comment', function() {
    printEqual('{{!-- {{foo-bar}} --}}');
  });

  it('preserves handlebars comment with no dashes', function() {
    printEqual('{{! will not print to HTML output }}');
  });

  it('prints self closing hr tag', function() {
    printEqual('<hr>');
  });

  it('prints &nbsp;', function() {
    printEqual('&nbsp;');
  });

  it('prints &times;', function() {
    printEqual('&times;');
  });

  xit('preserves binary attributes', function() {
    printEqual('<p selected></p><input disabled />');
  });

  it('preserves whitespace around indented if/else', function() {
    printEqual('<div>\n  {{#if foo}}\n    {{foo}}\n  {{else}}\n    {{bar}}\n  {{/if}}\n</div>');
  });

  it('preserves whitespace around each with multiline content', function() {
    printEqual(`
      {{#each things as |t|}}
        {{something
            a=b}}
      {{/each}}
    `);
  });

  xit('preserves chained else if', function() {
    printEqual('{{#each foo as |f|}}{{foo}}{{else if bar}}{{bar}}{{/each}}');
  });

  xit('preserves else if', function() {
    printEqual('{{#if foo}}{{foo}}{{else if bar}}{{bar}}{{/if}}');
  });

  it('preserves action position in attributes', function() {
    printEqual('<div foo="bar" {{action "boom"}} baz="qux"></div>');
  });

  it('preserves comment position in attributes', function() {
    printEqual('<div foo="bar" {{! why here }} baz="qux"></div>');
  });

  it('preserves attrs/modifiers/comments position in attributes when multiline', function() {
    printEqual('<div\n   foo="bar"\n   {{action "foo"}}\n   {{! why here }}\n   baz="qux"></div>');
  });

  it('unsafe mustaches', function() {
    printEqual('{{{unsafe}}}');
  });

  it('preserves newline after mustache hash', function() {
    printEqual('{{foo\n  bar=bar\n}}');
  });

  xit('preserves multiple class if statements', function() {
    printEqual('<div class="{{if foo "a" "b"}} selected {{if bar "c"}}"></div>');
  });

  it('preserves newline and spaces after mustache hash', function() {
    printEqual(`
      {{foo
        bar=bar
      }}
      {{why.would.you.doThis

        }}
    `);
  });

  it('preserves newlines for element attributes', function() {
    printEqual('<div\n   foo="bar"\n   baz="qux"></div>');
  });

  xit('preserves whitespace between block params', function() {
    printEqual('{{#foo bar=bar as | a b |}}{{/foo}}');
  });

  it('configures single quotes for mustache blocks', function() {
    printEqual(`<a id="id" {{action 'foo'}}>` +
               `{{#foo bar='bar' as |a|}}{{/foo}}</a>`,
      { quotes: { mustache: "'" } });
  });
});
