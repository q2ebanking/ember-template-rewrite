import repeat from './repeat';
import { locsOverlap } from './location';

export default function whitespaceDiff(a, b) {
  const whitespace = [];
  if (!a || !b) {
    throw Error('Must provide two locations to whitespaceDiff');
  }
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

export function locToWhitespace(loc) {
  const whitespace = [];
  if (!loc) {
    throw Error('Must provide a location to locToWhitespace');
  }
  const rowDiff = loc.end.line - loc.start.line;
  whitespace.push(repeat('\n', rowDiff));
  if (rowDiff > 0) {
    whitespace.push(repeat(' ', loc.end.column));
  } else {
    const colDiff = loc.end.column - loc.start.column;
    whitespace.push(repeat(' ', colDiff));
  }
  return whitespace.join('');
}
