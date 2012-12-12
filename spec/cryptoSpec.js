/**
 * util Unit Test
 */

var crypto = require('../lib/crypto.js');

describe('hash', function () {
  it('should return "0DPiKuNIrrVmD8IUCuw1hQxNqZc=" for "admin"', function () {
    var result = crypto.hash('admin');
    expect(result).toEqual('0DPiKuNIrrVmD8IUCuw1hQxNqZc=');
  });
});