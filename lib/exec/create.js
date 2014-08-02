var fs           = require('fs');
var jsonFile     = require('jsonfile');
var rimraf       = require('rimraf');
var async        = require('async');
var pt           = require('path');
var log          = require('../logger').Logger;

var DEFAULT_SITE = 'site-templates/basic';

/**
 * Public method of this component.
 * Create a new web site in the current directory.
 * The creation of a new site is based on a template that match to a folder
 * By default, we use the DEFAULT_SITE folder.
 *
 * the content of this template folder is copying inside the folder used
 * for the new web site (current directory).
 *
 * @param callback(error)
 */
var createWebsite = function(callback) {

  var config = {
    websiteFolder : process.cwd(),
    siteTemplateFolder : pt.resolve(__dirname, '../..', DEFAULT_SITE),
    ignoreFiles : ["^[.]"] // ignore hidden files
  }

  log.info("Create a new web site in the folder : " + config.websiteFolder);
  log.info("Use site template in : " + config.siteTemplateFolder);

  readTemplateDir(config, config.siteTemplateFolder, callback);

}

/**
 * Read the site template directory in order to copy its files & subdirectories
 * into the current directory
 *
 * @param config object containing parameters
 * @param the path of the template site folder
 * @param callback(error)
 */
var readTemplateDir = function (config, path, endCallback) {
  fs.readdir(path, function(error, files){

    if (error) {
      log.error("Error during reading the directory : " + path + " : " + error);
      endCallback(error);
      return;
    }

    async.each(files,
        function(file, callback) {
            var child = path + "/" + file;

            if (! hasToIgnore(config, file)) {
              copyToCurrentDirectory(config, child, callback);
            }
        },
        function(error) {
            endCallback(error, config.websiteFolder);
        });

  });
}

/**
 * Check if a file has been to ignore (not copy in the new web site folder)
 *
 * @param config object
 * @param the file path to check
 * @returns true if the file has to be ignored
 */
var hasToIgnore = function(config, file) {
    for (i=0; i< config.ignoreFiles.length; i++) {
      if (file.match(config.ignoreFiles[i])) {
        log.debug("Ignore file : " + file);
        return true;
      }
    }
    return false;
}

/**
 * Copy a file or a directory from the site template folder into
 * the folder used for the new web site (current directory)
 *
 * @param config object
 * @param the path of the file to copy
 * @param callback(error)
 *
 */
var copyToCurrentDirectory = function(config, path, callback) {

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
            readTemplateDir(config, path, callback);
          });
      }
    });


}


/**
 * Copy one file from the template site folder into the new web site folder
 * (current directory)
 *
 * @param the path of the file to copy
 * @param the path of the target file
 * @param callback()
 */
var copyFile = function (from, to, callback) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
  callback();
}


/**
 * Determine the target folder in function of the path of the source file to copy
 *
 * @param config object
 * @param the path of the file to copy
 * @returns the target file path
 */
var targetFolder = function(config, sourcePath) {
    return sourcePath.replace(config.siteTemplateFolder, config.websiteFolder);
}




exports.createWebsite = createWebsite;
