import {
  preprocess as _preprocess,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import fixAttrMustacheLoc from './transforms/fix-attr-mustache-loc';
import { escape } from './whitespace';

export default function preprocess(template, options = {}) {
  const transforms = [fixAttrMustacheLoc];
  const ast = _preprocess(escape(template), options);
  return transforms.reduce((acc, t) => t(acc), ast);
}
