import * as fs from 'fs';
import * as path from 'path';
import * as peg from 'pegjs';
import { tags } from './utils/is-self-closing';

const options = {
  NEWLINE_CHAR: '\uEFFF\n',
  RETURN_CHAR: '\uEEFF',
  SPACE_CHAR: '\uEFEE',
  TAB_CHAR: '\uEFFE',
  VOID_CHAR: ' \uEEEF', // the leading space prevents mangling of tag names ie <br/> to <br\uEEEF>
  VOID_TAGS: tags,
};

function read(filePath) {
  return fs.readFileSync(filePath, { encoding: 'utf8' });
}

function escape(template) {
  const pegPath = path.join(__dirname, './preprocessor.pegjs');
  const pegfile = read(pegPath);
  const preprocessor = peg.generate(pegfile);
  return preprocessor.parse(template, options);
}
function unescape(template) {
  const unescaped = template
    .replace(RegExp(options.SPACE_CHAR, 'g'), '\x20')
    .replace(RegExp(options.TAB_CHAR, 'g'), '\x09')
    .replace(RegExp(options.NEWLINE_CHAR, 'g'), '\x0A')
    .replace(RegExp(options.RETURN_CHAR, 'g'), '\x0D')
    .replace(RegExp(options.VOID_CHAR, 'g'), '/');
  return unescaped;
}

export { escape, unescape };
