import * as deepmerge from 'deepmerge';
import { reduce } from 'underscore';
import escapeHTML from './utils/escape-html';
import isSelfClosing from './utils/is-self-closing';
import {
  posAppend,
  IPosition,
} from './utils/location';
import {
  sortNodes as sort,
} from './utils/node';
import {
  whitespacePosDiff,
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
  const cursor: IPosition = { line: 1, column: 0 };
  return build(ast, cursor, optionsWithDefault).output.join('');
}

function buildEach(asts, cursor: IPosition, options) {
  const output = [];
  asts.forEach((node) => {
    const { output: out, cursor: eachCursor } = build(node, cursor, options);
    output.push(...out);
    cursor = eachCursor;
  });
  return { cursor, output };
}

function pathParams(ast, cursor, options) {
  const output = [];
  if (ast.name) {
    const { output: name, cursor: nameCursor } = build(ast.name, cursor, options);
    output.push(...name);
    cursor = nameCursor || cursor;
  }
  if (ast.path) {
    const { output: path, cursor: pathCursor } = build(ast.path, cursor, options);
    output.push(...path);
    cursor = pathCursor || cursor;
  }
  if (ast.params) {
    const { output: params, cursor: paramsCursor } = buildEach(ast.params, cursor, options);
    output.push(...params);
    cursor = paramsCursor || cursor;
  }
  if (ast.hash) {
    const { output: hash, cursor: hashCursor } = build(ast.hash, cursor, options);
    output.push(...hash);
    cursor = hashCursor || cursor;
  }
  return { output, cursor };
}

function blockParams(block, cursor: IPosition) {
  const params = (block.program && block.program.blockParams) || {};
  if (params.length) {
    const spaced = reduce(params, (acc, p) => acc.concat([p, ' ']), []);
    spaced.splice(-1, 1);
    const length = reduce(spaced, (acc, p) => acc + p.length, 0);
    cursor = posAppend(cursor, { column: length + 6 });
    return { cursor, output: [' as |', ...spaced, '|'] };
  }
  return { cursor, output: [] };
}

function openBlock(block, cursor: IPosition, options) {
  cursor = posAppend(cursor, { column: 3 }); // {{#
  const { output: path, cursor: pathCursor } = pathParams(block, cursor, options);
  cursor = pathCursor;
  const { output: params, cursor: paramsCursor } = blockParams(block, cursor);
  cursor = paramsCursor;
  const output = ['{{#', ...path, ...params];

  if (block.program.body.length) {
    const firstChildStart = block.program.body[0].loc.start;
    const toBeforeCurlies = {
      column: firstChildStart.column - 2,
      line: firstChildStart.line,
    };
    const whitespace = whitespacePosDiff(cursor, toBeforeCurlies);
    output.push(whitespace);
    cursor = firstChildStart;
  } else {
    cursor = posAppend(cursor, { column: 2 }); // }}
  }
  output.push('}}');

  return { cursor, output };
}

function closeBlock(block, cursor: IPosition, options) {
  cursor = posAppend(cursor, { column: 3 }); // {{/
  const { output: path } = build(block.path, cursor, options);
  cursor = posAppend(cursor, { column: path.join('').length + 3 }); // path}}
  return { cursor, output: ['{{/', ...path, '}}'] };
}

