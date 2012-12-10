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
  'login': function(req, res, login, pwdHash){
    for(var i = 0; i < config.users.length; i++) {
      var user = config.users[i];
      if(login === user.login && pwdHash === user.pwdHash){
        req.session.userId = login;
        res.cookie('login', login, { signed: true });
        res.cookie('password', pwdHash, { signed: true });
        res.message(__('Welcome %s!', req.session.userId));
        return true;
      }
    }
    return false;
  },
  'post':function (req, res) {
    var login = req.body['login']
      , pwdHash = crypto.hash(req.body['pwd']);
    if(controller.login(req, res, login, pwdHash)){
      res.redirect('/');
    } else {
      res.message(__('Bad login/pwd'));
      res.redirect('back');
    }
  }
};

module.exports = controller;