import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import merge from 'deepmerge';
import repeat from './utils/repeat';

function isLogicalIf(str) {
  return /(.+:.+:.+|.+:.+)/.test(str);
}

function isStatic(str) {
  return /:.+/.test(str);
}

export default function (str, options) {
  const parts = (str || '').split(/(\S+\s+)/).filter(s => s);
  let node;
  let column = 0;
  const columnEnd = 0;
  const nodes = [];
  parts.forEach((v) => {
    let trailingSpace = v.match(/\s+$/);
    trailingSpace = trailingSpace && trailingSpace[0];
    if (isLogicalIf(v)) {
      const [pathStr, ...values] = v.trim().split(':');
      const isUnless = values[0] === '';
      if (isUnless) {
        values.splice(0, 1); // remove leading blank that is not used in unless
      }
      const helperName = isUnless ? 'unless' : 'if';
      const startMust = column;
      column += 2; // "{{"
      const startIf = column;
      column += helperName.length;
      const endIf = column;
      // " " between {{if thing "then" "else"}}
      //                 ^
      column += 1; // " "
      const startPath = column;
      column += pathStr.length;
      const endPath = column;
      const path = builders.path(pathStr, builders.loc(1, startPath, 1, endPath));

      const params = values.map((v, i) => {
        const str = builders.string(v);
        const length = v.length;
        if (i < values.length) {
          // leading " " before {{if thing "then" "else"}}
          //                              ^      ^
          column += 1;
        }
        const startStr = column;
        column += length + 2; // plus 2 quotes
        const endStr = column;

        str.loc = builders.loc(1, startStr, 1, endStr);

        return str;
      });

      column += 2; // "}}"
      const endMust = column;

      node = builders.mustache(helperName, [
        path, ...params,
      ], null, null, builders.loc(1, startMust, 1, endMust));

      // "if" or "unless" location
      node.path.loc = builders.loc(1, startIf, 1, endIf);

      nodes.push(node);

      if (trailingSpace) {
        column = pushText(trailingSpace, column, nodes, options);
      }
    } else if (isStatic(v)) {
      const value = v.replace(/^:/, '');
      column = pushText(value, column, nodes, options);
    } else {
      column = pushBound(v.trim(), column, nodes, options);
      if (trailingSpace) {
        column = pushText(trailingSpace, column, nodes, options);
      }
    }
  });
  return nodes;
}

function pushBound(value, column, nodes, options) {
  const columnEnd = column + value.length + 4; // {{}} = 4
  const node = builders.mustache(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  node.path.loc = builders.loc(1, column + 2, 1, columnEnd - 2);
  nodes.push(node);
  return columnEnd;
}

function pushText(value, column, nodes, options) {
  const columnEnd = column + value.length;
  const node = builders.text(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  nodes.push(node);
  return columnEnd;
}
