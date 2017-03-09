import {
  preprocess as _preprocess
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import { escape, unescape } from './whitespace';
import fixAttrMustacheLoc from './transforms/fix-attr-mustache-loc';

export default function preprocess(template, options) {
  let transforms = [fixAttrMustacheLoc];
  let ast = _preprocess(escape(template), options);
  return transforms.reduce((ast, t) => t(ast), ast);
}
