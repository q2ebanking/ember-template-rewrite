import { preprocess } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function parseAst(source) {
  return preprocess(source);
}

export { parseAst };
