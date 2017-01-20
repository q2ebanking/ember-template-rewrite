export default function(char, n) {
  if (typeof(n) === 'undefined' || n <= 0) {
    return '';
  }
  return Array(n + 1).join(char);
}
