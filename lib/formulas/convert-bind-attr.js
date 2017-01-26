import {
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import classStringParser from '../class-string-parser';
import _ from 'underscore';
import { sort } from '../location';
import compact from '../utils/compact';
import print from '../printer';

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassBinding(pair) {
  return pair.key === 'class';
}

function buildLoc(startCol, startLine, endCol, endLine) {
  return {
    start: {
      column: startCol,
      line: startLine
    },
    end: {
      column: endCol,
      line: endLine
    }
  };
}

function locDiff(a, b) {
  return buildLoc(
    b.start.column - a.start.column,
    b.start.line   - a.start.line,
    b.end.column   - a.end.column,
    b.end.line     - a.end.line
  );
}

function locOffset(a, b) {
  return {
    column: b.start.column - a.end.column,
    line: b.start.line   - a.end.line
  };
}

function nodeIndex(node, ...lists) {
  let nodes = sort(node, ...lists);
  return nodes.indexOf(node);
}

function classBindingToAttribute(pair) {
  let classString = pair.value.value;
  let nodes = classStringParser(classString, { spaces: true });
  let concat, node;

  if (nodes.length === 1) {
    node = nodes[0];
  } else {
    node = builders.concat(nodes);
  }

  let newAttr = builders.attr('class', node);
  newAttr.loc = cloneLoc(pair.loc);
  return newAttr;
}

function attributeBindingToAttribute(pair) {
  let node;
  if (pair.value.type === 'PathExpression') {
    node = builders.mustache(pair.value);
  } else {
    node = builders.mustache(pair.value.value);
  }
  let newAttr = builders.attr(pair.key, node);
  newAttr.loc = cloneLoc(pair.loc);
  return newAttr;
}

function offsetLoc(loc, offset) {
  if (offset.line !== 0) {
    return buildLoc(
      loc.start.column,
      loc.start.line   + offset.line,
      loc.end.column,
      loc.end.line     + offset.line
    );
  } else {
    return buildLoc(
      loc.start.column + offset.column,
      loc.start.line,
      loc.end.column   + offset.column,
      loc.end.line,
    );
  }
}

function cloneLoc(loc) {
  return buildLoc(
    loc.start.column,
    loc.start.line,
    loc.end.column,
    loc.end.line
  );
}

function nodesAfter(after, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  let sorted = sameLine(after, nodes);
  let index = sorted.indexOf(after);
  let stop = index;
  let currentLine = after.loc.start.line;
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

function sameLine(node, ...nodes) {
  nodes = nodes.reduce((acc,n) => acc.concat(n), []);
  return sort([node], nodes);
}

function removeBindAttr(modifier, node, sortedAttrs) {
  let pairs = modifier.hash.pairs;
  let attrs = [];
  for (let j = 0; j < pairs.length; j++) {
    let pair = pairs[j];
    let attr;
    if (isClassBinding(pair)) {
      attr = classBindingToAttribute(pair);
    } else {
      attr = attributeBindingToAttribute(pair);
    }
    attrs.push({ pair, attr });
  }
  // check that attrs don't already exist
  // find index of bind-attr in attributes + modifiers + comments
  let bindAttrIndex = nodeIndex(modifier, node.attributes);
  let previousNodes = nodesBefore(modifier, node.attributes, node.modifiers);
  let previousNode = previousNodes[previousNodes.length - 1];
  let leadingLocDiff = previousNode ? locDiff(previousNode.loc, modifier.loc).start : { column: 0, line: 0 };

  // set locations of new attributes
  for (let i = 0; i < attrs.length; i++) {
    let { attr, pair } = attrs[i];
    let length = print(attr).length;
    if (i === 0) {
      attr.loc = cloneLoc(modifier.loc);
    } else {
      // find old offset to previous value
      let {
        attr: prevAttr,
        pair: prevPair
      } = attrs[i-1];
      let offset = locDiff(prevPair.loc, prevAttr.loc).end;
      // compute length of new attribute
      let loc = cloneLoc(pair.loc);
      loc = offsetLoc(loc, offset);
      attr.loc = loc;
    }
    attr.loc.end.column = attr.loc.start.column + length;
  }

  // find old offset to next value
  let lastAttr = attrs[attrs.length - 1].attr;
  //let trailingOffset = { column: lastAttr.loc.end.column -  modifier.loc.end.column, line: 0 };
  let trailingOffset = locDiff(modifier.loc, lastAttr.loc).end;
  // get all attributes/modifiers/comments after index
  let followingNodes = nodesAfter(modifier, node.attributes, node.modifiers);

  // offset each following attribute
  for (let i = 0; i < followingNodes.length; i++) {
    let attr = followingNodes[i];
    attr.loc = offsetLoc(attr.loc, trailingOffset);
  }
  // insert into attributes
  attrs.forEach((a,i) => node.attributes.splice(bindAttrIndex + i, 0, a.attr));
  // delete bind-attr modifier from modifiers array? maybe in parent func
  let i = node.modifiers.indexOf(modifier);
  node.modifiers.splice(i, 1);
}

export default function convertBindAttr(ast) {
  let walker = new Walker(ast);

  walker.visit(ast, function(node) {
    if (node.type === 'ElementNode' && node.modifiers) {
      let modifiers = _.clone(node.modifiers);
      let sortedAttrs = sort(node.modifiers, node.attributes);
      for (let i = 0; i < modifiers.length; i++) {
        let modifier = modifiers[i];
        if (isBindAttr(modifier)) {
          removeBindAttr(modifier, node, sortedAttrs);
        }
      }
    }
  });

  return ast;
}

export {
  nodeIndex,
  nodesAfter,
  nodesBefore,
  offsetLoc,
  attributeBindingToAttribute,
  removeBindAttr
};
