export default function (char, n) {
  const type = typeof (n);
  if (n <= 0) {
    return '';
  }
  return Array(n + 1).join(char);
}
