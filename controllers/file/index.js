var config = require('../../config.js')
  , fs = require('fs')
  , path = require('path')
  , wbp = require('wbpjs')
  , Acl = require('acl')
  , pathSep = path.sep || path.join('x', 'x')[1]
  , downloadPath = config.publicDir + pathSep + 'download' + pathSep;

//var verbose = config.options && config.options.verbose;

var acl = new Acl(new Acl.memoryBackend());

acl.allow('admin', 'files', ['list', 'delete'], function(err){
  if(err) { throw err; }
});
acl.addUserRoles('admin', 'admin', function(err){
  if(err) { throw err; }
});

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

var controller = {
  'index':function (req, res) {
    var view = wbp.getWebView(req, 'file/new');
    res.render(view);
  },
  'list':function (req, res, next) {
    acl.isAllowed(req.session.userId || 'guest', 'files', 'list', function(err, allowed){
        if (err){
          next(new Error('Error checking permissions to access resource'));
        }
        if(!allowed){
          wbp.render(res, function (type) {
            res.status(403);
            if (type === 'html') {
              res.render('403.' + type, {
                title:'Error', url:req.originalUrl
              });
            } else {
              res.send();
            }
          });
          return;
        }
      var files = [];
      fs.readdirSync(downloadPath).forEach(function(fileName){
        if (endsWith(fileName, '.json')) {
          var infoFile = downloadPath + pathSep + fileName
            , file = JSON.parse(fs.readFileSync(infoFile, 'utf-8'));
          files.push(file);
        }
      });
      wbp.render(res, function (type) {
        var view = wbp.getWebView(req, 'file/list', type);
        res.render(view, {
          files:files
        });
      });
    });
  },
  'show':function (req, res) {
    var fileId = req.params['file_id']
      , localFileParentPath = downloadPath + fileId
      , fileName = fs.readdirSync(localFileParentPath)[0]
      , file = JSON.parse(fs.readFileSync(localFileParentPath + '.json'));
    wbp.render(res, function (type) {
      var view = wbp.getWebView(req, 'file/show', type);
      res.render(view, {
        file:file
      });
    });
  },
  'post':function (req, res) {
    var reqFile=req.files.file
      , file = {
          id: path.basename(reqFile.path)
        , name: reqFile.name
        , type:reqFile.type
        , size:reqFile.size
        , lastModifiedDate:reqFile.lastModifiedDate
      }
      , localFileParentPath = downloadPath + file.id
      , localFilePath = localFileParentPath + pathSep + file.name
      , localFileInfoPath = localFileParentPath + '.json';
    if(file.size < 1){
      wbp.render(res, function (type) {
        res.status(400);
        if (type === 'html') {
          res.render('400.' + type, {
            title:'Error', url:req.originalUrl
          });
        } else {
          res.send();
        }
      });
      return;
    }
    fs.mkdirSync(localFileParentPath);
    fs.readFile(req.files.file.path, function (err, data) {
      fs.writeFile(localFilePath, data, 'utf-8', function (err) {
        var fileInfo = JSON.stringify(file);
        fs.writeFile(localFileInfoPath, fileInfo, function (err) {
          res.message('Your file has been successfully uploaded, to download it later, copy the link to your clipboard');
          res.redirect('/file/' + file.id);
        });
      });
    });
  },
  'remove':function (req, res) {
    var fileId = req.params['file_id']
      , localFileParentPath = downloadPath + fileId;
    fs.readdirSync(localFileParentPath).forEach(function(fileName){
      var localFilePath = localFileParentPath + pathSep + fileName;
      fs.unlinkSync(localFilePath);
    });
    fs.rmdirSync(localFileParentPath);
    fs.unlinkSync(localFileParentPath + '.json');
    wbp.render(res, function (type) {
      if (type === 'html') {
        res.message('File ' + fileId + ' has been successfully removed!');
        res.redirect('/');
      } else {
        res.status(204);
        res.send();
      }
    });
  },
  'clear':function (req, res, next) {
    acl.isAllowed(req.session.userId || 'guest', 'files', 'delete', function(err, allowed){
      if (err){
        next(new Error('Error checking permissions to access resource'));
      }
      if(!allowed){
        wbp.render(res, function (type) {
          res.status(403);
          if (type === 'html') {
            res.render('403.' + type, {
              title:'Error', url:req.originalUrl
            });
          } else {
            res.send();
          }
        });
        return;
      }
      fs.readdirSync(downloadPath).forEach(function(fileId){
        var localFileParentPath = downloadPath + fileId
          , stats = fs.lstatSync(localFileParentPath);
        if (!stats.isDirectory()) {
          fs.unlinkSync(localFileParentPath);
          return;
        }
        fs.readdirSync(localFileParentPath).forEach(function(fileName){
          var localFilePath = localFileParentPath + pathSep + fileName;
          fs.unlinkSync(localFilePath);
        });
        fs.rmdirSync(localFileParentPath);
      });
      wbp.render(res, function (type) {
        if (type === 'html') {
          res.message('All uploaded files have been removed!');
          res.redirect('/');
        } else {
          res.status(204);
          res.send();
        }
      });
    });
  }
};

module.exports = controller;
