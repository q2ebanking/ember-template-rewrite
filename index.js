import {
  preprocess as _parse,
  print as _print,
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import classStringParser from './lib/class-string-parser';
import _ from 'underscore';

function parse(source) {
  return _parse(source);
}

function print(ast) {
  return _print(ast);
}

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
    let index = pairIndex(pair, attributes, modifiers);
    newClassAttr.loc = pair.loc;
    attributes.splice(index, 0, newClassAttr);
  }
}

function findColumnIndex(col, aCols, bCols) {
  let cols = _.uniq([].concat(aCols)
                      .concat(bCols)
                      .sort((a,b) => a - b));
  for (let i = 0; i < cols.length; i++) {
    if (col <= cols[i]) {
      return i;
    }
  }
  return cols.length;
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
  let col = (pair.loc && pair.loc.start.column) || 0;
  let attrCols = nodeColumns(attributes);
  let modCols = modifierColumns(modifiers);
  let index = findColumnIndex(col, attrCols, modCols);
  return index;
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
  let index = pairIndex(pair, attributes, modifiers);
  newAttr.loc = pair.loc;
  attributes.splice(index, 0, newAttr);
}

function convertBindAttr(source) {
  let ast = parse(source);
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
            } else {
              attributeBindingsToAttribute(pair, node.attributes, node.modifiers);
            }
          }
          delete node.modifiers[i];
        }
      }
    }
  });

  return print(ast);
}

export { parse, print, convertBindAttr };
