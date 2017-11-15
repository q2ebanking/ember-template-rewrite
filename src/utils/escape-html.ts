/* tslint:disable:object-literal-sort-keys */
const chars = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '\xA0': '&nbsp;',
  '×': '&times;',
};
/* tslint:enable:object-literal-sort-keys */

const regex = new RegExp(`(${Object.keys(chars).join('|')})`, 'g');

export default function escapeHTML(str) {
  return str.replace(regex, (c) => chars[c]);
}
