var fs           = require('fs');
var jsonFile     = require('jsonfile');
var rimraf       = require('rimraf');
var async        = require('async');
var pt           = require('path');
var log          = require('./logger').Logger;


var readDir = function (config, path, endCallback) {
  fs.readdir(path, function(error, files){

    if (error) {
      log.error("Error during reading the directory : " + path + " : " + error);
      endCallback(error);
      return;
    }

    async.each(files,
        function(file, callback) {
            log.debug("***** " + file);
            var child = path + "/" + file;

            if (! hasToIgnore(config, file)) {
              analysePath(config, child, callback);
            }
        },
        function(error) {
            endCallback(error, config.websiteFolder);
        });

  });
}

var hasToIgnore = function(config, file) {
    for (i=0; i< config.ignoreFiles.length; i++) {
      if (file.match(config.ignoreFiles[i])) {
        log.debug("Ignore file : " + file);
        return true;
      }
    }
    return false;
}

var analysePath = function(config, path, callback) {

    fs.stat(path, function(error, stats) {
      if (error) {
        log.error("Error during the file stat : " + error);
        callback(error);
        return;
      }

      if (stats.isFile()) {
          copyFile(path, targetFolder(config, path), callback);
          return;
      }

      if (stats.isDirectory()) {
          fs.mkdir(targetFolder(config, path), function() {
            readDir(config, path, callback);
          });
      }
    });


}


/**
 *  Create a new directory.
 *  if exists, remove subdirectories & files
 */
var removeAndCreateDirectory = function(dir, endCallback) {

  async.waterfall([
    function(callback){

        fs.exists(dir, function(exists){
          callback(null, exists);
        });

    },
    function(exists, callback){
      if(exists) {
        log.debug("Remove directory : " + dir);
        rimraf(dir, function(error){
            if (error){
              log.debug(error);
              callback(error);
            }
            else {
              callback();
            }
        });
      }
      else {
        callback();
      }
    }],
    function (error) {
        fs.mkdir(dir, function() {
          endCallback();
        });
    });

}

var copyFile = function (from, to, callback) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
  callback();
}

var targetFolder = function(config, sourcePath) {
    return sourcePath.replace(config.siteTemplateFolder, config.websiteFolder);
}


var createWebsite = function(callback) {

  var config = {
    websiteFolder : process.cwd(),
    siteTemplateFolder : pt.resolve(__dirname, '..', 'site-templates/basic'),
    ignoreFiles : ["^[.]"]
  }

  log.info("Create a new web site in the folder : " + config.websiteFolder);
  log.info("Use site template in : " + config.siteTemplateFolder);

  readDir(config, config.siteTemplateFolder, callback);

}

exports.createWebsite = createWebsite;
