var path = require('path')
  , config = require(path.join(__dirname, 'config.js'))
  , wbp = require('wbpjs');

wbp.start(config);
