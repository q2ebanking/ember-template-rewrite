import {
  preprocess,
  print,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import convertBindAttr from './formulas/convert-bind-attr';

function transform(ast) {
  let plugins = [convertBindAttr];
  plugins.forEach(p => p(ast));
  return ast;
}

export default function process(template) {
  let ast = preprocess(template);
  transform(ast);
  return print(ast);
}
