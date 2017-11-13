export default function(char, n) {
  if (n <= 0) {
    return '';
  }
  return Array(n + 1).join(char);
}
