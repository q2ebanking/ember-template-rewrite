import {
  builders,
  Walker,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import * as _ from 'underscore';
import classStringParser from '../class-string-parser';
import {
  addOffsets,
  locDiff,
} from '../utils/location';
import {
  nodeIndex,
  offsetNode,
  removeNode,
  sizeOfNodes,
} from '../utils/node';

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassBinding(pair) {
  return pair.key === 'class';
}

function classBindingToAttribute(pair) {
  const classString = pair.value.value;
  const nodes = classStringParser(classString);
  const size = sizeOfNodes(nodes);
  let node;

  let quoteSize = 0;
  if (nodes.length === 1) {
    node = nodes[0];
  } else {
    node = builders.concat(nodes);
    quoteSize = 2;
    node.loc = builders.loc(
      1,
      0,
      1 + size.line,
      size.column - 1 + quoteSize,
    );
  }

  offsetNode(node, {
    column: 6, // class=
    line: 0,
  }, { recursive: true });

  const loc = builders.loc(
    1,
    0,
    node.loc.end.line,
    node.loc.end.column,
  );
  const attr = builders.attr('class', node, loc);
  return attr;
}

function attributeBindingToAttribute(pair) {
  const attrKey = pair.key;
  const startAttr = 0;
  const equalCol = startAttr + attrKey.length;
  const startMust = equalCol + 1; // "="  1

  let value;
  if (pair.value.type === 'PathExpression') {
    value = pair.value.original;
  } else if (pair.value.type === 'StringLiteral') {
    value = pair.value.value;
  }
  const valueLength = value.length;
  const endMust = startMust + 2 + valueLength + 2;

  const node = builders.mustache(value);
  node.loc = builders.loc(1, startMust, 1, endMust);
  node.path.loc = builders.loc(1, startMust + 2, 1, endMust - 2);
  const newAttr = builders.attr(pair.key, node);
  newAttr.loc = builders.loc(1, startAttr, 1, endMust);
  return newAttr;
}

function removeBindAttr(modifier, node, ast) {
  const { hash: { pairs } } = modifier;
  const attrs = [];
  for (const pair of pairs) {
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
  for (let i = 0; i < attrs.length; i += 1) {
    const { attr, pair } = attrs[i];
    if (i === 0) {
      firstAttrOffset = locDiff(attr.loc, modifier.loc).start;
      offsetNode(attr, firstAttrOffset, { recursive: true, both: true });
      prevAttrsOffset = addOffsets(prevAttrsOffset, sizeOfNodes(attr));
    } else {
      // find old offset to previous value
      const {
        pair: prevPair,
      } = attrs[i - 1];
      offsetNode(attr, firstAttrOffset, { recursive: true, both: true });

      let off = { column: 0, line: 0 };

      const prevPairDiff = {
        column: pair.loc.start.column - prevPair.loc.end.column,
        line: pair.loc.start.line - prevPair.loc.end.line,
      };
      off = addOffsets(off, prevPairDiff);
      off = addOffsets(off, prevAttrsOffset);
      offsetNode(attr, off, { recursive: true, both: false });

      prevAttrsOffset = addOffsets(prevAttrsOffset, sizeOfNodes(attr));
      prevAttrsOffset = addOffsets(prevAttrsOffset, prevPairDiff);
    }
  }

  removeNode(modifier, ast);

  const startingAt = modifier.loc.start;
  const offset = prevAttrsOffset;
  offsetNode(ast, offset, { recursive: true, startingAt });

  const bindAttrIndex = nodeIndex(modifier, node.attributes);
  attrs.forEach((a, i) => node.attributes.splice(bindAttrIndex + i, 0, a.attr));
}

export default function convertBindAttr(ast) {
  const walker = new Walker(ast);

  walker.visit(ast, (node) => {
    if (node.type === 'ElementNode' && node.modifiers) {
      const modifiers = _.clone(node.modifiers);
      for (const modifier of modifiers) {
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
  removeBindAttr,
};
