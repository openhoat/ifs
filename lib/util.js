var config = require('../config.js')
  , fs = require('fs')
  , path = require('path')
  , async = require('async');

// var verbose = config.options && config.options.verbose;

var util = {
  endsWith:function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },
  deleteDir: fs.rmdir,
  deleteFile:function (file, recursive, callback) {
    callback = callback || (function() {});
    fs.lstat(file, function (err, stats) {
      if (err) {
        callback(err);
        return;
      }
      if (stats.isDirectory()) {
        if (recursive) {
          fs.readdir(file, function (err, childs) {
            if (err) {
              callback(err);
              return;
            }
            if (childs.length > 0) {
                var errors;
                var done = 0;
                async.forEach(childs, function (child) {
                  util.deleteFile(path.join(file, child), true, function (err) {
                    if (err) {
                      errors = errors || [];
                      errors.push(err);
                    }
                    if (++done >= childs.length) {
                      if (errors && errors.length > 0) {
                        callback(errors);
                        return;
                      }
                      util.deleteDir(file, callback);
                    }
                  });
                }, callback);
            } else {
              util.deleteDir(file, callback);
            }
          });
        } else {
          util.deleteDir(file, callback);
        }
      } else {
        fs.unlink(file, callback);
      }
    });
  },
  deleteDirContent:function (dir, callback) {
    callback = callback || (function() {});
    fs.readdir(dir, function (err, childs) {
      if (err) {
        callback(err);
        return;
      }
      if (childs.length > 0) {
          var errors;
          var done = 0;
          async.forEach(childs, function (child) {
            util.deleteFile(path.join(dir, child), true, function (err) {
              if (err) {
                errors = errors || [];
                errors.push(err);
              }
              if (++done >= childs.length) {
                callback(errors);
              }
              return;
            });
          }, callback);
      } else {
        callback();
      }
    });
  }
};

module.exports = util;