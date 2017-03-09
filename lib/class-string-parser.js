import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import merge from 'deepmerge';
import repeat from './utils/repeat';

function isLogicalIf(str) {
  return /(.+:.+:.+|.+:.+)/.test(str);
}

function isStatic(str) {
  return /:.+/.test(str);
}

export default function(str, options) {
  let parts = (str || '').split(/(\S+\s+)/).filter(s => s);
  let node;
  let column = 0;
  let columnEnd = 0;
  let nodes = []
  parts.forEach(v => {
    let trailingSpace = v.match(/\s+$/);
    trailingSpace = trailingSpace && trailingSpace[0];
    if (isLogicalIf(v)) {
      let [pathStr, ...values] = v.trim().split(':');
      let isUnless = values[0] === '';
      if (isUnless) {
        values.splice(0, 1); // remove leading blank that is not used in unless
      }
      let helperName = isUnless ? "unless" : "if";
      let startMust = column;
      column += 2; // "{{"
      let startIf = column;
      column += helperName.length;
      let endIf = column;
      // " " between {{if thing "then" "else"}}
      //                 ^
      column = column + 1; // " "
      let startPath = column;
      column += pathStr.length;
      let endPath = column;
      let path = builders.path(pathStr, builders.loc(1, startPath, 1, endPath))

      let params = values.map((v, i) => {
        let str = builders.string(v);
        let length = v.length;
        if (i < values.length) {
          // leading " " before {{if thing "then" "else"}}
          //                              ^      ^
          column = column + 1;
        }
        let startStr = column;
        column += length + 2; // plus 2 quotes
        let endStr = column;

        str.loc = builders.loc(1, startStr, 1, endStr);

        return str;
      });

      column += 2; // "}}"
      let endMust = column;

      node = builders.mustache(helperName, [
        path, ...params
      ], null, null, builders.loc(1, startMust, 1, endMust));

      // "if" or "unless" location
      node.path.loc = builders.loc(1, startIf, 1, endIf);

      nodes.push(node);

      if (trailingSpace) {
        column = pushText(trailingSpace, column, nodes, options);
      }

    } else if (isStatic(v)) {
      let value = v.replace(/^:/, '');
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
  let columnEnd = column + value.length + 4; // {{}} = 4
  let node = builders.mustache(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  node.path.loc = builders.loc(1, column + 2, 1, columnEnd - 2);
  nodes.push(node);
  return columnEnd;
}

function pushText(value, column, nodes, options) {
  let columnEnd = column + value.length;
  let node = builders.text(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  nodes.push(node);
  return columnEnd;
}
