export default function(char: string, n: number): string {
  if (n <= 0 || Number.isNaN(n) || !Number.isFinite(n)) {
    return '';
  }
  return Array(n + 1).join(char);
}
