import assert from 'assert-diff';
import { unescape } from '../../lib/whitespace';
import _print from '../../lib/printer';
import preprocess from '../../lib/preprocess';

function printTransform(template, options) {
  let ast = preprocess(template);
  options = options || {};
  (options.formulas || []).forEach(f => ast = f(ast, options))
  return unescape(_print(ast, options));
}

export function print(ast, options) {
  return unescape(_print(ast, options));
}

export default function printEqual(input, output, options) {
  try {
    let actual = printTransform(input, options);
    assert.equal(actual, output);
  } catch(e) {
    console.log(e.stack);
    throw e;
  }
}

export { preprocess };
