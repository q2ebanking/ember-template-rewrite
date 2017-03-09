import assert from '../helpers/assert';
import {
  locDiff,
  posAfter,
  posBefore
} from '../../lib/utils/location';
import {
  builders as b
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';

describe('Unit: locDiff', function() {
  describe('on the same line', function() {
    it('returns loc that is difference between the inputs', function() {
      let locA = b.loc(1, 30, 1, 33);
      let locB = b.loc(1, 30, 1, 39);
      let actual = locDiff(locA, locB);
      let expected = b.loc(0, 0, 0, 6);
      assert.deepEqual(actual, expected);
    });
  });

  describe('spanning multiple lines', function() {
    it('returns loc that is difference between the inputs', function() {
      let locA = b.loc(1, 30, 1, 33);
      let locB = b.loc(1, 30, 2, 39);
      let actual = locDiff(locA, locB);
      let expected = b.loc(0, 0, 1, 6);
      assert.deepEqual(actual, expected);
    });
  });
});

describe('Unit: posAfter', function() {
  describe('on the same line', function() {
    it('returns true for higher column', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', function() {
      let locA = b.loc(1, 30, 1, 38);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', function() {
      let locA = b.loc(1, 30, 1, 37);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });
  });

  describe('on higher line', function() {
    it('returns true for higher column', function() {
      let locA = b.loc(1, 30, 2, 39);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', function() {
      let locA = b.loc(1, 30, 2, 38);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', function() {
      let locA = b.loc(1, 30, 2, 37);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });
  });

  describe('on lower line', function() {
    it('returns false for higher column', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', function() {
      let locA = b.loc(1, 30, 1, 38);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', function() {
      let locA = b.loc(1, 30, 1, 37);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posAfter(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });
  });
});

describe('Unit: posBefore', function() {
  describe('on the same line', function() {
    it('returns false for higher column', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', function() {
      let locA = b.loc(1, 30, 1, 38);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns true for lower column', function() {
      let locA = b.loc(1, 30, 1, 37);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });
  });

  describe('on higher line', function() {
    it('returns false for higher column', function() {
      let locA = b.loc(1, 30, 2, 39);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', function() {
      let locA = b.loc(1, 30, 2, 38);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', function() {
      let locA = b.loc(1, 30, 2, 37);
      let locB = b.loc(1, 30, 1, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = false;
      assert.equal(actual, expected);
    });
  });

  describe('on lower line', function() {
    it('returns true for higher column', function() {
      let locA = b.loc(1, 30, 1, 39);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', function() {
      let locA = b.loc(1, 30, 1, 38);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for lower column', function() {
      let locA = b.loc(1, 30, 1, 37);
      let locB = b.loc(1, 30, 2, 38);
      let actual = posBefore(locA.end, locB.end);
      let expected = true;
      assert.equal(actual, expected);
    });
  });
});
