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
  let value = pair.value.value.split(':');
  attributes.push(builders.attr('class', builders.concat([
    builders.mustache('if', [
      builders.path(value[0]),
      builders.string(value[1]),
      builders.string(value[2])
    ])
  ])));
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
