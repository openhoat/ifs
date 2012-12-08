/*jshint laxcomma:true*/

var config = require('./config.js')
  , wbp = require('wbpjs')
  , crypto = require('crypto');

wbp.configure(config);
wbp.create();

wbp.init(function (req, res, next) {
  res.locals.isLogged = req.session && req.session.userId;
  next();
});

wbp.start();