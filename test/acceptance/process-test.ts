import * as assert from 'assert-diff';
import * as fs from 'fs';
import * as path from 'path';

import process from 'ember-template-rewrite/process';

/* tslint:disable-next-line:no-string-literal */
const fixturePath: string = global['fixturePath'];

function read({ formula, scenario, file }) {
  const beforePath = path.join(fixturePath, formula, `${scenario}-before`, file);
  const afterPath = path.join(fixturePath, formula, `${scenario}-after`, file);
  const input = fs.readFileSync(beforePath, { encoding: 'utf8' });
  const output = fs.readFileSync(afterPath, { encoding: 'utf8' });
  return { input, output };
}

describe('Acceptance: process', () => {
  describe('bind-attr', () => {
    const formula = 'bind-attr';

    it('converts static bindings', () => {
      const { input, output: expected } = read({
        file: 'app/templates/application.hbs',
        formula,
        scenario: 'app-with-static',
      });
      const actual = process(input, { formulas: ['convert-bind-attr'] });
      assert.equal(actual, expected);
    });

    it('converts multiline mustache', () => {
      const { input, output } = read({
        file: 'app/templates/application.hbs',
        formula,
        scenario: 'app-with-multiline-bind-attr',
      });
      const actual = process(input, { formulas: ['convert-bind-attr'] });
      assert.equal(actual, output);
    });
  });

  describe('each-in', () => {
    const formula = 'each-in';

    it('converts each-in with multiline program', () => {
      const { input, output: expected } = read({
        file: 'app/templates/application.hbs',
        formula,
        scenario: 'app-with-multiline-each-in',
      });
      const actual = process(input, { formulas: ['convert-each-in'] });
      assert.equal(actual, expected);
    });
  });
});
