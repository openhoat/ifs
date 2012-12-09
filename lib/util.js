var config = require('../config.js')
  , fs = require('fs')
  , path = require('path')
  , async = require('async');

// var verbose = config.options && config.options.verbose;

var util = {
  endsWith:function (str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  },
  deleteDir: function (dir, callback) {
    fs.rmdir(dir, function (err) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          throw err;
        }
      } else {
        if (callback) {
          callback();
        }
      }
    });
  },
  deleteFile:function (file, recursive, callback) {
    fs.lstat(file, function (err, stats) {
      if (err) {
        if (callback) {
          callback(err);
        } else {
          throw err;
        }
        return;
      }
      if (stats.isDirectory()) {
        if (recursive) {
          fs.readdir(file, function (err, childs) {
            if (err) {
              if (callback) {
                callback(err);
              } else {
                throw err;
              }
              return;
            }
            if (childs.length > 0) {
              (function () {
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
                        if (callback) {
                          callback(errors);
                        } else {
                          errors.forEach(function (error) {
                            throw error;
                          });
                        }
                        return;
                      }
                      util.deleteDir(file, callback);
                    }
                  });
                }, function (err) {
                  if (err) {
                    if (callback) {
                      callback(err);
                    } else {
                      throw err;
                    }
                    return;
                  }
                });
              })();
            } else {
              util.deleteDir(file, callback);
            }
          });
        } else {
          util.deleteDir(file, callback);
        }
      } else {
        fs.unlink(file, function (err) {
          if (err) {
            if (callback) {
              callback(err);
            } else {
              throw err;
            }
            return;
          }
          if (callback) {
            callback();
          }
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
        return;
      }
      if (childs.length > 0) {
        (function () {
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
          }, function (err) {
            if (err) {
              if (callback) {
                callback(err);
              } else {
                throw err;
              }
              return;
            }
          });
        })();
      } else {
        callback();
      }
    });
  }
};

module.exports = util;