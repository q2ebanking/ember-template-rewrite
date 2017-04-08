export function get(obj, key) {
  if (key.indexOf('.') !== -1) {
    const path = key.split('.');
    return path.reduce((obj, key) => obj[key], obj);
  }
  return obj[key];
}
