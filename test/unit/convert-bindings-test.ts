import _printEqual from 'test/helpers/print-equal';

import convertBindings from 'ember-template-rewrite/formulas/convert-bindings';

const printEqual = (input, output) => {
  _printEqual(input, output, { formulas: [convertBindings] });
};

describe('Unit: convertBindings', () => {
  it('converts fooBinding="bar" to foo=bar', () => {
    const input = '{{a fooBinding="bar.baz"}}';
    const output = '{{a foo=bar.baz}}';
    printEqual(input, output);
  });

  it('does not convert classBinding', () => {
    const input = '{{a classBinding=":bar"}}';
    const output = '{{a classBinding=":bar"}}';
    printEqual(input, output);
  });
});
