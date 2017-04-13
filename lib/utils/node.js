/* eslint-disable max-len */
/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["parent", "offset", "node"] }] */
/* eslint-enable max-len */
import _ from 'underscore';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import {
  posAfter,
  posBefore,
  locSpan,
  locAdd,
} from './location';

function sortNodes(...nodes) {
  const allNodes = nodes.reduce((acc, n) => acc.concat(n), []);
  return _.uniq(allNodes).sort((a, b) => {
    const lineDiff = a.loc.start.line - b.loc.start.line;
    const colDiff = a.loc.start.column - b.loc.start.column;
    return (lineDiff === 0 && colDiff > 0) || lineDiff > 0;
  });
}

function nodeIndex(node, ...lists) {
  const nodes = sortNodes(node, ...lists);
  return nodes.indexOf(node);
}

function sameLine(node, ...nodes) {
  const allNodes = nodes.reduce((acc, n) => acc.concat(n), []);
  return sortNodes([node], allNodes);
}

function nodesBefore(before, ...nodes) {
  const allNodes = nodes.reduce((acc, n) => acc.concat(n), []);
  const sorted = sameLine(before, allNodes);
  const index = sorted.indexOf(before);
  let start = index;
  const currentLine = before.loc.start.line;
  for (let i = start; i >= 0; i -= 1) {
    const endLine = sorted[i].loc.end.line;
    if (endLine === currentLine) {
      start = i;
    } else {
      break;
    }
  }
  return sorted.slice(start, index);
}

function nodesAfter(after, ...nodes) {
  const allNodes = nodes.reduce((acc, n) => acc.concat(n), []);
  const sorted = sameLine(after, allNodes);
  const index = sorted.indexOf(after);
  let stop = index;
  const currentLine = after.loc.end.line;
  for (let i = stop; i < sorted.length; i += 1) {
    const endLine = sorted[i].loc.end.line;
    if (endLine === currentLine) {
      stop = i;
    } else {
      break;
    }
  }
  return sorted.slice(index + 1, stop + 1);
}

function enumerate(node, func, options) {
  if (!node) {
    return node;
  }
  if (node.type) {
    func(node, options || {});
  }
  Object.entries(node).forEach(([key, val]) => {
    if (val && val.type) {
      enumerate(val, func, { parent: node, property: key, isArray: false });
    } else if (Array.isArray(val)) {
      const nodes = _.clone(val);
      nodes.forEach((n, index) => enumerate(n, func, {
        parent: node, property: key, isArray: true, index,
      }));
    }
  });
  return node;
}

function performOffset(node, offset, options = {}) {
  if (!node || !node.loc) {
    throw new Error('performOffset must be given a node with a loc');
  }
  let { loc } = node;
  const { startingAt } = options;

  if (offset.line && !options.both) {
    offset.column = 0;
  }

  let diff = builders.loc(
    offset.line,
    offset.column,
    offset.line,
    offset.column,
  );

  if (startingAt) {
    // entire node is before start
    if (posBefore(loc.end, startingAt)) {
      diff = null;
    }

    // on line below start
    if (loc.start.line > startingAt.line) {
      diff.start.column = 0;
      diff.end.column = 0;
    }

    if (loc.end.line > startingAt.line) {
      if (loc.start.line === startingAt.line) {
        // starts on same line after but ends on lower line
        // shift start but not end
        diff.end.column = 0;
      } else {
        // node ends below line than starting line
        diff.end.column = 0;
      }
    }

    // node starts before start but ends after
    if (posBefore(loc.start, startingAt) && posAfter(loc.end, startingAt)) {
      diff.start.line = 0;
      diff.start.column = 0;
    }
  }

  if (!diff) {
    return node;
  }

  loc = builders.loc(loc);
  loc = locAdd(loc, diff);
  node.loc = loc;
  return node;
}

function offsetNodeRecursive(node, offset, options) {
  if (!node) {
    return node;
  }
  if (node.loc) {
    performOffset(node, offset, options);
  }
  Object.values(node).forEach((val) => {
    if (val && val.type) {
      offsetNodeRecursive(val, offset, options);
    } else if (Array.isArray(val)) {
      val.forEach(v => offsetNodeRecursive(v, offset, options));
    }
  });
  return node;
}

function offsetNode(node, offset, options) {
  if (Array.isArray(node)) {
    return node.map(n => offsetNode(n, offset, options));
  }
  if (!node || !node.loc) {
    throw new Error('offsetNode must be given a node with a loc');
  }
  if (options && options.recursive) {
    return offsetNodeRecursive(node, offset, options);
  }
  return performOffset(node, offset, options);
}

function removeNode(target, ast) {
  enumerate(ast, (node, { parent, property, isArray, index }) => {
    if (target === node) {
      if (isArray) {
        parent[property].splice(index, 1);
      } else {
        delete parent[property];
      }
    }
  });

  const startingAt = target.loc.start;
  const span = locSpan(target.loc);
  span.line = -span.line;
  span.column = -span.column;
  const after = nodesAfter(target, ast);
  const before = nodesAfter(target, ast);
  offsetNode(ast, span, { recursive: true, startingAt });
  if (after.length === 0 && before.length === 0) {
    // TODO: delete empty line
  }

  return ast;
}

function sizeOfNodes(nodes) {
  let minLine = null;
  let maxLine = null;
  let minCol = null;
  let maxCol = null;
  enumerate({ nodes }, (n) => {
    if (n.loc) {
      const {
        start: {
          line: startLine,
          column: startCol,
        },
        end: {
          line: endLine,
          column: endCol,
        },
      } = n.loc;
      if (minLine === null || minLine > startLine) {
        minLine = startLine;
      }
      if (maxLine === null || maxLine < endLine) {
        maxLine = endLine;
      }
      if (minCol === null || minCol > startCol) {
        minCol = startCol;
      }
      if (maxCol === null || maxCol < endCol) {
        maxCol = endCol;
      }
    }
  }, { recursive: true });
  return builders.loc(0, 0, maxLine - minLine, maxCol - minCol).end;
}

export {
  sortNodes,
  nodesBefore,
  nodesAfter,
  nodeIndex,
  offsetNode,
  removeNode,
  enumerate,
  sizeOfNodes,
};
