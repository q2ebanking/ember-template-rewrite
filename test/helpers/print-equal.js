import assert from 'assert-diff';
import { unescape } from '../../lib/whitespace';
import _print from '../../lib/printer';
import preprocess from '../../lib/preprocess';

function printTransform(template, options) {
  const opts = options || {};
  const formulas = opts.formulas || [];
  const ast = formulas.reduce((inputAst, f) => f(inputAst, opts), preprocess(template));
  return unescape(_print(ast, opts));
}

export function print(ast, options) {
  return unescape(_print(ast, options));
}

export default function printEqual(input, output, options) {
  const actual = printTransform(input, options);
  assert.equal(actual, output);
}

export { preprocess };
