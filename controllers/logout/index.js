var config = require('../../config.js')
  , wbp = require('wbpjs');

var controller = {
  'get':function (req, res) {
    req.session.userId = null;
    res.message('You are now logged out');
    res.redirect('/');
  }
};

module.exports = controller;