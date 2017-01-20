import {
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import classStringParser from '../class-string-parser';
import _ from 'underscore';
import { sort } from '../location';
import compact from '../utils/compact';

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassBinding(pair) {
  return pair.key === 'class';
}

function classBindingsToAttribute(pair, attributes, modifiers) {
  let classString = pair.value.value;
  let existingClassAttr = attributes.find(a => a.name === 'class');
  let nodes = classStringParser(classString, { spaces: true });
  let concat;

  if (existingClassAttr) {
    if (existingClassAttr.value.type === 'ConcatStatement') {
      concat = existingClassAttr.value;
    } else {
      concat = builders.concat([existingClassAttr.value]);
    }
    let classCol = (existingClassAttr.loc && existingClassAttr.loc.start.column) || 0;
    let col = (pair.loc && pair.loc.start.column) || 0;
    let func;
    if (classCol > col) {
      func = Array.prototype.unshift;
    } else {
      func = Array.prototype.push;
    }
    func.apply(concat.parts, [builders.text(' ')]);
    func.apply(concat.parts, nodes);
    existingClassAttr.value = concat;
  } else {
    let newClassAttr;
    if (nodes.length === 0) {
      newClassAttr = builders.attr('class', nodes[0]);
    } else {
      concat = builders.concat(nodes);
      newClassAttr = builders.attr('class', concat);
    }
    let modifierHashPairs = pairsForModifiers(modifiers);
    let index = pairIndex(pair, attributes, modifierHashPairs);
    newClassAttr.loc = pair.loc;
    attributes.splice(index, 0, newClassAttr);
  }
}

function pairsForModifiers(modifiers) {
  let modifierHashPairs = modifiers.map(m => m.hash.pairs).reduce((a,b) => a.concat(b));
  return modifierHashPairs;
}

function nodeColumns(nodes) {
  return nodes.map(n => (n.loc && n.loc.start.column) || 0);
}

function modifierColumns(modifiers) {
  let cols = [];
  modifiers.forEach(m => {
    let pairCols = nodeColumns(m.hash.pairs);
    Array.prototype.push.apply(cols, pairCols);
  });
  return cols;
}

function pairIndex(pair, attributes, modifiers) {
  let allNodes = [pair].concat(attributes).concat(modifiers);
  allNodes = sort(allNodes);
  return allNodes.indexOf(pair);
}

function attributeBindingsToAttribute(pair, attributes, modifiers) {
  let key = pair.key;
  let existingAttr = attributes.find(a => a.name === key);
  if (existingAttr) {
    throw new Error('Can\'t combine bind-attr keys with existing attributes');
  }
  let node;
  if (pair.value.type === 'PathExpression') {
    node = builders.mustache(pair.value);
  } else {
    node = builders.mustache(pair.value.value);
  }
  let newAttr = builders.attr(key, node);
    let modifierHashPairs = pairsForModifiers(modifiers);
    let index = pairIndex(pair, attributes, modifierHashPairs);
    newAttr.loc = pair.loc;
    attributes.splice(index, 0, newAttr);
  }
  export default function convertBindAttr(ast) {
    let walker = new Walker(ast);

    walker.visit(ast, function(node) {
      if (node.type === 'ElementNode' && node.modifiers) {
        for (let i = 0; i < node.modifiers.length; i++) {
          let modifier = node.modifiers[i];
          if (isBindAttr(modifier)) {
            let pairs = modifier.hash.pairs;
            for (let j = 0; j < pairs.length; j++) {
            let pair = pairs[j];
            if (isClassBinding(pair)) {
              classBindingsToAttribute(pair, node.attributes, node.modifiers);
              delete pairs[j];
            } else {
              attributeBindingsToAttribute(pair, node.attributes, node.modifiers);
              delete pairs[j];
            }
          }
          delete node.modifiers[i];
        }
      }
      node.modifiers = compact(node.modifiers);
    }
  });

  return ast;
}
