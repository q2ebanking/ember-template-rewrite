import _ from 'underscore';

function sort(nodes) {
  nodes = _.clone(nodes);
  return nodes.sort((a, b) => {
    let lineDiff = a.loc.start.line - b.loc.start.line;
    let colDiff = a.loc.start.column - b.loc.start.column;
    return lineDiff === 0 && colDiff > 0 || lineDiff > 0;
  });
}

export { sort };
