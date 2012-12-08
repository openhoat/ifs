var path = require('path')
  , baseDir = __dirname;

// Feel free to match your settings
var config = {
  port           :3000,
  baseDir        :baseDir,
  controllersDir :path.join(baseDir, 'controllers'),
  viewsDir       :path.join(baseDir, 'views'),
  lesscssDir     :path.join(baseDir, 'lesscss'),
  publicDir      :path.join(baseDir, 'public'),
  cssDir         :path.join(baseDir, 'public', 'css'),
  mobileViewSufix:null,
  renderFormats  :['html', 'json'],
  options        :{
    verbose:true
  },
  localFileAge: 48, // local files will be stored for 48 hours, after they will be purged
  adminPasswordHash: 'HaVO1xr1nSa2dXcnuQ+QQ0XHpB0='
  // Feel free to change to your password hash
  // To get your hash use : require(config.baseDir + '/lib/crypto.js').hash('mypassword')
};

module.exports = config;
