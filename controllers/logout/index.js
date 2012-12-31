var path = require('path')
  , wbp = require('wbpjs')
  , config = require(wbp.findAppFile('config.js'));

var controller = {
  'get':function (req, res) {
    req.session.userId = null;
    res.clearCookie('login');
    res.clearCookie('password');
    res.message(__('You are now logged out'));
    res.redirect('/');
  }
};

module.exports = controller;