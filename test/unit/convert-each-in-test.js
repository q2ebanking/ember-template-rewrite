import assert from '../helpers/assert';
import convertEachIn from '../../lib/formulas/convert-each-in';
import _printEqual from '../helpers/print-equal';

const printEqual = (input, output) => {
  _printEqual(input, output, { formulas: [convertEachIn] });
};

describe('Unit: convertEachIn', function() {
  it('converts each-in to each-as', function() {
    let input = '<div>{{#each foo in foos}}{{foo}}{{/each}}</div>';
    let output = '<div>{{#each foos as |foo|}}{{foo}}{{/each}}</div>';
    printEqual(input, output);
  });

  it('converts each-in to each-as with multiline program', function() {
    let input = `
      <div>
        {{#each foo in foos}}
          {{foo}}
        {{/each}}
      </div>
    `;

    let output = `
      <div>
        {{#each foos as |foo|}}
          {{foo}}
        {{/each}}
      </div>
    `;
    printEqual(input, output);
  });

  it('converts each-in to each-as with multiline block statement', function() {
    let input = `
      <div>
        {{#each
          foo in foos}}
          {{foo}}
        {{/each}}
      </div>
    `;

    let output = `
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
