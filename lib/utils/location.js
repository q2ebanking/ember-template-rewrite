import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

function addOffsets(a, b) {
  return {
    column: a.column + b.column,
    line: a.line + b.line
  };
}

// Start point diff and end point diff
// Useful to tell how a new location
// varies from old loation
function locDiff(a, b) {
  return builders.loc(
    b.start.line   - a.start.line,
    b.start.column - a.start.column,
    b.end.line     - a.end.line,
    b.end.column   - a.end.column
  );
}

function locAdd(a, b) {
  return builders.loc(
    b.start.line   + a.start.line,
    b.start.column + a.start.column,
    b.end.line     + a.end.line,
    b.end.column   + a.end.column
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

function locStartsAfter(a, b) {
  return posAfter(a.start, b);
}

function locEndsAfter(a, b) {
  return posAfter(a.end, b);
}

function posAfter(a, b) {
  let lineDiff = a.line - b.line;
  let colDiff = a.column - b.column;
  return lineDiff === 0 ? colDiff > 0 : lineDiff > 0;
}

function posBefore(a, b) {
  let lineDiff = a.line - b.line;
  let colDiff = a.column - b.column;
  return lineDiff === 0 ? colDiff < 0 : lineDiff < 0;
}

function locContains(a, b) {
  let startCol = a.start.column;
  let endCol = a.end.column;
  let { column } = b;
  let lineDiff = a.start.line - b.line;
  return lineDiff === 0 && startCol < column && endCol >= column;
}

function locsOverlap(a, b) {
  return locContains(a, b.start) ||
         locContains(a, b.end) ||
         locsEqual(a, b);
}

function locSpan(loc) {
  return {
    line: loc.end.line - loc.start.line,
    column: loc.end.column - loc.start.column
  };
}

function locsEqual(a, b) {
  return a.start.line === b.start.line &&
         a.start.column === b.start.column &&
         a.end.line === b.end.line &&
         a.end.column === b.end.column;
}

export {
  locDiff,
  locAdd,
  locOffset,
  locAppend,
  locStartsAfter,
  locEndsAfter,
  posAfter,
  posBefore,
  locContains,
  locSpan,
  addOffsets,
  locsOverlap
};
