import repeat from './utils/repeat';
import compact from './utils/compact';
import isSelfClosing from './utils/is-self-closing';
import escapeHTML from './utils/escape-html';
import merge from 'deepmerge';

function log(obj) {
  console.log(JSON.stringify(obj, null, 2));
}

const defaults = { quotes: { mustache: '"' } };

export default function print(ast, options) {
  options = merge(defaults, options || {});
  return build(ast, null, options);
}

function build(ast, lastLoc, options) {
  if(!ast) {
    return '';
  }
  let output = [];

  if (lastLoc && ast.loc) {
    output.push(whitespaceDiff(lastLoc, ast.loc));
  }

  switch(ast.type) {
    case 'Program': {
      let chainBlock = ast.chained && ast.body[0];
      if(chainBlock) {
        chainBlock.chained = true;
      }
      let body = buildEach(ast.body, lastLoc, options).join('');
      output.push(body);
    }
      break;
    case 'ElementNode':
      let selfClosing = isSelfClosing(ast.tag);
      output.push('<', ast.tag);
      if(ast.attributes.length) {
        output.push(
          ' ',
          buildEach(ast.attributes, lastLoc, options).join('')
        );
      }
      if(ast.modifiers.length) {
        output.push(
          ' ',
          buildEach(ast.modifiers, lastLoc, options).join('')
        );
      }
      if(ast.comments.length) {
        output.push(
          ' ', buildEach(ast.comments, lastLoc, options).join(' ')
        );
      }
      if (selfClosing) {
        output.push(' />');
      } else {
        output.push('>');
        output.push.apply(
          output, buildEach(ast.children, null, options)
        );
        output.push('</', ast.tag, '>');
      }
      break;
    case 'AttrNode':
      output.push(ast.name, '=');
      let value = build(ast.value, null, options);
      if(ast.value.type === 'TextNode') {
        output.push('"', value, '"');
      } else {
        output.push(value);
      }
      break;
    case 'ConcatStatement':
      output.push('"');
      ast.parts.forEach(function(node) {
        if(node.type === 'StringLiteral') {
          output.push(node.original);
        } else {
          output.push(build(node, lastLoc, options));
        }
      });
      output.push('"');
      break;
    case 'TextNode':
      output.push(escapeHTML(ast.chars));
      break;
    case 'MustacheStatement': {
      let open = ast.escaped ? '{{' : '{{{';
      let close = ast.escaped ? '}}' : '}}}';
      output.push(compactJoin([
        open, pathParams(ast, lastLoc, options), close
      ]));
    }
      break;
    case 'MustacheCommentStatement': {
      output.push(compactJoin(['{{!--', ast.value, '--}}']));
    }
      break;
    case 'ElementModifierStatement': {
      output.push(compactJoin([
        '{{', pathParams(ast, lastLoc, options), '}}'
      ]));
    }
      break;
    case 'PathExpression':
      output.push(ast.original);
      break;
    case 'SubExpression': {
      output.push(
        '(', pathParams(ast, lastLoc, options), ')'
      );
    }
      break;
    case 'BooleanLiteral':
      output.push(ast.value ? 'true' : false);
      break;
    case 'BlockStatement': {
      let lines = [];

      if(ast.chained){
        lines.push([
          '{{else ', pathParams(ast, lastLoc, options), '}}'
        ].join(''));
      }else{
        lines.push(openBlock(ast, lastLoc, options));
      }
      lines.push(build(ast.program, null, options));

      if(ast.inverse) {
        if(!ast.inverse.chained){
          lines.push('{{else}}');
        }
        lines.push(build(ast.inverse, lastLoc, options));
      }

      if(!ast.chained){
        lines.push(closeBlock(ast));
      }

      output.push(lines.join(''));
    }
      break;
    case 'PartialStatement': {
      output.push(compactJoin([
        '{{>', pathParams(ast, lastLoc, options), '}}'
      ]));
    }
      break;
    case 'CommentStatement': {
      output.push(compactJoin(['<!--', ast.value, '-->']));
    }
      break;
    case 'StringLiteral': {
      let quote = options.quotes.mustache;
      output.push(`${quote}${ast.value}${quote}`);
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
      lastLoc = null;
      // TODO - use buildEach
      output.push(ast.pairs.map(function(pair) {
        let out = build(pair, lastLoc, options);
        lastLoc = pair.loc;
        return out;
      }).join(''));
    }
      break;
    case 'HashPair': {
      output.push(
        `${ast.key}=${build(ast.value, lastLoc, options)}`
      );
    }
      break;
  }
  return output.join('');
}

function whitespaceDiff(a, b) {
  let whitespace = [];
  if (!a || !b) {
    return '';
  }
  let rowDiff = b.start.line - a.end.line;
  whitespace.push(repeat('\n', rowDiff));
  if (rowDiff > 0) {
    whitespace.push(repeat(' ', b.start.column));
  } else {
    let colDiff = b.start.column - a.end.column;
    whitespace.push(repeat(' ', colDiff));
  }
  return whitespace.join('');
}

function buildEach(asts, lastLoc, options) {
  let output = [];
  asts.forEach(function(node) {
    output.push(build(node, lastLoc, options));
    lastLoc = node.loc;
  });
  return output;
}

function pathParams(ast, lastLoc, options) {
  let output = [];
  let name = build(ast.name, lastLoc, options);
  output.push(name);
  if (ast.name) {
    lastLoc = ast.name.loc;
  }
  let path = build(ast.path, lastLoc, options);
  output.push(path);
  if (ast.path) {
    lastLoc = ast.path && ast.path.loc;
  }
  let params = buildEach(ast.params, lastLoc, options);
  if (lastLoc) {
    params = params.join('');
  } else {
    params = params.join(' ');
  }
  if (!lastLoc && params && params.length > 0) {
    output.push(' ');
  }
  output.push(params);
  if (ast.params && ast.params.length > 0) {
    lastLoc = ast.params[ast.params.length - 1].loc;
  }
  let hash = build(ast.hash, lastLoc, options);
  output.push(hash);
  return compactJoin(output).trim();
}

function compactJoin(array, delimiter) {
  return compact(array).join(delimiter || '');
}

function blockParams(block) {
  let params = block.program.blockParams;
  if(params.length) {
    return ` as |${params.join(' ')}|`;
  }
}

function leadingWhitespace(nodes) {
  let whitespace = [];
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i];
    if (node.type === 'TextNode') {
      whitespace.push(node.chars);
    } else {
      break;
    }
  }
  return whitespace;
}

function trailingWhitespace(nodes) {
  let whitespace = [];
  for (let i = nodes.length - 1; i >= 0; i--) {
    let node = nodes[i];
    if (node.type === 'TextNode') {
      whitespace.unshift(node.chars);
    } else {
      break;
    }
  }
  return whitespace;
}

function openBlock(block, lastLoc, options) {
  return [
    '{{#', pathParams(block, lastLoc, options),
          blockParams(block, lastLoc, options), '}}',
  ].join('');
}

function closeBlock(block, lastLoc, options) {
  return [
    '{{/', build(block.path, lastLoc, options), '}}',
  ].join('');
}
