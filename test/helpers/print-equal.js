import assert from 'assert-diff';
import { escape, unescape } from '../../lib/whitespace';
import {
  preprocess as _preprocess
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import print from '../../lib/printer';

function preprocess(template) {
  return _preprocess(escape(template));
}

function printTransform(template, options) {
  let ast = preprocess(escape(template));
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
