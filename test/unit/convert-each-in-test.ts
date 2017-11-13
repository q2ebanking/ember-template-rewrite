import _printEqual from 'test/helpers/print-equal';

import convertEachIn from 'ember-template-rewrite/formulas/convert-each-in';

const printEqual = (input, output) => {
  _printEqual(input, output, { formulas: [convertEachIn] });
};

describe('Unit: convertEachIn', () => {
  it('converts each-in to each-as', () => {
    const input = '<div>{{#each foo in foos}}{{foo}}{{/each}}</div>';
    const output = '<div>{{#each foos as |foo|}}{{foo}}{{/each}}</div>';
    printEqual(input, output);
  });

  it('converts each-in to each-as with multiline program', () => {
    const input = `
      <div>
        {{#each foo in foos}}
          {{foo}}
        {{/each}}
      </div>
    `;

    const output = `
      <div>
        {{#each foos as |foo|}}
          {{foo}}
        {{/each}}
      </div>
    `;
    printEqual(input, output);
  });

  it('converts each-in to each-as with multiline block statement', () => {
    const input = `
      <div>
        {{#each
          foo in foos}}
          {{foo}}
        {{/each}}
      </div>
    `;

    const output = `
      <div>
        {{#each
          foos as |foo|}}
          {{foo}}
        {{/each}}
      </div>
    `;
    printEqual(input, output);
  });
});
