import { describe, it } from 'mocha';
import {
  builders as b,
} from 'glimmer-engine/dist/node_modules/glimmer-syntax';
import assert from '../helpers/assert';
import {
  locDiff,
  posAfter,
  posBefore,
} from '../../lib/utils/location';

describe('Unit: locDiff', () => {
  describe('on the same line', () => {
    it('returns loc that is difference between the inputs', () => {
      const locA = b.loc(1, 30, 1, 33);
      const locB = b.loc(1, 30, 1, 39);
      const actual = locDiff(locA, locB);
      const expected = b.loc(0, 0, 0, 6);
      assert.deepEqual(actual, expected);
    });
  });

  describe('spanning multiple lines', () => {
    it('returns loc that is difference between the inputs', () => {
      const locA = b.loc(1, 30, 1, 33);
      const locB = b.loc(1, 30, 2, 39);
      const actual = locDiff(locA, locB);
      const expected = b.loc(0, 0, 1, 6);
      assert.deepEqual(actual, expected);
    });
  });
});

describe('Unit: posAfter', () => {
  describe('on the same line', () => {
    it('returns true for higher column', () => {
      const locA = b.loc(1, 30, 1, 39);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', () => {
      const locA = b.loc(1, 30, 1, 38);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', () => {
      const locA = b.loc(1, 30, 1, 37);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });
  });

  describe('on higher line', () => {
    it('returns true for higher column', () => {
      const locA = b.loc(1, 30, 2, 39);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', () => {
      const locA = b.loc(1, 30, 2, 38);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', () => {
      const locA = b.loc(1, 30, 2, 37);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe('on lower line', () => {
    it('returns false for higher column', () => {
      const locA = b.loc(1, 30, 1, 39);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', () => {
      const locA = b.loc(1, 30, 1, 38);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', () => {
      const locA = b.loc(1, 30, 1, 37);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posAfter(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });
  });
});

describe('Unit: posBefore', () => {
  describe('on the same line', () => {
    it('returns false for higher column', () => {
      const locA = b.loc(1, 30, 1, 39);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', () => {
      const locA = b.loc(1, 30, 1, 38);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns true for lower column', () => {
      const locA = b.loc(1, 30, 1, 37);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });
  });

  describe('on higher line', () => {
    it('returns false for higher column', () => {
      const locA = b.loc(1, 30, 2, 39);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for same column', () => {
      const locA = b.loc(1, 30, 2, 38);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });

    it('returns false for lower column', () => {
      const locA = b.loc(1, 30, 2, 37);
      const locB = b.loc(1, 30, 1, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = false;
      assert.equal(actual, expected);
    });
  });

  describe('on lower line', () => {
    it('returns true for higher column', () => {
      const locA = b.loc(1, 30, 1, 39);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for same column', () => {
      const locA = b.loc(1, 30, 1, 38);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });

    it('returns true for lower column', () => {
      const locA = b.loc(1, 30, 1, 37);
      const locB = b.loc(1, 30, 2, 38);
      const actual = posBefore(locA.end, locB.end);
      const expected = true;
      assert.equal(actual, expected);
    });
  });
});
