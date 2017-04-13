import assert from 'assert-diff';
import merge from 'deepmerge';

function includeDeepMembers(actual, expected) {
  const fullExpected = merge(actual, expected);
  assert.deepEqual(actual, fullExpected);
}

assert.includeDeepMembers = assert.includeDeepMembers || includeDeepMembers;

export default assert;
