const selfClosing = [
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
  'wbr'
];

export default function isSelfClosing(tag) {
  return selfClosing.indexOf(tag) !== -1;
};
