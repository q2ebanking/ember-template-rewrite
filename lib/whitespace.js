import peg from 'pegjs';
import fs from 'fs';
import path from 'path';

const options = {
  SPACE_CHAR: '\uEFEE',
  TAB_CHAR: '\uEFFE',
  NEWLINE_CHAR: '\uEFFF\n',
  RETURN_CHAR: '\uEEFF',
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
    .replace(RegExp(options.SPACE_CHAR, ['g']), '\x20')
    .replace(RegExp(options.TAB_CHAR, ['g']), '\x09')
    .replace(RegExp(options.NEWLINE_CHAR, ['g']), '\x0A')
    .replace(RegExp(options.RETURN_CHAR, ['g']), '\x0D');
  return unescaped;
}

export { escape, unescape };

