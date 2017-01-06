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
  let concat = builders.concat([
      builders.mustache('if', [
        builders.path(path),
        ...values.map(v => builders.string(v))
      ])
    ]);
  if (classAttr) {
    let classCol = classAttr.loc.start.column;
    let modifierCol = modifier.loc.start.column;
    if (classCol < modifierCol) {
      concat.parts.unshift(builders.text(' '));
      concat.parts.unshift(classAttr.value);
    } else {
      concat.parts.push(builders.text(' '));
      concat.parts.push(classAttr.value);
    }
    classAttr.value = concat;
  } else {
    classAttr = builders.attr('class', builders.concat([
      builders.mustache('if', [
        builders.path(path),
        ...values.map(v => builders.string(v))
      ])
    ]));
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
