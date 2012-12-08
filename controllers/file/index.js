var config = require('../../config.js')
  , fs = require('fs')
  , path = require('path')
  , wbp = require('wbpjs')
  , async = require('async')
  , cron = require('cron')
  , util = require(config.baseDir + '/lib/util.js')
  , Acl = require('acl')
  , downloadPath = path.join(config.publicDir, 'download');

var verbose = config.options && config.options.verbose;

var acl = new Acl(new Acl.memoryBackend());

acl.allow('admin', 'files', ['list', 'delete'], function(err){
  if(err) { throw err; }
});
acl.addUserRoles('admin', 'admin', function(err){
  if(err) { throw err; }
});

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
      var render = function(){
        wbp.render(res, function (type) {
          var view = wbp.getWebView(req, 'file/list', type);
          res.render(view, {
            files:files
          });
        });
      };
      fs.readdir(downloadPath, function(err, fileNames){
        if(err) { next(err); return; }
        var infoFiles = [];
        var readInfoFiles = function(){
          var done = 0;
          for(var i = 0; i < infoFiles.length; i++){
            fs.readFile(infoFile, 'utf-8', function(err, data){
              if(err) { next(err); return; }
              var file = JSON.parse(data);
              files.push(file);
              if (++done >= infoFiles.length){
                render();
              }
            });
          }
        }
        if(fileNames.length > 0) {
          var done = 0;
          for(var i = 0; i < fileNames.length; i++) {
            var fileName = fileNames[i];
            if (endsWith(fileName, '.json')) {
              var infoFile = path.join(downloadPath, fileName);
              infoFiles.push(infoFile);
            }
            if (++done >= fileNames.length){
              if(infoFiles.length > 0) {
                readInfoFiles();
              } else {
                render();
              }
            }
          }
        } else {
          render();
        }
      });
    });
  },
  'show':function (req, res, next) {
    var fileId = req.params['file_id']
      , localFileParentPath = downloadPath + fileId;
    fs.readdir(localFileParentPath, function(err, fileNames){
      if(err) { next({message: 'not found'}); return; }
      var fileName = fileNames[0];
      fs.readFile(localFileParentPath + '.json', function(err, data){
        if(err) { next(err); return; }
        var file = JSON.parse(data);
        wbp.render(res, function (type) {
          var view = wbp.getWebView(req, 'file/show', type);
          res.render(view, {
            file:file
          });
        });
      });
    });
  },
  'post':function (req, res, next) {
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
    var purgeDate = new Date(file.lastModifiedDate);
    purgeDate.setHours(purgeDate.getHours() + config.localFileAge);
    var cronJob = new cron.CronJob(purgeDate, function(){
      purgeLocalFile(file.id);
    });
    cronJob.start();
    fs.mkdir(localFileParentPath, function(err){
      if(err) { next(err); return; }
      fs.readFile(req.files.file.path, function (err, data) {
        if(err) { next(err); return; }
        fs.writeFile(localFilePath, data, 'utf-8', function (err) {
          if(err) { next(err); return; }
          var fileInfo = JSON.stringify(file);
          fs.writeFile(localFileInfoPath, fileInfo, function (err) {
            if(err) { next(err); return; }
            res.message('Your file will be stored until ' + purgeDate + ', to download it later, copy the link to your clipboard');
            res.redirect('/file/' + file.id);
          });
        });
      });
    });
  },
  'remove':function (req, res, next) {
    var fileId = req.params['file_id'];
    purgeLocalFile(fileId, function(err){
      if(err) { next(err); return; }
      wbp.render(res, function (type) {
        if (type === 'html') {
          res.message('File ' + fileId + ' has been successfully removed!');
          res.redirect('/');
        } else {
          res.status(204);
          res.send();
        }
      });
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
      var render = function(){
        wbp.render(res, function (type) {
          if (type === 'html') {
            res.message('All uploaded files have been removed!');
            res.redirect('/');
          } else {
            res.status(204);
            res.send();
          }
        });
      };
      var fileIds = [];
      fs.readdir(downloadPath, function(err, fileNames){
        if(err) { next(err); return; }
        if(fileNames.length > 0){
          var done = 0;
          async.forEach(fileNames, function(fileName){
            verbose && console.log('done :', done);
            if (!endsWith(fileName, '.json')) {
              verbose && console.log('adding file id :', fileName);
              fileIds.push(fileName);
            }
            if(++done >= fileNames.length){
              verbose && console.log('done :', done);
              if(fileIds.length > 0) {
                var done = 0;
                async.forEach(fileIds, function(fileId){
                  purgeLocalFile(fileId, function(err){
                    if(err) { next(err); return; }
                    if(++done >= fileIds.length){
                      render();
                    }
                  });
                }, function(err){
                  if(err) { next(err); return; }
                });
              } else {
                render();
              }
            }
          }, function(err){
            if(err) { next(err); return; }
          });
        } else {
          render();
        }
      });
    });
  }
};

module.exports = controller;
