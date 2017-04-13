import preprocess from './preprocess';
import print from './printer';
import convertBindAttr from './formulas/convert-bind-attr';
import convertEachIn from './formulas/convert-each-in';
import { unescape } from '../lib/whitespace';

const plugins = {
  'convert-bind-attr': convertBindAttr,
  'convert-each-in': convertEachIn,
};

function getPlugins(formulas) {
  return (formulas || []).map(f => plugins[f]);
}

function transform(ast, formulas) {
  const usedPlugins = getPlugins(formulas);
  usedPlugins.forEach(p => p(ast));
  return ast;
}

export default function process(template, options = {}) {
  const ast = preprocess(template);
  transform(ast, options.formulas);
  return unescape(print(ast, options));
}
