import _ from 'underscore';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import {
  locStartsAfter,
  locEndsAfter,
  posAfter,
  posBefore,
  locContains,
  locSpan,
  locAdd
} from './location';

function nodeIndex(node, ...lists) {
  let nodes = sortNodes(node, ...lists);
  return nodes.indexOf(node);
}

function sortNodes(...nodes) {
  let allNodes = [];
  nodes.forEach(n => allNodes = allNodes.concat(n));
  return _.uniq(allNodes).sort((a, b) => {
    let lineDiff = a.loc.start.line - b.loc.start.line;
    let colDiff = a.loc.start.column - b.loc.start.column;
    return lineDiff === 0 && colDiff > 0 || lineDiff > 0;
  });
}

function nodesBefore(before, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  let sorted = sameLine(before, nodes);
  let index = sorted.indexOf(before);
  let start = index;
  let currentLine = before.loc.start.line;
  for (let i = start; i >= 0; i--) {
    let endLine = sorted[i].loc.end.line;
    if (endLine === currentLine) {
      start = i;
    } else {
      break;
    }
  }
  return sorted.slice(start, index);
}

function nodesAfter(after, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  let sorted = sameLine(after, nodes);
  let index = sorted.indexOf(after);
  let stop = index;
  let currentLine = after.loc.end.line;
  for (let i = stop; i < sorted.length; i++) {
    let endLine = sorted[i].loc.end.line;
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
  let { parent, property } = options || {};
  if (node.type) {
    func(node, options || {});
  }
  Object.entries(node).forEach(([key, val], i) => {
    if (val && val.type) {
      enumerate(val, func, { parent: node, property: key, isArray: false });
    } else if (Array.isArray(val)) {
      let nodes = _.clone(val);
      nodes.forEach((n, index) => enumerate(n, func, {
        parent: node, property: key, isArray: true, index
      }));
    }
  });
  return node;
}

function _offsetNodeRecursive(node, offset, options) {
  if (!node) {
    return node;
  }
  if (node.loc) {
    _offsetNode(node, offset, options);
  }
  Object.entries(node).forEach(([key, val], i) => {
    if (val && val.type) {
      _offsetNodeRecursive(val, offset, options);
    } else if (Array.isArray(val)) {
      val.forEach(v => _offsetNodeRecursive(v, offset, options));
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
    return _offsetNodeRecursive(node, offset, options);
  } else {
    return _offsetNode(node, offset, options);
  }
}

function _offsetNode(node, offset, options) {
  if (!node || !node.loc) {
    throw new Error('_offsetNode must be given a node with a loc');
  }
  options = options || {};
  let { loc } = node;
  let { startingAt } = options;

  if (offset.line && !options.both) {
    offset.column = 0;
  }

  let diff = builders.loc(
    offset.line,
    offset.column,
    offset.line,
    offset.column
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

function sameLine(node, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  return sortNodes([node], nodes);
}

function removeNode(target, ast) {
  enumerate(ast, function(node, { parent, property, isArray, index }) {
    if (target === node) {
      if (isArray) {
        parent[property].splice(index, 1);
      } else {
        delete parent[property];
      }
    }
  });

  let startingAt = target.loc.start;
  let span = locSpan(target.loc);
  span.line = -span.line;
  span.column = -span.column;
  let after = nodesAfter(target, ast);
  let before = nodesAfter(target, ast);
  offsetNode(ast, span, { recursive: true, startingAt });
  if (after.length === 0 && before.length === 0) {
    // TODO: delete empty line
  }

  return ast;
}

function sizeOfNodes(nodes) {
  let minLine = null,
    maxLine = null,
    minCol = null,
    maxCol = null;
  enumerate({ nodes }, function(n) {
    if (n.loc) {
      let value = n.value || n.chars || '';
      let {
        start: {
          line: startLine,
          column: startCol
        },
        end: {
          line: endLine,
          column: endCol
        }
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
  sizeOfNodes
};
