import { unescape } from './whitespace';
import convertBindAttr from './formulas/convert-bind-attr';
import convertBindings from './formulas/convert-bindings';
import convertEachIn from './formulas/convert-each-in';
import preprocess from './preprocess';
import print from './printer';

export interface IProcessOptions {
  formulas?: any[];
  quotes?: {
    mustache: string;
  };
}

const plugins = {
  'convert-bind-attr': convertBindAttr,
  'convert-bindings': convertBindings,
  'convert-each-in': convertEachIn,
};

function getPlugins(formulas) {
  return (formulas || []).map((f) => plugins[f]);
}

function transform(ast, formulas) {
  const usedPlugins = getPlugins(formulas);
  usedPlugins.forEach((p) => p(ast));
  return ast;
}

export default function process(template, options: IProcessOptions = { formulas: [] }) {
  const ast = preprocess(template);
  transform(ast, options.formulas);
  return unescape(print(ast, options));
}
