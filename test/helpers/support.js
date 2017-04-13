export function get(obj, key) {
  if (key.indexOf('.') !== -1) {
    const path = key.split('.');
    return path.reduce((o, k) => o[k], obj);
  }
  return obj[key];
}

export default { get };
