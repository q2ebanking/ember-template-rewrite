/* eslint no-param-reassign: ["error", { "props": false }]*/
import {
  Walker,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import {
  locSpan,
} from '../utils/location';
import {
  offsetNode,
} from '../utils/node';

function isEachIn(node) {
  const parts = (node.path && node.path.parts) || [];
  const params = node.params || [];
  return node.type === 'BlockStatement' &&
    parts[0] === 'each' &&
    params[1] && params[1].parts[0] === 'in';
}

export default function convertEachIn(ast) {
  const walker = new Walker(ast);

  walker.visit(ast, (node) => {
    if (isEachIn(node)) {
      const item = node.params[0];
      const separator = node.params[1];
      const offset = locSpan({
        start: {
          column: separator.loc.end.column + 1,
          line: separator.loc.end.line,
        },
        end: item.loc.start,
      });
      offsetNode(ast, offset, { recursive: true, startingAt: item.loc.start });
      delete node.params[0]; // item
      delete node.params[1]; // in
      node.program.blockParams = [item.parts[0]];
    }
  });

  return ast;
}
