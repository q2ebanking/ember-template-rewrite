export const tags = [
  'area',
  'base',
  'br',
  'col',
  'command',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'meta',
  'param',
  'path',
  'source',
  'track',
  'wbr',
];

export default function isSelfClosing(tag) {
  return tags.indexOf(tag) !== -1;
}
