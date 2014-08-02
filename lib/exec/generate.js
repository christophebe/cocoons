var jade         = require('jade');
var fs           = require('fs');
var jsonFile     = require('jsonfile');
var log          = require('../logger').Logger;
var rimraf       = require('rimraf');
var async        = require('async');
var pt           = require('path');

var widgetRenderer = require('../fs/widget-fs.js');
var markdownPage = require('../fs/markdown-page.js');

var util         = require('../util.js');

var defaultMarkdownRender = "../fs/bootstrap-markdown-render.js";
var markdownRender = null;

/**
 * Public method of this component.
 * Generate the web site into a target folder
 * It will copy all file from the source folder & generate markdown files into
 * HTML 
 *
 * @param callback(error), if error is null, the complete site is correctly generated
 */
var generateStaticSite = function(callback) {

  // -----------------------------------------------------
  // Init the config
  // -----------------------------------------------------
  configFile = process.cwd() + "/cocoons.json";
  config = jsonFile.readFileSync(configFile);
  config.dirname = process.cwd();

  log.info("Start generate site from : " + config.dirname + "/" + config.source);

  // -----------------------------------------------------
  // Init the widget cache
  // -----------------------------------------------------
  widgetRenderer.init(config);

  // -----------------------------------------------------
  // Init the markdown renderer
  // -----------------------------------------------------
  if (! config.markdownRender) {
    config.markdownRender = defaultMarkdownRender;
  }
  markdownRender = require(config.markdownRender);

  // -----------------------------------------------------
  // Remove the target folder &
  // start the generation of the site from the src folder
  // -----------------------------------------------------
  removeAndCreateDirectory(config.dirname + "/" + config.target, function() {

    readDir(config.source, callback);

  });

}

/**
 * Read a source directory in order to analyse each item (files & subdirectories)
 *
 * @param the directory to analyse
 * @param callback(error)
 *
 */
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
          copyToTarget(path, callback);
        },
        function(error){
            endCallback(error, config.dirname + "/" + config.target);
        });

  });
}

/**
 * Copy one element (file or a subdirectory) from the source directory
 * to the target directory
 *
 * @param the path of the file or of a subdirectory
 * @param callback(error)
 */
var copyToTarget = function (path, callback) {

    fs.stat(path, function(error, stats) {
      if (error) {
        log.error("Error during the file stat : " + error);
        callback(error);
        return;
      }

      if (stats.isFile()) {

          if (util.isMarkdownFile(path)) {
            copyMarkdownFile(path, callback);
            return;
          }

          if (util.isJsonFile(path)) {
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

/**
 * Convert a markdown file into HTML & copy it into the target folder
 *
 * @param the markdown file to convert
 * @param callback(error)
 *
 */
var copyMarkdownFile = function(file, callback) {
    //TODO : rewrite this code with async
    markdownPage.buildFromFile(file, function(error, page){
        if (error) {
          callback(error);
          return;
        }

        var params = {
          page: page,
          config : config
        }

        widgetRenderer.renderWidgets(params, function(error, htmlWidgets){
            if (error) {
              callback(error);
            }
            else {
              params.widgets = htmlWidgets;

              page.content = new markdownRender.HTMLRenderer(params).renderToHTML(page.content);
              if (! page.properties.template) {
                log.warn("Template property is not defined. Use the default template : " + config.defaultTemplate + " for file : " + file);
                page.properties.template = config.defaultTemplate;

              }
              else {
                log.debug("Use the template : " + page.properties.template + " for file : " + file);
              }

              var templateFile = config.dirname + "/" + config.templateFolder + "/" + page.properties.template;

              jade.renderFile(templateFile, params, function (error, html) {

                  if (error) {
                    callback(error);
                  }
                  else {
                     var htmlFile = targetFolder(file.replace(util.MD_EXTENSION, util.HTML_EXTENSION));
                     fs.writeFile(htmlFile, html, function (error) {
                           callback(error);
                     });

                  }
              });

            }

        });
    });

}

/**
 * Copy a json file into the target folder if it is not a property file
 * for a markdown file
 *
 * @param the json file path
 * @param callback(error)
 */
var copyJsonFile = function(path, callback) {

    var mdFile = path.replace(util.JSON_EXTENSION, util.MD_EXTENSION);
    mdFile = config.dirname + "/" + mdFile;

    //if a md file exists for this json file
    //=> don't copy because it is its property file
    fs.exists(mdFile, function (exists) {
        if (exists) {
          log.debug("Don't copy the json file " + path + ". It is a property file for a markdown content");
          callback();
        }
        else {
          copyFile(path, targetFolder(path), callback);
        }
    });

}


/**
 * Copy a file from a source folder into a target folder
 *
 * @param the path of the file to copy
 * @param the target path
 * @param callback(error)
 *
 */
var copyFile = function (from, to, callback) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
  callback();
}

/**
 * Init the target folder used to put the generated files of the site
 *
 * @param the target folder
 * @param callback(error)
 *
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

/**
 * Determine the target folder in function of the path of the source file to copy
 *
 * @param the path of the source file
 * @returns the target file path
 */
var targetFolder = function(sourcePath) {
    return sourcePath.replace(config.source, config.dirname + "/" + config.target);
}


exports.generateStaticSite = generateStaticSite;
