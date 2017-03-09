import preprocess from './preprocess';
import print from './printer';
import convertBindAttr from './formulas/convert-bind-attr';
import { unescape } from '../lib/whitespace';

const plugins = {
  'convert-bind-attr': convertBindAttr
};

function transform(ast, formulas) {
  let plugins = getPlugins(formulas);
  plugins.forEach(p => p(ast));
  return ast;
}

function getPlugins(formulas) {
  return (formulas || []).map(f => plugins[f]);
}

export default function process(template, options) {
  options = options || {};
  let ast = preprocess(template);
  transform(ast, options.formulas);
  return unescape(print(ast, options));
}
