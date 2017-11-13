import * as assert from 'assert-diff';

import { unescape } from 'ember-template-rewrite/whitespace';
import _print from 'ember-template-rewrite/printer';
import preprocess from 'ember-template-rewrite/preprocess';

interface IPrintEqualOptions {
  formulas?: any[];
  quotes?: {
    mustache: string;
  };
}

function printTransform(template, options: IPrintEqualOptions = {}) {
  const formulas = options.formulas || [];
  const ast = formulas.reduce((inputAst, f) => f(inputAst, options), preprocess(template));
  return unescape(_print(ast, options));
}

export function print(ast, options = {}) {
  return unescape(_print(ast, options));
}

export default function printEqual(input, output, options: IPrintEqualOptions = {}) {
  const actual = printTransform(input, options);
  assert.equal(actual, output);
}

export { preprocess };
