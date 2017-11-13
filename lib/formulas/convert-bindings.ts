import {
  builders,
  Walker,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function isBinding(node) {
  return node.key.match(/Binding$/);
}

function isClassBinding(node) {
  return node.key.match(/^classBinding$/);
}

export default function convertEachIn(ast) {
  const walker = new Walker(ast);

  walker.visit(ast, (node) => {
    if (node.type === 'MustacheStatement') {
      node.hash.pairs.forEach((p) => {
        if (isBinding(p) && !isClassBinding(p)) {
          p.key = p.key.replace(/Binding$/, '');
          p.value = builders.path(p.value.value);
        }
      });
    }
  });

  return ast;
}
