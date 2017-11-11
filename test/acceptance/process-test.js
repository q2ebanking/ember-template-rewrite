import path from 'path';
import fs from 'fs';
import assert from 'assert-diff';
import { describe, it } from 'mocha';
import process from '../../lib/process';

const fixturePath = path.join(__dirname, '../fixtures');

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
        formula,
        scenario: 'app-with-static',
        file: 'app/templates/application.hbs',
      });
      const actual = process(input, { formulas: ['convert-bind-attr'] });
      assert.equal(actual, expected);
    });

    it('converts multiline mustache', () => {
      const { input, output } = read({
        formula,
        scenario: 'app-with-multiline-bind-attr',
        file: 'app/templates/application.hbs',
      });
      const actual = process(input, { formulas: ['convert-bind-attr'] });
      assert.equal(actual, output);
    });
  });

  describe('each-in', () => {
    const formula = 'each-in';

    it('converts each-in with multiline program', () => {
      const { input, output: expected } = read({
        formula,
        scenario: 'app-with-multiline-each-in',
        file: 'app/templates/application.hbs',
      });
      const actual = process(input, { formulas: ['convert-each-in'] });
      assert.equal(actual, expected);
    });
  });
});
