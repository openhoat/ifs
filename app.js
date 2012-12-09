/*jshint laxcomma:true*/

var config = require('./config.js')
  , wbp = require('wbpjs')
  , fs = require('fs')
  , path = require('path')
  , i18n = require('i18n');

var verbose = config.options && config.options.verbose;

i18n.configure({
  locales:['en', 'fr'],
  register:global,
  updateFiles:true
});

wbp.configure(config);
wbp.create();

wbp.app.locals({
  __i:i18n.__,
  __n:i18n.__n
});

wbp.init([
  i18n.init,
  function (req, res, next) {
    res.locals.isLogged = req.session && req.session.userId;
    next();
  }
]);

wbp.start();
