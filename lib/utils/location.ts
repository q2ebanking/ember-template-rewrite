import { builders } from 'glimmer-engine/dist/node_modules/glimmer-syntax';

export interface IPosition {
  line: number;
  column: number;
}

export interface IPositionOptional {
  line?: number;
  column?: number;
}

export interface ILocation {
  start: IPosition;
  end: IPosition;
}

function addOffsets(a: IPosition, b: IPosition): IPosition {
  return {
    column: a.column + b.column,
    line: a.line + b.line,
  };
}

// Start point diff and end point diff
// Useful to tell how a new location
// varies from old loation
function locDiff(a: ILocation, b: ILocation): ILocation {
  return builders.loc(
    b.start.line - a.start.line,
    b.start.column - a.start.column,
    b.end.line - a.end.line,
    b.end.column - a.end.column,
  );
}

function locAdd(a: ILocation, b: ILocation): ILocation {
  return builders.loc(
    b.start.line + a.start.line,
    b.start.column + a.start.column,
    b.end.line + a.end.line,
    b.end.column + a.end.column,
  );
}

function locOffset(a: ILocation, b: ILocation): IPosition {
  return {
    column: b.start.column - a.end.column,
    line: b.start.line - a.end.line,
  };
}

function locAppend(startOrEnd: IPosition, offset: IPositionOptional): ILocation {
  return builders.loc(
    startOrEnd.line,
    startOrEnd.column,
    startOrEnd.line + (offset.line || 0),
    startOrEnd.column + (offset.column || 0),
  );
}

function posAppend(startOrEnd: IPosition, offset: IPositionOptional): IPosition {
  return {
    column: startOrEnd.column + (offset.column || 0),
    line: startOrEnd.line + (offset.line || 0),
  };
}

function locStartsAfter(a: ILocation, b: IPosition): boolean {
  return posAfter(a.start, b);
}

function locEndsAfter(a: ILocation, b: IPosition): boolean {
  return posAfter(a.end, b);
}

function posAfter(a: IPosition, b: IPosition): boolean {
  const lineDiff = a.line - b.line;
  const colDiff = a.column - b.column;
  return lineDiff === 0 ? colDiff > 0 : lineDiff > 0;
}

function posBefore(a: IPosition, b: IPosition): boolean {
  const lineDiff = a.line - b.line;
  const colDiff = a.column - b.column;
  return lineDiff === 0 ? colDiff < 0 : lineDiff < 0;
}

function locContains(a: ILocation, b: IPosition): boolean {
  const startCol = a.start.column;
  const endCol = a.end.column;
  const { column } = b;
  const lineDiff = a.start.line - b.line;
  return lineDiff === 0 && startCol < column && endCol >= column;
}

function locsEqual(a: ILocation, b: ILocation): boolean {
  return a.start.line === b.start.line &&
         a.start.column === b.start.column &&
         a.end.line === b.end.line &&
         a.end.column === b.end.column;
}

function locsOverlap(a: ILocation, b: ILocation): boolean {
  return locContains(a, b.start) ||
         locContains(a, b.end) ||
         locsEqual(a, b);
}

function locSpan(loc: ILocation): IPosition {
  return {
    column: loc.end.column - loc.start.column,
    line: loc.end.line - loc.start.line,
  };
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
  locsOverlap,
  posAppend,
};
