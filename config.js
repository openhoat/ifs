var path = require('path')
  , Acl = require('acl')
  , baseDir = __dirname;

// Feel free to match your settings
var config = {
  port:3003,
  baseDir:baseDir,
  controllersDir:path.join(baseDir, 'controllers'),
  viewsDir:path.join(baseDir, 'views'),
  lesscssDir:path.join(baseDir, 'lesscss'),
  publicDir:path.join(baseDir, 'public'),
  cssDir:path.join(baseDir, 'public', 'css'),
  mobileViewSufix:null,
  renderFormats:['html', 'json'],
  locales:['en', 'fr'],
  storedFilesAge:24 * 7, // stored files will be stored for a week, after they will be purged
  users:[
    {login:'admin', pwdHash:'0DPiKuNIrrVmD8IUCuw1hQxNqZc=' }
  ],
  // Feel free to change to your password hash, here it matches 'admin'
  // To get your hash use : require(config.baseDir + '/lib/crypto.js').hash('mypassword')
  acl:new Acl(new Acl.memoryBackend()),
  options:{
    verbose:false
  }
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
