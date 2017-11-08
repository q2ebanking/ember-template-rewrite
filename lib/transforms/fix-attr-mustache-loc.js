import {
  Walker,
  builders,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

/* eslint no-param-reassign: [0, { "ignorePropertyModificationsFor": ["attr"] }] */
export default function fixAttrMustacheLoc(ast) {
  const walker = new Walker(ast);

  walker.visit(ast, (node) => {
    if (node.type === 'ElementNode') {
      node.attributes.forEach((attr) => {
        const attrLoc = attr.loc;
        const attrStart = attrLoc.start;
        const attrEnd = attrLoc.end;
        let valueLoc = attr.value.loc;
        const { line } = attrStart;
        //     attr="value"
        //     ^  ^^ +1   ^
        // start  length  end
        const column = attrStart.column + attr.name.length + 1;
        if (!valueLoc) {
          valueLoc = builders.loc(line, column, attrEnd.line, attrEnd.column);
        } else if (valueLoc.start.line === null || valueLoc.start.column === null) {
          valueLoc.start.line = line;
          valueLoc.start.column = column;
        }
        attr.value.loc = valueLoc;
      });
    }
  });

  return ast;
}
