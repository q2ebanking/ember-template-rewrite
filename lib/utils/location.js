import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function locDiff(a, b) {
  return builders.loc(
    b.start.line   - a.start.line,
    b.start.column - a.start.column,
    b.end.line     - a.end.line,
    b.end.column   - a.end.column
  );
}

function locOffset(a, b) {
  return {
    column: b.start.column - a.end.column,
    line: b.start.line - a.end.line
  };
}

function locAppend(startOrEnd, offset) {
  return builders.loc(
    startOrEnd.line,
    startOrEnd.column,
    startOrEnd.line + (offset.line || 0),
    startOrEnd.column + (offset.column || 0)
  );
}

function locEndAppend(loc, offset) {
  return builders.loc(
    loc.end.line,
    loc.end.column,
    loc.end.line + offset.line,
    loc.end.column + offset.column
  );
}

export {
  locDiff,
  locOffset,
  locAppend
};
