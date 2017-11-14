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

function printTransform(template, options: IPrintEqualOptions = {}): string {
  const outAst = ast(template, options);
  return unescape(_print(outAst, options));
}

export function print(inAst, options = {}): string {
  return unescape(_print(inAst, options));
}

export default function printEqual(input, output, options: IPrintEqualOptions = {}) {
  const actual = printTransform(input, options);
  assert.equal(actual, output);
}

export function astEqual(input, output, options: IPrintEqualOptions = {}) {
  const astInput = ast(input, options);
  const astOutput = ast(output, options);
  assert.deepEqual(astInput, astOutput);
}

export function ast(input, options: IPrintEqualOptions = {}) {
  const formulas = options.formulas || [];
  return formulas.reduce((inputAst, f) => f(inputAst, options), preprocess(input));
}

export { preprocess };
