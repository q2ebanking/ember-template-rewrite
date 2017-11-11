import { describe, it } from 'mocha';
import convertBindings from '../../lib/formulas/convert-bindings';
import _printEqual from '../helpers/print-equal';

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
