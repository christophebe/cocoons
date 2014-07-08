var markdownPage = require('./lib/markdown-page.js');
var marked       = require('marked');
var jade         = require('jade');
var fs           = require('fs');
var jsonFile     = require('jsonfile');
var log          = require('./lib/logger').Logger;
var rimraf       = require('rimraf');
var async        = require('async');

var MD_EXTENSION = ".md";

var configFile = "./cocoons.json";
var config = jsonFile.readFileSync(configFile);

var analysePath = function (path) {

    fs.stat(path, function(error, stats) {
      if (error) {
        log.debug(error);
        return;
      }

      if (stats.isFile()) {
          //TODO : if md file => render into HTML
          if (isMarkdownFile(path)) {
            renderMarkdownFile(path);

          }
          else {
            copyFile(path, targetFolder(path));
          }
          return;
      }

      if (stats.isDirectory()) {
          fs.mkdir(targetFolder(path), function() {
            readDir(path);
          });
      }
    });


}

var readDir = function (dir) {
  fs.readdir(dir, function(error, files){

    //log.debug("Read directory : " + config.source);

    if (error) {
      log.debug(error);
      return;
    }

    for(i=0; i<files.length; i++) {
      var path = dir + "/" + files[i];
      analysePath(path);
    }

  });
}


var renderMarkdownFile = function(file, callback) {

    markdownPage.buildFromFile(file, function(error, page){

        if (error) {
          callback(error);
          return;
        }

        //Convert markdown into html
        page.content = marked(page.content)	;

        var templateFile = "." + config.templateFolder + "/" + page.properties.template;
        log.debug("Use template File for markdown file : " + templateFile);

        var options = {
          page: page
        }

        jade.renderFile(templateFile, options, function (error, html) {

            if (error) {
              callback(error);
            }
            else {
               var htmlFile = targetFolder(file.replace('.md', '.html'));
               fs.writeFile(htmlFile, html, function (error) {
                   if (error) {
                     callback(error);
                   }
               });

            }

        });
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

var copyFile = function (from, to) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

var generateStaticSite = function(config) {

  removeAndCreateDirectory(config.target, function() {
    log.debug("Start generate site from : " + config.source);
    readDir(config.source);

  });

}

var targetFolder = function(sourcePath) {
    return sourcePath.replace(config.source, config.target);
}

var isMarkdownFile = function(path) {
    return path.indexOf(MD_EXTENSION, this.length - MD_EXTENSION.length) !== -1;
}

//------ Program Start


generateStaticSite(config);
