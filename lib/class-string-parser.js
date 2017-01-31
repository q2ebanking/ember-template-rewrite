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
      let c = 1;
      let startPath = c;
      let endPath = startPath + path.length;
      c = endPath;
      let mustache = builders.mustache('if', [
        builders.path(path, builders.loc(0, startPath, 0, endPath)),
        ...values.map((v, i) => {
          let str = builders.string(v);
          let length = v.length;
          let cNext = c + length + 3;
          str.loc = builders.loc(0, c + 1, 0, cNext);
          c = cNext;
          return str;
        })
      ], null, null, builders.loc(1, 0, 1, 0));
      mustache.path.loc = builders.loc();
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
