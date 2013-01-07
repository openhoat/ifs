var path = require('path')
  , fs = require('fs')
  , wbp = require('wbpjs')
  , config = wbp.requireAppFile('config');

wbp.configure(config);

var downloadPath = path.join(wbp.findPlugin('mvc').config.publicDir, 'download')
if (!fs.existsSync(downloadPath)) {
  wbp.util.mkdirp(downloadPath);
}

wbp.start();
