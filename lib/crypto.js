var crypto = require('crypto');

module.exports = {
  hash:function (s) {
    var shasum = crypto.createHash('sha1');
    shasum.update(s);
    return shasum.digest('base64');
  }
};
