import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function isLogicalIf(str) {
  return /(.+:.+:.+|.+:.+)/.test(str);
}

function isStatic(str) {
  return /:.+/.test(str);
}

function pushBound(value, column, nodes) {
  const columnEnd = column + value.length + 4; // {{}} = 4
  const node = builders.mustache(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  node.path.loc = builders.loc(1, column + 2, 1, columnEnd - 2);
  nodes.push(node);
  return columnEnd;
}

function pushText(value, column, nodes) {
  const columnEnd = column + value.length;
  const node = builders.text(value);
  node.loc = builders.loc(1, column, 1, columnEnd);
  nodes.push(node);
  return columnEnd;
}

export default function(classString, options = {}) {
  const parts = (classString || '').split(/(\S+\s+)/).filter((s) => s);
  let node;
  let column = 0;
  const nodes = [];
  parts.forEach((part) => {
    let trailingSpace = part.match(/\s+$/);
    trailingSpace = trailingSpace && trailingSpace[0];
    if (isLogicalIf(part)) {
      const [pathStr, ...values] = part.trim().split(':');
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

      const params = values.map((value, i) => {
        const str = builders.string(value);
        const { length } = value;
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
        column = pushText(trailingSpace, column, nodes);
      }
    } else if (isStatic(part)) {
      const value = part.replace(/^:/, '');
      column = pushText(value, column, nodes);
    } else {
      column = pushBound(part.trim(), column, nodes);
      if (trailingSpace) {
        column = pushText(trailingSpace, column, nodes);
      }
    }
  });
  return nodes;
}
