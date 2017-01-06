import {
  preprocess as _parse,
  print as _print,
  Walker,
  builders
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function parse(source) {
  return _parse(source);
}

function print(ast) {
  return _print(ast);
}

function isBindAttr(modifier) {
  return modifier.path.original === 'bind-attr';
}

function isClassTernary(modifier) {
  return modifier.hash.pairs[0].key === 'class';
}

function classTernaryToAttribute(modifier, attributes) {
  let pair = modifier.hash.pairs[0];
  let [path, ...values] = pair.value.value.split(':');
  let classAttr = attributes.find(a => a.name === 'class');
  let mustache = builders.mustache('if', [
    builders.path(path),
    ...values.map(v => builders.string(v))
  ]);
  let concat;

  if (classAttr) {
    if (classAttr.value.type === 'ConcatStatement') {
      concat = classAttr.value;
    } else {
      concat = builders.concat([classAttr.value]);
    }
    let classCol = (classAttr.loc && classAttr.loc.start.column) || 0;
    let modifierCol = (modifier.loc && modifier.loc.start.column) || 0;
    if (classCol > modifierCol) {
      concat.parts.unshift(builders.text(' '));
      concat.parts.unshift(mustache);
    } else {
      concat.parts.push(builders.text(' '));
      concat.parts.push(mustache);
    }
    classAttr.value = concat;
  } else {
    concat = builders.concat([]);
    concat.parts.push(mustache);
    classAttr = builders.attr('class', concat);
    attributes.push(classAttr);
  }
}

function convertBindAttr(source) {
  let ast = parse(source);
  let walker = new Walker(ast);

  walker.visit(ast, function(node) {
    if (node.type === 'ElementNode') {
      if (node.modifiers) {
        for (let i = 0; i < node.modifiers.length; i++) {
          let modifier = node.modifiers[i];
          if (isBindAttr(modifier)) {
            if (isClassTernary(modifier)) {
              classTernaryToAttribute(modifier, node.attributes);
            }
            delete node.modifiers[i];
          }
        }
      }
    }
  });

  return print(ast);
}

export { parse, print, convertBindAttr };
