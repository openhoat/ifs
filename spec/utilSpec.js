/**
 * util Unit Test
 */

var util = require('../lib/util.js');

describe('endsWith', function () {
  it('should return true for abc ends with bc', function () {
    var result = util.endsWith('abc', 'bc');
    expect(result).toBe(true);
  });
  it('should return false for abc ends with a', function () {
    var result = util.endsWith('abc', 'a');
    expect(result).toBe(false);
  });
});