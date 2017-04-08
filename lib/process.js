import preprocess from './preprocess';
import print from './printer';
import convertBindAttr from './formulas/convert-bind-attr';
import convertEachIn from './formulas/convert-each-in';
import { unescape } from '../lib/whitespace';

const plugins = {
  'convert-bind-attr': convertBindAttr,
  'convert-each-in': convertEachIn,
};

function transform(ast, formulas) {
  const plugins = getPlugins(formulas);
  plugins.forEach(p => p(ast));
  return ast;
}

function getPlugins(formulas) {
  return (formulas || []).map(f => plugins[f]);
}

export default function process(template, options) {
  options = options || {};
  const ast = preprocess(template);
  transform(ast, options.formulas);
  return unescape(print(ast, options));
}
