import { describe, it } from 'mocha';
import assert from 'assert-diff';
import {
  builders as b,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import _printEqual, {
} from '../helpers/print-equal';
import print from '../../lib/printer';

const printEqual = (template, options) => {
  _printEqual(template, template, options);
};

describe('Unit: print', () => {
  it('preserves element text nodes', () => {
    printEqual('<div> </div>');
  });

  it('preserves element attributes', () => {
    printEqual('<div foo="bar" baz="qux"></div>');
  });

  it('preserves mustache params', () => {
    printEqual('{{foo bar baz=qux}}');
  });

  it('preserves mustaches in attributes', () => {
    printEqual('<div class="a {{if foo "bar"}} b"></div>');
  });

  it('preserves bare mustache in attributes', () => {
    printEqual('<div class={{if foo "bar"}}></div>');
  });

  it('preserves multiple if statements in class', () => {
    printEqual('<div class="{{if a "b"}} {{if a "b"}} {{if a "b"}}"></div>');
  });

  it('ElementNode: tag', () => {
    printEqual('<h1></h1>');
  });

  it('ElementNode: nested tags with indent', () => {
    printEqual('<div>\n  <p>Test</p>\n</div>');
  });

  it('ElementNode: nested tags with binding', () => {
    printEqual('<div>\n  <p id={{id}}>Test</p>\n</div>');
  });

  it('ElementNode: attributes', () => {
    printEqual('<h1 class="foo" id="title"></h1>');
  });

  it('TextNode: chars', () => {
    printEqual('<h1>Test</h1>');
  });

  it('MustacheStatement: slash in path', () => {
    printEqual('{{namespace/foo "bar" baz="qux"}}');
  });

  it('MustacheStatement: path', () => {
    printEqual('<h1>{{model.title}}</h1>');
  });

  it('MustacheStatement: StringLiteral param', () => {
    printEqual('<h1>{{link-to "Foo"}}</h1>');
  });

  it('MustacheStatement: hash', () => {
    printEqual('<h1>{{link-to "Foo" class="bar"}}</h1>');
  });

  it('MustacheStatement: as element attribute', () => {
    printEqual('<h1 class={{if foo "foo" "bar"}}>Test</h1>');
  });

  it('MustacheStatement: as element attribute with path', () => {
    printEqual('<h1 class={{color}}>Test</h1>');
  });

  it('ConcatStatement: in element attribute string', () => {
    printEqual('<h1 class="{{if active "active" "inactive"}} foo">Test</h1>');
  });

  it('ElementModifierStatement', () => {
    printEqual('<p {{action "activate"}} {{someting foo="bar"}}>Test</p>');
  });

  it('PartialStatement', () => {
    printEqual('<p>{{>something "param"}}</p>');
  });

  it('SubExpression', () => {
    printEqual('<p>{{my-component submit=(action (mut model.name) (full-name model.firstName "Smith"))}}</p>');
  });

  it('BlockStatement: multiline #each', () => {
    printEqual('<ul>  \n  {{#each foos as |foo index|}}  \n    <li>{{foo}}: {{index}}</li>  \n   {{/each}}\n</ul>');
  });

  it('BlockStatement: multiline #if', () => {
    printEqual('{{#if foo}}\n   *<div></div>\n{{/if}}');
  });

  it('BlockStatement: multiline nested #if', () => {
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

  it('BlockStatement: multiline #if with bind-attr', () => {
    printEqual('{{#if foo}}\n  <h1 {{bind-attr foo=bar baz=foo}}></h1>{{/if}}');
  });

  it('BlockStatement: multiple #if on same line', () => {
    printEqual('<p>\n  {{#if foo}}{{#if bar}}\n  <h1></h1>{{/if}}{{/if}}</p>');
  });

  it('BlockStatement: inline', () => {
    printEqual('{{#if foo}}<p>{{foo}}</p>{{/if}}');
  });

  it('UndefinedLiteral', () => {
    const ast = b.program([b.mustache(b.undefined())]);
    assert.equal(print(ast), '{{undefined}}');
  });

  it('NumberLiteral', () => {
    printEqual('{{foo bar=5}}');
  });

  it('BooleanLiteral', () => {
    printEqual('{{foo bar=true}}');
  });

  it('HTML comment', () => {
    printEqual('<!-- foo -->');
  });

  it('Handlebars comment: in ElementNode', () => {
    printEqual('<div {{!-- foo --}}></div>');
  });

  it('Handlebars comment: in ElementNode children', () => {
    printEqual('<div>{{!-- foo bar --}}<b></b></div>');
  });

  it('Handlebars in handlebar comment', () => {
    printEqual('{{!-- {{foo-bar}} --}}');
  });

  it('preserves handlebars comment with no dashes', () => {
    printEqual('{{! will not print to HTML output }}');
  });

  it('prints self closing hr tag', () => {
    printEqual('<hr>');
  });

  it('prints &nbsp;', () => {
    printEqual('&nbsp;');
  });

  it('prints &times;', () => {
    printEqual('&times;');
  });

  it.skip('preserves binary attributes', () => {
    printEqual('<p selected></p><input disabled />');
  });

  it('preserves whitespace around indented if/else', () => {
    printEqual('<div>\n  {{#if foo}}\n    {{foo}}\n  {{else}}\n    {{bar}}\n  {{/if}}\n</div>');
  });

  it('preserves whitespace around each with multiline content', () => {
    printEqual(`
      {{#each things as |t|}}
        {{something
            a=b}}
      {{/each}}
    `);
  });

  it.skip('preserves chained else if', () => {
    printEqual('{{#each foo as |f|}}{{foo}}{{else if bar}}{{bar}}{{/each}}');
  });

  it.skip('preserves else if', () => {
    printEqual('{{#if foo}}{{foo}}{{else if bar}}{{bar}}{{/if}}');
  });

  it('preserves action position in attributes', () => {
    printEqual('<div foo="bar" {{action "boom"}} baz="qux"></div>');
  });

  it('preserves comment position in attributes', () => {
    printEqual('<div foo="bar" {{! why here }} baz="qux"></div>');
  });

  it('preserves attrs/modifiers/comments position in attributes when multiline', () => {
    printEqual('<div\n   foo="bar"\n   {{action "foo"}}\n   {{! why here }}\n   baz="qux"></div>');
  });

  it('unsafe mustaches', () => {
    printEqual('{{{unsafe}}}');
  });

  it('preserves newline after mustache hash', () => {
    printEqual('{{foo\n  bar=bar\n}}');
  });

  it.skip('preserves multiple class if statements', () => {
    printEqual('<div class="{{if foo "a" "b"}} selected {{if bar "c"}}"></div>');
  });

  it('preserves newline and spaces after mustache hash', () => {
    printEqual(`
      {{foo
        bar=bar
      }}
      {{why.would.you.doThis

        }}
    `);
  });

  it('preserves newlines for element attributes', () => {
    printEqual('<div\n   foo="bar"\n   baz="qux"></div>');
  });

  it.skip('preserves whitespace between block params', () => {
    printEqual('{{#foo bar=bar as | a b |}}{{/foo}}');
  });

  it('configures single quotes for mustache blocks', () => {
    printEqual(
      '<a id="id" {{action \'foo\'}}>' +
               '{{#foo bar=\'bar\' as |a|}}{{/foo}}</a>',
      { quotes: { mustache: "'" } },
    );
  });
});
