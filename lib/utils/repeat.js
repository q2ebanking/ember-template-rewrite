export default function(char, n) {
  let type = typeof(n);
  if (n <= 0) {
    return '';
  }
  // if (type === 'undefined' || n <= 0 || isNaN(n)) {
  //   // TODO: raise exception
  //   return '';
  // }
  return Array(n + 1).join(char);
}
