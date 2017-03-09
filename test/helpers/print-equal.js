import assert from 'assert-diff';
import { unescape } from '../../lib/whitespace';
import print from '../../lib/printer';
import preprocess from '../../lib/preprocess';

function printTransform(template, options) {
  let ast = preprocess(template);
  options = options || {};
  (options.formulas || []).forEach(f => ast = f(ast, options))
  return unescape(print(ast, options));
}

export default function printEqual(input, output, options) {
  try {
    assert.equal(printTransform(input, options), output);
  } catch(e) {
    console.log(e.stack);
    throw e;
  }
}

export { preprocess };
