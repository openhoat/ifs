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
    if(login === 'admin' && crypto.hash(pwd) === config.adminPasswordHash){
      req.session.userId = 'admin';
      res.message(__('Welcome %s!', req.session.userId));
      res.redirect('/');
    } else {
      res.message(__('Bad login/pwd'));
      res.redirect('back');
    }
  }
};

module.exports = controller;