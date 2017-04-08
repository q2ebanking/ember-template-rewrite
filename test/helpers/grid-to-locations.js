import _ from 'underscore';

export default function gridToLocations(grid) {
  const nodes = [];
  let column = 0;
  let line = 0;
  let read = false;
  for (const char of grid) {
    const name = char;
    if (read && char === ' ') {
      column++;
    } else if (char === '\n') {
      line++;
      column = 0;
      read = false;
    } else if (char === '|') {
      read = !read;
    } else if (read) {
      const loc = {
        start: { column, line },
        end: { column, line },
      };
      nodes.push({ name: char, loc });
      column++;
    }
  }
  const a = [1, 2, 3];
  return _.shuffle(nodes);
}

