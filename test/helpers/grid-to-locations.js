import _ from 'underscore';

export default function gridToLocations(grid) {
  const nodes = [];
  let column = 0;
  let line = 0;
  let read = false;
  [...grid].forEach((char) => {
    if (read && char === ' ') {
      column += 1;
    } else if (char === '\n') {
      line += 1;
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
      column += 1;
    }
  });
  return _.shuffle(nodes);
}

