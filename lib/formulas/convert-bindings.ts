import {
  builders,
  Walker,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import {
  offsetNode,
} from '../utils/node';

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
          const offset = {
            column: -'Binding'.length - 2, // 2 = quotes
            line: 0,
          };
          const start = {
            column:  p.loc.start.column + p.key.length,
            line: p.loc.start.line,
          };
          offsetNode(ast, offset, { recursive: true, startingAt: start });
        }
      });
    }
  });

  return ast;
}
