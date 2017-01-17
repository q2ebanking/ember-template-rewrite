import assert from 'assert-diff';
import merge from 'deepmerge';

assert.includeDeepMembers = assert.includeDeepMembers || function(actual, expected) {
  expected = merge(actual, expected);
  assert.deepEqual(actual, expected);
};

export default assert;
