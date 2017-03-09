import {
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import _ from 'underscore';
import {
  locDiff,
  locOffset,
  addOffsets,
  locSpan
} from '../utils/location';
import {
  sortNodes as sort,
  nodeIndex,
  nodesAfter,
  nodesBefore,
  offsetNode,
  removeNode,
  enumerate,
  sizeOfNodes
} from '../utils/node';
import classStringParser from '../class-string-parser';
import print from '../printer';

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassBinding(pair) {
  return pair.key === 'class';
}

function classBindingToAttribute(pair) {
  let classString = pair.value.value;
  let nodes = classStringParser(classString, { spaces: true });
  let mustLoc = nodes[1];
  let size = sizeOfNodes(nodes);
  let concat, node;

  let quoteSize = 0;
  if (nodes.length === 1) {
    node = nodes[0];
  } else {
    node = builders.concat(nodes);
    quoteSize = 2;
  }

  let loc = builders.loc(
    1,
    0,
    1 + size.line,
    size.column + 6 + quoteSize + 1, // "class=" 6
  );
  return builders.attr('class', node, loc);
}

function attributeBindingToAttribute(pair) {
  let attrKey = pair.key;
  let startAttr = 0;
  let equalCol = startAttr + attrKey.length;
  let startMust = equalCol + 1; // "="  1

  let value;
  if (pair.value.type === 'PathExpression') {
    value = pair.value.original;
  } else if (pair.value.type === 'StringLiteral') {
    value = pair.value.value;
  }
  let valueLength = value.length;
  let endMust = startMust + 2 + valueLength + 2;

  let node = builders.mustache(value);
  node.loc = builders.loc(1, startMust, 1, endMust);
  node.path.loc = builders.loc(1, startMust + 2, 1, endMust - 2);
  let newAttr = builders.attr(pair.key, node);
  newAttr.loc = builders.loc(1, startAttr, 1, endMust);
  return newAttr;
}

function removeBindAttr(modifier, node, ast) {
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

  let firstAttrOffset;
  let prevAttrsOffset = { line: 0, column: 0 };
  // set locations of new attributes
  for (let i = 0; i < attrs.length; i++) {
    let { attr, pair } = attrs[i];
    if (i === 0) {
      firstAttrOffset = locDiff(attr.loc, modifier.loc).start;
      offsetNode(attr, firstAttrOffset, { recursive: true, both: true });
      prevAttrsOffset = addOffsets(prevAttrsOffset, sizeOfNodes(attr));
    } else {
      // find old offset to previous value
      let {
        attr: prevAttr,
        pair: prevPair
      } = attrs[i-1];
      offsetNode(attr, firstAttrOffset, { recursive: true, both: true });

      let offset = { line: 0, column: 0 };

      let prevPairDiff = {
        line: pair.loc.start.line - prevPair.loc.end.line,
        column: pair.loc.start.column - prevPair.loc.end.column
      };
      offset = addOffsets(offset, prevPairDiff);
      offset = addOffsets(offset, prevAttrsOffset);
      offsetNode(attr, offset, { recursive: true, both: false });

      prevAttrsOffset = addOffsets(prevAttrsOffset, sizeOfNodes(attr));
      prevAttrsOffset = addOffsets(prevAttrsOffset, prevPairDiff);
    }
  }

  removeNode(modifier, ast);

  let firstAttr = attrs[0].attr;
  let lastAttr = attrs[attrs.length - 1].attr;
  let startingAt = modifier.loc.start;
  let offset = prevAttrsOffset;
  offsetNode(ast, offset, { recursive: true, startingAt });

  let bindAttrIndex = nodeIndex(modifier, node.attributes);
  attrs.forEach((a,i) => node.attributes.splice(bindAttrIndex + i, 0, a.attr));
}

export default function convertBindAttr(ast) {
  let walker = new Walker(ast);
  let flattened = ast

  walker.visit(ast, function(node) {
    if (node.type === 'ElementNode' && node.modifiers) {
      let modifiers = _.clone(node.modifiers);
      for (let i = 0; i < modifiers.length; i++) {
        let modifier = modifiers[i];
        if (isBindAttr(modifier)) {
          removeBindAttr(modifier, node, ast);
        }
      }
    }
  });

  return ast;
}

export {
  attributeBindingToAttribute,
  removeBindAttr
};
