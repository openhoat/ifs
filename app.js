/*jshint laxcomma:true*/

var config = require('./config.js')
  , wbp = require('wbpjs')
  , fs = require('fs')
  , path = require('path');

var verbose = config.options && config.options.verbose;

wbp.configure(config);

function localeMiddleware(req, res, next) {
  res.locals.currentUri = req._parsedUrl.pathname;
  res.locals.defaultLang = wbp.i18n.getLocale(req);
  res.locals.availableLangs = config.locales;
  var preferredLang = req.query.lang;
  if(preferredLang !== undefined){
    req.session.preferredLang = preferredLang === 'default' && null || preferredLang;
  }
  if(req.session && req.session.preferredLang){
    wbp.i18n.setLocale(req, req.session.preferredLang);
  }
  res.locals.preferredLang = wbp.i18n.getLocale(req);
  next();
}

function loginMiddleware(req, res, next) {
  var login = req.signedCookies.login
    , pwdHash = req.signedCookies.password;
  res.locals.isLogged = req.session && req.session.userId;
  if(login !== undefined && pwdHash !== undefined && res.locals.isLogged === undefined) {
    if(require('./controllers/login').login(req, res, login, pwdHash)){
      res.redirect('/');
    } else {
      res.clearCookie('login');
      res.clearCookie('password');
      next();
    }
  } else {
    next();
  }
}

wbp.init([
  localeMiddleware,
  loginMiddleware
]);

wbp.start();
