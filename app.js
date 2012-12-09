/*jshint laxcomma:true*/

var config = require('./config.js')
  , wbp = require('wbpjs')
  , fs = require('fs')
  , path = require('path');

var verbose = config.options && config.options.verbose;

wbp.configure(config);
wbp.create();

wbp.init(function (req, res, next) {
  res.locals.isLogged = req.session && req.session.userId;
  req.session.userId = 'admin';
  next();
});

wbp.start();
