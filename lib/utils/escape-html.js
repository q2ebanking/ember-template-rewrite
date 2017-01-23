const chars = {
  '&':    '&amp;',
  '<':    '&lt;',
  '>':    '&gt;',
  '"':    '&quot;',
  "'":    '&#39;',
  '\xA0': '&nbsp;',
  '×':    '&times;',
};

const regex = new RegExp(`(${Object.keys(chars).join('|')})`, ['g']);

export default function escapeHTML(str) {
  return str.replace(regex, function(c) {
    return chars[c];
  });
}
