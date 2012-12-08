var fs = require('fs')
  , path = require('path')
  , async = require('async');

var util = {
  pathSep:path.sep || path.join('x', 'x')[1],
  endsWith:function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },
  deleteFile:function (file, recursive, callback) {
    fs.lstat(file, function (err, stats) {
      if (stats.isDirectory()) {
        if (recursive) {
          fs.readdir(file, function (err, childs) {
            (function () {
              var exit = false;
              async.forEach(childs, function (child) {
                if (exit) {
                  return;
                }
                util.deleteFile(path.join(file, child), recursive, function (err) {
                  callback && callback(err);
                });
              }, function (err) {
                callback && callback(err);
                exit = true;
              });
            })();
          });
        } else {
          fs.rmdir(file, function (err) {
            callback && callback(err);
          });
        }
      } else {
        fs.unlink(file, function (err) {
          callback && callback(err);
        });
      }
    });
  },
  deleteDirContent:function (dir, callback) {
    fs.readdir(dir, function (err, childs) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          throw err;
        }
      }
      (function () {
        var errors;
        var done = 0;
        async.forEach(childs, function (child) {
          util.deleteFile(path.join(file, child), true, function (err) {
            if(err){
              errors = errors || [];
              errors.push(err);
            }
            if(++done >= childs.length){
              callback(errors);
            }
          });
        }, function (err) {
          if (err) {
            if (err) {
              if (callback) {
                callback(err);
              } else {
                throw err;
              }
            }
          }
        });
      })();
    });
  }
};

module.exports = util;