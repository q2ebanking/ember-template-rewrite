import * as deepmerge from 'deepmerge';
import {
  builders as b,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import { reduce } from 'underscore';
import escapeHTML from './utils/escape-html';
import isSelfClosing from './utils/is-self-closing';
import {
  locAppend,
} from './utils/location';
import {
  sortNodes as sort,
} from './utils/node';
import whitespaceDiff, {
  locToWhitespace,
} from './utils/whitespace-diff';

const defaults = { quotes: { mustache: '"' } };
const merge = deepmerge.default || deepmerge;

export interface IPrintOptions {
  quotes?: {
    mustache: string;
  };
}

export default function print(ast, options: IPrintOptions = {}) {
  const optionsWithDefault = merge(defaults, options);
  const lastLoc = b.loc(1, 0, 1, 0);
  return build(ast, lastLoc, optionsWithDefault).output.join('');
}

function buildEach(asts, lastLoc, options) {
  const output = [];
  asts.forEach((node) => {
    const { output: out, lastLoc: loc } = build(node, lastLoc, options);
    output.push(...out);
    lastLoc = loc;
  });
  return { lastLoc, output };
}

function pathParams(ast, lastLoc, options) {
  const output = [];
  if (ast.name) {
    const { output: name, lastLoc: nameLoc } = build(ast.name, lastLoc, options);
    output.push(...name);
    lastLoc = nameLoc || lastLoc;
  }
  if (ast.path) {
    const { output: path, lastLoc: pathLoc } = build(ast.path, lastLoc, options);
    output.push(...path);
    lastLoc = pathLoc || lastLoc;
  }
  if (ast.params) {
    const { output: params, lastLoc: paramsLoc } = buildEach(ast.params, lastLoc, options);
    output.push(...params);
    lastLoc = paramsLoc || lastLoc;
  }
  if (ast.hash) {
    const { output: hash, lastLoc: hashLoc } = build(ast.hash, lastLoc, options);
    output.push(...hash);
    lastLoc = hashLoc || lastLoc;
  }
  return { output, lastLoc };
}

function blockParams(block, lastLoc, options) {
  const params = (block.program && block.program.blockParams) || {};
  if (params.length) {
    const spaced = reduce(params, (acc, p) => acc.concat([p, ' ']), []);
    spaced.splice(-1, 1);
    const length = reduce(spaced, (acc, p) => acc + p.length, 0);
    lastLoc = locAppend(lastLoc.end, { column: length + 5 });
    return { lastLoc, output: [' as |', ...spaced, '|'] };
  }
  return { lastLoc, output: [] };
}

function openBlock(block, lastLoc, options) {
  lastLoc = locAppend(lastLoc.start, { column: 3 }); // {{#
  const { output: path, lastLoc: pathLoc } = pathParams(block, lastLoc, options);
  lastLoc = pathLoc;
  const { output: params, lastLoc: paramsLoc } = blockParams(block, lastLoc, options);
  lastLoc = paramsLoc;
  lastLoc = locAppend(lastLoc.end, { column: 2 }); // }}
  return { lastLoc, output: ['{{#', ...path, ...params, '}}'] };
}

function closeBlock(block, lastLoc, options) {
  lastLoc = locAppend(lastLoc.start, { column: 3 }); // {{/
  const { output: path } = build(block.path, lastLoc, options);
  return ['{{/', ...path, '}}'];
}

function build(ast, lastLoc, options) {
  if (!ast) {
    return { output: [''], lastLoc };
  }
  const output = [];

  if (ast.loc && !ast.skipInitialWhitespace) {
    output.push(whitespaceDiff(lastLoc, ast.loc));
  }
  if (ast.skipInitialWhitespace) {
    delete ast.skipInitialWhitespace;
  }
  lastLoc = ast.loc || lastLoc;

  switch (ast.type) {
    case 'Program': {
      const chainBlock = ast.chained && ast.body[0];
      if (chainBlock) {
        chainBlock.chained = true;
      }
      const { output: body, lastLoc: programLoc } = buildEach(ast.body, lastLoc, options);
      lastLoc = programLoc;
      output.push(...body);
      break;
    }
    case 'ElementNode': {
      const selfClosing = isSelfClosing(ast.tag);
      const attrNodes = sort(ast.attributes, ast.modifiers, ast.comments);

      output.push('<', ast.tag);

      let loc = lastLoc;
      const tagLength = ast.tag.length;
      const tagLoc = locAppend(loc.start, { column: tagLength + 1 });
      loc = tagLoc;

      if (attrNodes.length) {
        const { output: attrs, lastLoc: attrsLoc } = buildEach(attrNodes, loc, options);
        output.push(...attrs);
        loc = attrsLoc;
      }

      output.push('>');
      loc = locAppend(loc.end, { column: 1 }); // >
      if (!selfClosing) {
        const { output: children, lastLoc: childLoc } = buildEach(ast.children, loc, options);
        output.push(...children);
        output.push('</', ast.tag, '>');
        loc = locAppend(childLoc.end, { column: 3 + ast.tag.length }); // </tag>
        lastLoc = loc;
      }
      break;
    }
    case 'AttrNode': {
      output.push(ast.name, '=');
      const loc = locAppend(lastLoc.start, { column: ast.name.length + 1 });
      const { output: value } = build(ast.value, loc, options);
      if (ast.value.type === 'TextNode') {
        output.push('"', ...value, '"');
      } else {
        output.push(...value);
      }
      break;
    }
    case 'ConcatStatement': {
      output.push('"');
      const { output: parts, lastLoc: partsLoc } = buildEach(ast.parts, lastLoc, options);
      output.push(...parts);
      output.push('"');
      lastLoc = b.loc(partsLoc);
      lastLoc.end.column += 1; // "
      break;
    }
    case 'TextNode':
      output.push(escapeHTML(ast.chars));
      break;
    case 'MustacheStatement': {
      const open = ast.escaped ? '{{' : '{{{';
      const close = ast.escaped ? '}}' : '}}}';
      let loc = locAppend(lastLoc.start, { column: open.length }); // {{ or {{{
      const { output: out, lastLoc: pathLoc } = pathParams(ast, loc, options);
      loc = locAppend(pathLoc.end, { column: close.length + 1 }); // }} or }}}

      let whitespace = '';
      if (ast.loc && loc) {
        const lineDiff = ast.loc.end.line - loc.end.line;
        let columnDiff = 0;
        if (lineDiff === 0) {
          columnDiff = ast.loc.end.column - loc.end.column;
        } else if (lineDiff > 0) {
          columnDiff = ast.loc.end.column - 2;
        }
        const offset = {
          end: {
            column: columnDiff,
            line: lineDiff,
          },
          start: {
            column: 0,
            line: 0,
          },
        };
        whitespace = locToWhitespace(offset);
        if (whitespace) {
          loc = ast.loc;
        }
      }
      output.push(open, ...out, whitespace, close);
      lastLoc = loc;
      break;
    }
    case 'MustacheCommentStatement': {
      const contentLength = ast.value.length;
      const {
        loc: {
          start: { column: start },
          end: { column: end },
        },
      } = ast;
      const nodeLength = end - start;
      const diff = nodeLength - contentLength;
      const open = diff > 5 ? '{{!--' : '{{!';
      const close = diff > 5 ? '--}}' : '}}';
      output.push(open, ast.value, close);
      break;
    }
    case 'ElementModifierStatement':
      output.push('{{', ...pathParams(ast, lastLoc, options).output, '}}');
      break;
    case 'PathExpression':
      output.push(ast.original);
      break;
    case 'SubExpression':
      output.push('(', ...pathParams(ast, lastLoc, options).output, ')');
      break;
    case 'BooleanLiteral':
      output.push(ast.value ? 'true' : false);
      break;
    case 'BlockStatement': {
      const { output: open } = openBlock(ast, lastLoc, options);
      output.push(...open);
      const [firstBodyNode] = ast.program.body;
      if (firstBodyNode) {
        firstBodyNode.skipInitialWhitespace = true;
      }
      const { output: program } = build(ast.program, lastLoc, options);
      output.push(...program);

      if (ast.inverse) {
        if (!ast.inverse.chained) {
          output.push('{{else}}');
        }
        const [firstInverseNode] = ast.inverse.body;
        ast.inverse.skipInitialWhitespace = true;
        if (firstInverseNode) {
          firstInverseNode.skipInitialWhitespace = true;
        }
        const {
          output: inverse,
        } = build(ast.inverse, ast.inverse.loc, options);
        output.push(...inverse);
      }

      if (!ast.chained) {
        output.push(...closeBlock(ast, lastLoc, options));
      }
      break;
    }
    case 'PartialStatement': {
      const loc = locAppend(lastLoc.start, { column: 3 }); // {{>
      const { output: params } = pathParams(ast, loc, options);
      output.push('{{>', ...params, '}}');
      break;
    }
    case 'CommentStatement': {
      output.push('<!--', ast.value, '-->');
      const { line, column } = lastLoc.end;
      // TODO: multiline comments
      lastLoc = b.loc(line, column, line, column + ast.value.length + 7);
      break;
    }
    case 'StringLiteral': {
      const quote = options.quotes.mustache;
      output.push(quote, ast.value, quote);
      break;
    }
    case 'NumberLiteral':
      output.push(ast.value);
      break;
    case 'UndefinedLiteral':
      output.push('undefined');
      break;
    case 'NullLiteral':
      output.push('null');
      break;
    case 'Hash': {
      const { output: pairs, lastLoc: loc } = buildEach(ast.pairs, lastLoc, options);
      output.push(...pairs);
      lastLoc = loc;
      break;
    }
    case 'HashPair': {
      const { output: value, lastLoc: loc } = build(ast.value, lastLoc, options);
      output.push(ast.key, '=', ...value);
      lastLoc = loc;
    }
    // no default
  }
  return { lastLoc, output };
}
