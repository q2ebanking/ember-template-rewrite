import {
  Walker,
  builders,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

export default function fixAttrMustacheLoc(ast) {
  let walker = new Walker(ast);

  walker.visit(ast, function(node) {
    if (node.type === 'ElementNode') {
      for (let attr of node.attributes) {
        let attrLoc = attr.loc;
        let attrStart = attrLoc.start;
        let attrEnd = attrLoc.end;
        let valueLoc = attr.value.loc;
        let line = attrStart.line;
        //     attr="value"
        //     ^  ^^ +1   ^
        // start  length  end
        let column = attrStart.column + attr.name.length + 1;
        if (!valueLoc) {
          valueLoc = builders.loc(
            line, column, attrEnd.line, attrEnd.column
          );
        } else if (valueLoc.start.line === null || valueLoc.start.column === null) {
          valueLoc.start.line = line;
          valueLoc.start.column = column;
        }
        attr.value.loc = valueLoc;
      }
    }
  });

  return ast;
}
