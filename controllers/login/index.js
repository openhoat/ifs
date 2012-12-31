var path = require('path')
  , wbp = require('wbpjs')
  , config = require(wbp.findAppFile('config.js'))
  , util = wbp.util
  , mvcPlugin = wbp.findPlugin('wbpjs-mvc')
  , viewsPlugin = mvcPlugin.viewsPlugin;

var controller = {
  'get':function (req, res) {
    viewsPlugin.render(res, function (type) {
      var view = viewsPlugin.getWebView(req, 'login/index', type);
      res.render(view);
    });
  },
  'login':function (req, res, login, pwdHash) {
    for (var i = 0; i < config.users.length; i++) {
      var user = config.users[i];
      if (login === user.login && pwdHash === user.pwdHash) {
        req.session.userId = login;
        res.cookie('login', login, { signed:true });
        res.cookie('password', pwdHash, { signed:true });
        res.message(__('Welcome %s!', req.session.userId));
        return true;
      }
    }
    return false;
  },
  'post':function (req, res) {
    var login = req.body['login']
      , pwdHash = util.hash(req.body['pwd']);
    if (controller.login(req, res, login, pwdHash)) {
      res.redirect('/');
    } else {
      res.message(__('Bad login/pwd'));
      res.redirect('back');
    }
  }
};

module.exports = controller;