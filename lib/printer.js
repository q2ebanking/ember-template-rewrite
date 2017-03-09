import merge from 'deepmerge';
import { reduce } from 'underscore';
import {
  builders as b
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import isSelfClosing from './utils/is-self-closing';
import escapeHTML from './utils/escape-html';
import whitespaceDiff, {
  locToWhitespace
} from './utils/whitespace-diff';
import {
  sortNodes as sort,
  offsetNode
} from './utils/node';
import {
  locAppend
} from './utils/location';

const defaults = { quotes: { mustache: '"' } };

export default function print(ast, options) {
  options = merge(defaults, options || {});
  let lastLoc = b.loc(1, 0, 1, 0);
  return build(ast, lastLoc, options).output.join('');
}

function build(ast, lastLoc, options) {
  if(!ast) {
    return '';
  }
  let output = [];

  if (ast.loc && !ast.skipInitialWhitespace) {
    output.push(whitespaceDiff(lastLoc, ast.loc));
  }
  if (ast.skipInitialWhitespace) {
    delete ast.skipInitialWhitespace;
  }
  lastLoc = ast.loc || lastLoc;

  switch(ast.type) {
    case 'Program': {
      let chainBlock = ast.chained && ast.body[0];
      if(chainBlock) {
        chainBlock.chained = true;
      }
      let { output: body } = buildEach(ast.body, lastLoc, options);
      output.push(...body);
    }
      break;
    case 'ElementNode': {
      let selfClosing = isSelfClosing(ast.tag);
      let attrNodes = sort(ast.attributes, ast.modifiers, ast.comments);

      output.push('<', ast.tag);

      let loc = lastLoc;
      let tagLength = ast.tag.length;
      let tagLoc = locAppend(loc.start, { column: tagLength + 1 });
      loc = tagLoc;

      if (attrNodes.length) {
        let { output: attrs, lastLoc: attrsLoc } = buildEach(attrNodes, loc, options);
        output.push(...attrs);
        loc = attrsLoc;
      }

      output.push('>');
      loc = locAppend(loc.end, { column: 1 }); // >
      if (!selfClosing) {
        let { output: children, lastLoc: childLoc } = buildEach(ast.children, loc, options);
        output.push(...children);
        output.push('</', ast.tag, '>');
        loc = locAppend(childLoc.end, { column: 3 + ast.tag.length }); // </tag>
        lastLoc = loc;
      }
    }
      break;
    case 'AttrNode': {
      output.push(ast.name, '=');
      let loc = locAppend(lastLoc.start, { column: ast.name.length + 1 });
      let { output: value } = build(ast.value, loc, options);
      if(ast.value.type === 'TextNode') {
        output.push('"', ...value, '"');
      } else {
        output.push(...value);
      }
    }
      break;
    case 'ConcatStatement':
      output.push('"');
      let { output: parts, lastLoc: partsLoc } = buildEach(ast.parts, lastLoc, options);
      output.push(...parts);
      output.push('"');
      lastLoc = b.loc(partsLoc);
      lastLoc.end.column += 1 // "
      break;
    case 'TextNode':
      output.push(escapeHTML(ast.chars));
      break;
    case 'MustacheStatement': {
      let open = ast.escaped ? '{{' : '{{{';
      let close = ast.escaped ? '}}' : '}}}';
      let loc = locAppend(lastLoc.start, { column: open.length }); // {{ or {{{
      let { output: out, lastLoc: pathLoc } = pathParams(ast, loc, options);
      loc = locAppend(pathLoc.end, { column: close.length + 1 }); // }} or }}}

      let whitespace = '';
      if (ast.loc && loc) {
        let lineDiff = ast.loc.end.line - loc.end.line;
        let columnDiff = 0;
        if (lineDiff === 0) {
          columnDiff = ast.loc.end.column - loc.end.column;
        } else if (lineDiff > 0) {
          columnDiff = ast.loc.end.column - 2;
        }
        let offset = {
          start: {
            line: 0,
            column: 0
          },
          end: {
            line: lineDiff,
            column: columnDiff
          }
        };
        whitespace = locToWhitespace(offset);
        if (whitespace) {
          loc = ast.loc;
        }
      }
      output.push(open, ...out, whitespace, close);
      lastLoc = loc;
    }
      break;
    case 'MustacheCommentStatement': {
      let contentLength = ast.value.length;
      let {
        loc: {
          start: { column: start },
          end: { column: end },
        }
      } = ast;
      let nodeLength = end - start;
      let diff = nodeLength - contentLength;
      let open = diff > 5 ? '{{!--' : '{{!';
      let close = diff > 5 ? '--}}' : '}}';
      output.push(open, ast.value, close);
    }
      break;
    case 'ElementModifierStatement': {
      output.push('{{', ...pathParams(ast, lastLoc, options).output, '}}');
    }
      break;
    case 'PathExpression':
      output.push(ast.original);
      break;
    case 'SubExpression': {
      output.push(
        '(', ...pathParams(ast, lastLoc, options).output, ')'
      );
    }
      break;
    case 'BooleanLiteral':
      output.push(ast.value ? 'true' : false);
      break;
    case 'BlockStatement': {
      let { output: open, lastLoc: openLoc } = openBlock(ast, lastLoc, options);
      output.push(...open);
      let loc = openLoc;
      let firstNode = ast.program.body[0];
      if (firstNode) {
        firstNode.skipInitialWhitespace = true;
      }
      let { output: program, lastLoc: progLoc } = build(ast.program, lastLoc, options);
      loc = progLoc;
      output.push(...program);

      if(ast.inverse) {
        if(!ast.inverse.chained){
          output.push('{{else}}');
          loc = locAppend(loc.end, { column: 8 });
        }
        let firstNode = ast.inverse.body[0];
        ast.inverse.skipInitialWhitespace = true;
        if (firstNode) {
          firstNode.skipInitialWhitespace = true;
        }
        let { output: inverse, lastLoc: inverseLoc } = build(ast.inverse, ast.inverse.loc, options);
        output.push(...inverse);
        loc = inverseLoc;
      }

      if(!ast.chained){
        output.push(...closeBlock(ast, lastLoc, options));
      }
    }
      break;
    case 'PartialStatement': {
      let loc = locAppend(lastLoc.start, { column: 3 }); // {{>
      let { output: params } = pathParams(ast, loc, options);
      output.push('{{>', ...params, '}}');
    }
      break;
    case 'CommentStatement': {
      output.push('<!--', ast.value, '-->');
      let { line, column } = lastLoc.end;
      // TODO: multiline comments
      lastLoc = b.loc(line, column, line, column + ast.value.length + 7);
    }
      break;
    case 'StringLiteral': {
      let quote = options.quotes.mustache;
      output.push(quote, ast.value, quote);
    }
      break;
    case 'NumberLiteral': {
      output.push(ast.value);
    }
      break;
    case 'UndefinedLiteral': {
      output.push('undefined');
    }
      break;
    case 'NullLiteral': {
      output.push('null');
    }
      break;
    case 'Hash': {
      let { output: pairs, lastLoc: loc } = buildEach(ast.pairs, lastLoc, options);
      output.push(...pairs);
      lastLoc = loc;
    }
      break;
    case 'HashPair': {
      let { output: value, lastLoc: loc } = build(ast.value, lastLoc, options);
      output.push(ast.key, '=', ...value);
      lastLoc = loc;
    }
      break;
  }
  return { lastLoc, output };
}

function buildEach(asts, lastLoc, options) {
  let output = [];
  asts.forEach(function(node) {
    let { output: out, lastLoc: loc } = build(node, lastLoc, options);
    output.push(...out);
    lastLoc = loc;
  });
  return { lastLoc, output };
}

function pathParams(ast, lastLoc, options) {
  let output = [];
  if (ast.name) {
    let { output: name, lastLoc: nameLoc } = build(ast.name, lastLoc, options);
    output.push(...name);
    lastLoc = nameLoc || lastLoc;
  }
  if (ast.path) {
    let { output: path, lastLoc: pathLoc } = build(ast.path, lastLoc, options);
    output.push(...path);
    lastLoc = pathLoc || lastLoc;
  }
  if (ast.params) {
    let { output: params, lastLoc: paramsLoc } = buildEach(ast.params, lastLoc, options);
    output.push(...params);
    lastLoc = paramsLoc || lastLoc;
  }
  if (ast.hash) {
    let { output: hash, lastLoc: hashLoc } = build(ast.hash, lastLoc, options);
    output.push(...hash);
    lastLoc = hashLoc || lastLoc;
  }
  return { output, lastLoc };
}

function blockParams(block, lastLoc, options) {
  let params = block.program.blockParams;
  if(params.length) {
    let spaced = reduce(params, (acc, p) => acc.concat([p, ' ']), []);
    spaced.splice(-1, 1);
    let length = reduce(spaced, (acc, p) => acc + p.length, 0);
    lastLoc = locAppend(lastLoc.end, { column: length + 5 });
    return { lastLoc, output: [' as |', ...spaced, '|'] };
  } else {
    return { lastLoc, output: [] };
  }
}

function openBlock(block, lastLoc, options) {
  lastLoc = locAppend(lastLoc.start, { column: 3 }); // {{#
  let { output: path, lastLoc: pathLoc } = pathParams(block, lastLoc, options);
  lastLoc = pathLoc;
  let { output: params, lastLoc: paramsLoc } = blockParams(block, lastLoc, options);
  lastLoc = paramsLoc;
  lastLoc = locAppend(lastLoc.end, { column: 2 }); // }}
  return { lastLoc, output: ['{{#', ...path, ...params, '}}'] };
}

function closeBlock(block, lastLoc, options) {
  lastLoc = locAppend(lastLoc.start, { column: 3 }); // {{/
  let { output: path, lastLoc: paramsLoc } = build(block.path, lastLoc, options);
  return ['{{/', ...path, '}}'];
}
