import preprocess from './preprocess';
import print from './printer';
import convertBindAttr from './formulas/convert-bind-attr';
import { escape, unescape } from '../lib/whitespace';

function transform(ast) {
  let plugins = [convertBindAttr];
  plugins.forEach(p => p(ast));
  return ast;
}

export default function process(template, options) {
  let ast = preprocess(escape(template));
  transform(ast);
  return unescape(print(ast, options));
}
