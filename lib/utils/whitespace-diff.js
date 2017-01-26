import repeat from './repeat';

export default function whitespaceDiff(a, b) {
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
