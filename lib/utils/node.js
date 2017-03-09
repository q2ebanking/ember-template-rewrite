import _ from 'underscore';
import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

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

function _offsetNodeRecursive(node, offset, options) {
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
  let { loc } = node;
  if (options && options.both) {
    loc = builders.loc(
      loc.start.line   + offset.line,
      loc.start.column + offset.column,
      loc.end.line     + offset.line,
      loc.end.column   + offset.column
    );
  } else if (offset.line !== 0) {
    loc = builders.loc(
      loc.start.line   + offset.line,
      loc.start.column,
      loc.end.line     + offset.line,
      loc.end.column
    );
  } else {
    loc = builders.loc(
      loc.start.line,
      loc.start.column + offset.column,
      loc.end.line,
      loc.end.column   + offset.column
    );
  }
  node.loc = loc;
  return node;
}



function sameLine(node, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  return sortNodes([node], nodes);
}

export {
  sortNodes,
  nodesBefore,
  nodesAfter,
  nodeIndex,
  offsetNode
};
