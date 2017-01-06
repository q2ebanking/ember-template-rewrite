import { preprocess as _parse, Walker } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function parse(source) {
  return _parse(source);
}

function append(node) {
  let source = [];
  if (node.type === 'Program') {
    for (let i = 0; i < node.body.length; i++) {
      let el = node.body[i];
      Array.prototype.push.apply(source, append(el));
    }
  }
  if (node.type === 'ElementNode') {
    source.push(`<${node.tag}>`)
    for (let i = 0; i < node.children.length; i++) {
      Array.prototype.push.apply(source, append(node.children[i]));
    }
    source.push(`</${node.tag}>`)
  }
  if (node.type === 'TextNode') {
    source.push(node.chars);
  }
  return source;
}

function compile(ast) {
  let walker = new Walker(ast);
  let source = [];
  walker.visit(ast, function(node) {
    if (node.type === 'Program') {
      Array.prototype.push.apply(source, append(node));
    }
  });
  return source.join('');
}

export { parse, compile };
