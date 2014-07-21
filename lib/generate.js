var markdownPage = require('./markdown-page.js');
var marked       = require('marked');
var jade         = require('jade');
var fs           = require('fs');
var jsonFile     = require('jsonfile');
var log          = require('./logger').Logger;
var rimraf       = require('rimraf');
var async        = require('async');
var pt           = require('path');

var MD_EXTENSION = ".md";
var JSON_EXTENSION = ".json";
var HTML_EXTENSION = '.html'


var readDir = function (dir, endCallback) {
  fs.readdir(dir, function(error, files){

    if (error) {
      log.error("Error during reading the directory : " + dir + " : " + error);
      endCallback(error);
      return;
    }

    async.each(files,
        function(file, callback) {
          var path = dir + "/" + file;
          analysePath(path, callback);
        },
        function(error){
            endCallback(error, config.dirname + "/" + config.target);
        });

  });
}

var analysePath = function (path, callback) {

    fs.stat(path, function(error, stats) {
      if (error) {
        log.debug("Error during the file stat : " + error);
        callback(error);
        return;
      }

      if (stats.isFile()) {

          if (isMarkdownFile(path)) {
            renderMarkdownFile(path, callback);
            return;
          }

          if (isJsonFile(path)) {
            copyJsonFile(path, callback);
          }
          else {
            copyFile(path, targetFolder(path), callback);
          }
          return;
      }

      if (stats.isDirectory()) {
          fs.mkdir(targetFolder(path), function() {
            readDir(path, callback);
          });
      }
    });


}


var renderMarkdownFile = function(file, callback) {

    markdownPage.buildFromFile(file, function(error, page){
        if (error) {
          callback(error);
          return;
        }

        page.content = marked(page.content);
        if (! page.properties.template) {
          log.warn("Use the default template : " + config.defaultTemplate);
          page.properties = {
             "template": config.defaultTemplate
          }
        }

        var templateFile = config.dirname + "/" + config.templateFolder + "/" + page.properties.template;
        log.debug("Use template File for markdown file : " + templateFile);

        var options = {
          page: page,
          config : config
        }

        jade.renderFile(templateFile, options, function (error, html) {

            if (error) {
              callback(error);
            }
            else {
               var htmlFile = targetFolder(file.replace(MD_EXTENSION, HTML_EXTENSION));
               fs.writeFile(htmlFile, html, function (error) {
                     callback(error);
               });

            }
        });
    });

}


var copyJsonFile = function(path, callback) {
    log.debug("Check if the json file " + path + " is a property file for a markdown content");

    var mdFile = path.replace(JSON_EXTENSION, MD_EXTENSION);
    mdFile = config.dirname + "/" + mdFile;

    //Check if a md file exists

    fs.exists(mdFile, function (exists) {
        if (exists) {
          callback();
        }
        else {
          copyFile(path, targetFolder(path), callback);
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

var targetFolder = function(sourcePath) {
    return sourcePath.replace(config.source, config.dirname + "/" + config.target);
}

var isMarkdownFile = function(path) {
    return path.indexOf(MD_EXTENSION, this.length - MD_EXTENSION.length) !== -1;
}

var isJsonFile = function(path) {
    return path.indexOf(JSON_EXTENSION, this.length - JSON_EXTENSION.length) !== -1;
}

var generateStaticSite = function(callback) {

  configFile = process.cwd() + "/cocoons.json";
  config = jsonFile.readFileSync(configFile);
  config.dirname = process.cwd();
  removeAndCreateDirectory(config.dirname + "/" + config.target, function() {
    log.debug("Start generate site from : " + config.dirname + "/" + config.source);
    readDir(config.source, callback);

  });

}

exports.generateStaticSite = generateStaticSite;
