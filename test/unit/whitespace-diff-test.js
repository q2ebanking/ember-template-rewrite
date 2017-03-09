import assert from '../helpers/assert';
import repeat from '../../lib/utils/repeat';
import whitespaceDiff, {
  locToWhitespace
} from '../../lib/utils/whitespace-diff';
import {
  builders as b
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

describe('Unit: whitespaceDiff', function() {
  describe('with overlap', function() {
    it('on same line', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 1, 32);
      let actual = whitespaceDiff(locA, locB);
      let expected = '';
      assert.equal(actual, expected);
    });

    it('spanning multiple lines', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 2, 32);
      let actual = whitespaceDiff(locA, locB);
      let expected = '';
      assert.equal(actual, expected);
    });
  });

  describe('with no gap', function() {
    it('on same line', function() {
      let locA = b.loc(1, 53, 1, 39);
      let locB = b.loc(1, 39, 1, 45);
      let actual = whitespaceDiff(locA, locB);
      let expected = '';
      assert.equal(actual, expected);
    });

    it('spanning multiple lines', function() {
      let locA = b.loc(1, 30, 2, 39);
      let locB = b.loc(2, 39, 3, 32);
      let actual = whitespaceDiff(locA, locB);
      let expected = '';
      assert.equal(actual, expected);
    });
  });

  describe('with no overlap', function() {
    it('on same line', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 45, 1, 50);
      let actual = whitespaceDiff(locA, locB);
      let expected = repeat(' ', 6);
      assert.equal(actual, expected);
    });

    it('spanning multiple lines', function() {
      let locA = b.loc(1, 5, 2, 10);
      let locB = b.loc(3, 15, 4, 3);
      let actual = whitespaceDiff(locA, locB);
      let expected = '\n' + repeat(' ', 15);
      assert.equal(actual, expected);
    });
  });
});

describe('Unit: locToWhitespace', function() {
  describe('with overlap', function() {
    it('on same line', function() {
      let loc = b.loc(1, 3, 3, 4);
      let actual = locToWhitespace(loc);
      let expected = '\n\n' + repeat(' ', 4);
      assert.equal(actual, expected);
    });
  });
});
