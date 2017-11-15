import { locsOverlap, posAfter, IPosition, ILocation } from './location';
import repeat from './repeat';

export default function whitespaceDiff(a: ILocation, b: ILocation): string {
  const whitespace = [];
  if (locsOverlap(a, b)) {
    return '';
  }
  const rowDiff = b.start.line - a.end.line;
  whitespace.push(repeat('\n', rowDiff));
  if (rowDiff > 0) {
    whitespace.push(repeat(' ', b.start.column));
  } else {
    const colDiff = b.start.column - a.end.column;
    whitespace.push(repeat(' ', colDiff));
  }
  return whitespace.join('');
}

export function whitespacePosDiff(a: IPosition, b: IPosition): string {
  const whitespace = [];
  if (posAfter(a, b)) {
    return '';
  }
  const rowDiff = b.line - a.line;
  whitespace.push(repeat('\n', rowDiff));
  if (rowDiff > 0) {
    whitespace.push(repeat(' ', b.column));
  } else {
    const colDiff = b.column - a.column;
    whitespace.push(repeat(' ', colDiff));
  }
  return whitespace.join('');
}
