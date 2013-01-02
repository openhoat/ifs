var path = require('path')
  , wbp = require('wbpjs')
  , Acl = require('acl');

function loginMiddleware(req, res, next) {
  var login = req.signedCookies.login
    , pwdHash = req.signedCookies.password;
  res.locals.isLogged = req.session && req.session.userId;
  if (login !== undefined && pwdHash !== undefined && res.locals.isLogged === undefined) {
    if (require(wbp.findAppFile('controllers', 'login')).login(req, res, login, pwdHash)) {
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

var config = {
  plugins:{
    'wbpjs-mvc':{
      type:'wbpjs-mvc',
      config:{
        port:3003,
        renderFormats:['html', 'json'],
        locales:['en', 'fr'],
        useLocalMiddleWare:true,
        beforeMiddlewares:[ loginMiddleware ]
      }
    }
  },
  storedFilesAge:24 * 7, // stored files will be stored for a week, after they will be purged
  users:[
    {login:'admin', pwdHash:'0DPiKuNIrrVmD8IUCuw1hQxNqZc=' }
  ],
  // Feel free to change to your password hash, here it matches 'admin'
  // To get your hash use : require(config.baseDir + '/lib/crypto.js').hash('mypassword')
  acl:new Acl(new Acl.memoryBackend())
};

config.acl.allow('admin', 'files', ['list', 'delete'], function (err) {
  if (err) {
    throw err;
  }
});
config.acl.addUserRoles('admin', 'admin', function (err) {
  if (err) {
    throw err;
  }
});

module.exports = config;
