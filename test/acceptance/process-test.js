import assert from 'assert-diff';
import process from '../../lib/process';
import path from 'path';
import fs from 'fs';

const fixturePath = path.join(__dirname, '../fixtures');

function read({ formula, scenario, file }) {
  let beforePath = path.join(fixturePath, formula, `${scenario}-before`, file);
  let afterPath = path.join(fixturePath, formula, `${scenario}-after`, file);
  let input = fs.readFileSync(beforePath, { encoding: 'utf8' });
  let output = fs.readFileSync(afterPath, { encoding: 'utf8' });
  return { input, output };
}

describe('Acceptance: process', function() {

  describe('bind-attr', function() {

    let formula = 'bind-attr';

    it('converts static bindings', function() {
      let { input, output } = read({
        formula,
        scenario: 'app-with-static',
        file: 'app/templates/application.hbs'
      });
      let actual = process(input);
      assert.equal(actual, output);
    });
  });
});
