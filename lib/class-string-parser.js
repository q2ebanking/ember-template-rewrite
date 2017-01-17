import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import merge from 'deepmerge';

function isLogicalIf(str) {
  return /(.+:.+:.+|.+:.+)/.test(str);
}

function isStatic(str) {
  return /:.+/.test(str);
}

export default function(str, options) {
  let defaults = { spaces: 0 };
  let { spaces } = merge(defaults, options || {});
  let parts = (str || '').split(/\s+/);
  let nodes = parts.map(v => {
    if (isLogicalIf(v)) {
      let [path, ...values] = v.split(':');
      let mustache = builders.mustache('if', [
        builders.path(path),
        ...values.map(v => builders.string(v))
      ]);
      return mustache;
    } else if (isStatic(v)) {
      return builders.string(v.replace(/^:/, ''));
    } else {
      return builders.mustache(v);
    }
  });
  if (spaces > 0) {
    let nodesAndSpaces = [];
    for (let i = 0; i < nodes.length; i++) {
      nodesAndSpaces.push(nodes[i]);
      if (i < nodes.length - 1) {
        let spaceText = builders.text(Array(spaces + 1).join(' '));
        nodesAndSpaces.push(spaceText);
      }
    }
    nodes = nodesAndSpaces;
  }
  return nodes;
}
