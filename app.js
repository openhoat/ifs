var path = require('path')
  , fs = require('fs')
  , config = require(path.join(__dirname, 'config.js'))
  , wbp = require('wbpjs');

wbp.configure(config);

var mvcPlugin = wbp.findPlugin('wbpjs-mvc');
var downloadPath = path.join(mvcPlugin.config.publicDir, 'download')
if (!fs.existsSync(downloadPath)) {
  wbp.util.mkdirp(downloadPath);
}

wbp.start();
