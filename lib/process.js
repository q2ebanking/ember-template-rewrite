import {
  preprocess,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import print from './printer';
import convertBindAttr from './formulas/convert-bind-attr';
import { escape, unescape } from '../lib/whitespace';

function transform(ast) {
  let plugins = [convertBindAttr];
  plugins.forEach(p => p(ast));
  return ast;
}

export default function process(template) {
  let ast = preprocess(escape(template));
  transform(ast);
  return unescape(print(ast));
}
