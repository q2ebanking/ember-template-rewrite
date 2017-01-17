import {
  preprocess as _parse,
  print as _print,
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import classStringParser from './lib/class-string-parser';

function parse(source) {
  return _parse(source);
}

function print(ast) {
  return _print(ast);
}

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassBinding(modifier) {
  return modifier.hash.pairs[0].key === 'class';
}

function classBindingsToAttribute(modifier, attributes) {
  let pair = modifier.hash.pairs[0];
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
    let modifierCol = (modifier.loc && modifier.loc.start.column) || 0;
    let func;
    if (classCol > modifierCol) {
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
    attributes.push(newClassAttr);
  }
}

function attributeBindingsToAttribute(modifier, attributes) {
  let pair = modifier.hash.pairs[0];
  let key = pair.key;
  let existingAttr = attributes.find(a => a.name === key);
  let node;
  if (pair.value.type === 'PathExpression') {
    node = builders.mustache(pair.value);
  } else {
    node = builders.mustache(pair.value.value);
  }
  if (existingAttr) {
    existingAttr.value = node;
  } else {
    let newAttr = builders.attr(key, node);
    attributes.push(newAttr);
  }
}

function convertBindAttr(source) {
  let ast = parse(source);
  let walker = new Walker(ast);

  walker.visit(ast, function(node) {
    if (node.type === 'ElementNode' && node.modifiers) {
      for (let i = 0; i < node.modifiers.length; i++) {
        let modifier = node.modifiers[i];
        if (isBindAttr(modifier) && isClassBinding(modifier)) {
          classBindingsToAttribute(modifier, node.attributes);
          delete node.modifiers[i];
        } else {
          attributeBindingsToAttribute(modifier, node.attributes);
          delete node.modifiers[i];
        }
      }
    }
  });

  return print(ast);
}

export { parse, print, convertBindAttr };
