var config = require('../../config.js')
  , wbp = require('wbpjs')
  , crypto = require(config.baseDir + '/lib/crypto.js');

var controller = {
  'get':function (req, res) {
    wbp.render(res, function (type) {
      var view = wbp.getWebView(req, 'login/index', type);
      res.render(view);
    });
  },
  'post':function (req, res) {
    var login = req.body['login']
      , pwd = req.body['pwd'];
    if(login === 'admin' && crypto.hash(pwd) === 'HaVO1xr1nSa2dXcnuQ+QQ0XHpB0='){
      req.session.userId = 'admin';
      res.message('Welcome ' + req.session.userId + '!');
      res.redirect('/');
    } else {
      res.message('Bad login/pwd');
      res.redirect('back');
    }
  }
};

module.exports = controller;