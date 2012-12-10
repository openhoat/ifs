/*jshint laxcomma:true*/

var config = require('./config.js')
  , wbp = require('wbpjs')
  , fs = require('fs')
  , path = require('path')
  , i18n = require('i18n');

var verbose = config.options && config.options.verbose;

i18n.configure({
  locales:config.locales,
  register:global,
  updateFiles:false
});

wbp.configure(config);
wbp.create();

wbp.app.locals({
  __i:i18n.__,
  __n:i18n.__n
});

function localeMiddleware(req, res, next) {
  res.locals.currentUri = req._parsedUrl.pathname;
  res.locals.defaultLang = i18n.getLocale();
  res.locals.availableLangs = config.locales;
  var preferredLang = req.query['lang'];
  if(preferredLang !== undefined){
    req.session.preferredLang = preferredLang === 'default' && null || preferredLang;
  }
  if(req.session && req.session.preferredLang){
    i18n.setLocale(req.session.preferredLang);
  }
  res.locals.preferredLang = i18n.getLocale();
  next();
}

function loginMiddleware(req, res, next) {
  var login = req.signedCookies.login;
  var pwdHash = req.signedCookies.password;
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
  i18n.init,
  localeMiddleware,
  loginMiddleware
]);

wbp.start();