function build(ast, cursor: IPosition, options) {
  if (!ast) {
    return { output: [''], cursor };
  }
  const output = [];

  if (ast.loc && ast.loc.start) {
    const whitespace = whitespacePosDiff(cursor, ast.loc.start);
    cursor = ast.loc.start;
    output.push(whitespace);
  }

  switch (ast.type) {
    case 'Program': {
      const { output: body, cursor: programCursor } = buildEach(ast.body, cursor, options);
      cursor = programCursor;
      output.push(...body);
      break;
    }

    case 'ElementNode': {
      const selfClosing = isSelfClosing(ast.tag);
      const attrNodes = sort(ast.attributes, ast.modifiers, ast.comments);

      output.push('<', ast.tag);
      cursor = posAppend(cursor, { column: ast.tag.length + 1 });

      if (attrNodes.length) {
        const { output: attrs, cursor: attrsCursor } = buildEach(attrNodes, cursor, options);
        output.push(...attrs);
        cursor = attrsCursor;
      }

      output.push('>');
      cursor = posAppend(cursor, { column: 1 }); // >
      if (!selfClosing) {
        const { output: children, cursor: childCursor } = buildEach(ast.children, cursor, options);
        output.push(...children);
        output.push('</', ast.tag, '>');
        cursor = posAppend(childCursor, { column: 3 + ast.tag.length }); // </tag>
      }
      break;
    }

    case 'AttrNode': {
      output.push(ast.name, '=');
      cursor = posAppend(cursor, { column: ast.name.length + 1 });
      if (ast.value.type === 'TextNode') {
        ast.value.quotes = true;
      }
      const { output: valueOutput, cursor: attrCursor } = build(ast.value, cursor, options);
      cursor = attrCursor;
      output.push(...valueOutput);
      break;
    }

    case 'ConcatStatement': {
      output.push('"');
      cursor = posAppend(cursor, { column: 1 });
      const { output: parts, cursor: partsCursor } = buildEach(ast.parts, cursor, options);
      output.push(...parts);
      cursor = posAppend(cursor, { column: 1 });
      output.push('"');
      cursor = partsCursor;
      cursor.column += 1; // "
      break;
    }

    case 'TextNode': {
      if (ast.quotes) {
        output.push('"', escapeHTML(ast.chars), '"');
        cursor = posAppend(cursor, { column: ast.chars.length + 2 });
      } else {
        output.push(escapeHTML(ast.chars));
        cursor = posAppend(cursor, { column: ast.chars.length });
      }
      if (ast.loc) {
        cursor = ast.loc.end;
      }
      break;
    }

    case 'MustacheStatement': {

      const open = ast.escaped ? '{{' : '{{{';
      const close = ast.escaped ? '}}' : '}}}';
      cursor = posAppend(cursor, { column: open.length }); // {{ or {{{

      const { output: out, cursor: pathCursor } = pathParams(ast, cursor, options);
      output.push(open, ...out);
      cursor = pathCursor;

      if (ast.loc) {
        const contentEnd = {
          column: ast.loc.end.column - close.length,
          line: ast.loc.end.line,
        };

        const whitespace = whitespacePosDiff(cursor, contentEnd);
        cursor = ast.loc.end;
        output.push(whitespace);
      }
      output.push(close);

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
      cursor = posAppend(cursor, { column: open.length + ast.value.length + close.length });
      break;
    }

    case 'ElementModifierStatement': {
      cursor = posAppend(cursor, { column: 2 }); // {{
      const { output: pathParamsOutput, cursor: pathCursor } = pathParams(ast, cursor, options);
      output.push('{{', ...pathParamsOutput, '}}');
      cursor = posAppend(pathCursor, { column: 2 }); // }}
      break;
    }

    case 'PathExpression': {
      output.push(ast.original);
      cursor = posAppend(cursor, { column: ast.original.length });
      break;
    }

    case 'SubExpression': {
      cursor = posAppend(cursor, { column: 1 }); // (
      const { output: pathOutput, cursor: pathCursor } = pathParams(ast, cursor, options);
      output.push('(', ...pathOutput, ')');
      cursor = posAppend(pathCursor, { column: 1 }); // )
      break;
    }

    case 'BooleanLiteral':
      const value = ast.value ? 'true' : 'false';
      output.push(value);
      cursor = posAppend(cursor, { column: value.length });
      break;
    case 'BlockStatement': {
      const { output: open, cursor: openCursor } = openBlock(ast, cursor, options);
      output.push(...open);
      cursor = openCursor;

      const { output: body, cursor: programCursor } = buildEach(ast.program.body, cursor, options);
      cursor = programCursor;
      output.push(...body);

      if (ast.inverse) {
        const firstNode = ast.inverse.body[0];
        const onlyOneNode = ast.inverse.body.length === 1;

        if (firstNode.type === 'BlockStatement' && firstNode.path.original === 'if' && onlyOneNode) {
          const elseBlock = '{{else';
          const elseBlockClose = '}}';
          output.push(elseBlock);
          cursor = posAppend(cursor, { column: elseBlock.length });

          const { output: elseIfOutput, cursor: elseIfCursor } = pathParams(firstNode, cursor, options);

          output.push(...elseIfOutput);
          output.push(elseBlockClose);
          cursor = posAppend(elseIfCursor, { column: elseBlockClose.length });

          const { output: inverse, cursor: inverseCursor } = buildEach(firstNode.program.body, cursor, options);
          output.push(...inverse);
          cursor = inverseCursor;
        } else {
          const elseBlock = '{{else}}';
          output.push(elseBlock);
          cursor = posAppend(cursor, { column: elseBlock.length });

          const { output: inverse, cursor: inverseCursor } = buildEach(ast.inverse.body, cursor, options);
          output.push(...inverse);
          cursor = inverseCursor;
        }
      }

      const { output: closeOutput, cursor: closeCursor } = closeBlock(ast, cursor, options);
      output.push(...closeOutput);
      cursor = closeCursor;

      break;
    }
    case 'PartialStatement': {
      cursor = posAppend(cursor, { column: 3 }); // {{>
      const { output: params, cursor: partialCursor } = pathParams(ast, cursor, options);
      cursor = posAppend(partialCursor, { column: 2 }); // }}
      output.push('{{>', ...params, '}}');
      break;
    }
    case 'CommentStatement': {
      output.push('<!--', ast.value, '-->');
      // TODO: multiline comments
      cursor = posAppend(cursor, { column: ast.value.length + 7 });
      break;
    }
    case 'StringLiteral': {
      const quote = options.quotes.mustache;
      output.push(quote, ast.value, quote);
      cursor = posAppend(cursor, { column: 2 * quote.length + ast.value.length });
      break;
    }
    case 'NumberLiteral':
      output.push(ast.value);
      cursor = posAppend(cursor, { column: (ast.value + '').length });
      break;
    case 'UndefinedLiteral':
      output.push('undefined');
      cursor = posAppend(cursor, { column: 'undefined'.length });
      break;
    case 'NullLiteral':
      output.push('null');
      cursor = posAppend(cursor, { column: 'null'.length });
      break;
    case 'Hash': {
      const { output: pairs, cursor: hashCursor } = buildEach(ast.pairs, cursor, options);
      output.push(...pairs);
      cursor = hashCursor;
      break;
    }
    case 'HashPair': {
      cursor = posAppend(cursor, { column: ast.key.length + 1 }); // key=
      const {
        output: hashPairOut,
        cursor: hashPairCursor,
      } = build(ast.value, cursor, options);
      output.push(ast.key, '=', ...hashPairOut);
      cursor = posAppend(hashPairCursor, {
        column: ast.key.length + 1 + hashPairOut.join('').length,
      });
    }
    // no default
  }

  if (ast.loc && ast.loc.end) {
    const whitespace = whitespacePosDiff(cursor, ast.loc.end);
    cursor = ast.loc.end;
    output.push(whitespace);
  }

  return { cursor, output };
}
