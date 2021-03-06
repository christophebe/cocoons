var jade         = require('jade');
var fs           = require('graceful-fs');
var rimraf       = require('rimraf');
var async        = require('async');
var pt           = require('path');

var log          = require('../logger').Logger;


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
var generateSite = function(callback) {

  // -----------------------------------------------------
  // Init the config
  // -----------------------------------------------------
  configFile = process.cwd() + "/cocoons.json";
  init(configFile, function(error, config){
      if (error) {
          log.error("Impossible to start the generation of the site : " + error);
          return;
      }


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
      var targetFolder = config.dirname + "/" + config.target;

      removeAndCreateDirectory(targetFolder, function() {
          startSiteGeneration(config, callback);
      });

  });



}

var init = function(configFile, callback) {

    util.readJsonFile(configFile, function(error, config){
      if (! error) {
          config.dirname = process.cwd();
      }
      callback(error, config);

    })


}


/**
 * Start the generation of the site in the target folder
 * + generate the web server config files (htaccess, ...)
 *
 * @param the json object that match to the file cocoons.json
 * @param callback used when the different tasks are done
 */
var startSiteGeneration = function(config, endCallback)
{

    async.parallel([
        function(callback){
          if (config.htaccess && config.htaccess.generate) {
            generateHtaccess(config, callback);
          }

        },
        function(callback){
          if (config.public) {
            readDir(config,config.public, targetPublicFolder, callback);
          }
          else {
            callback();
          }

        },
        function(callback){
            readDir(config,config.source, targetSourceFolder,  callback);
        }],

        function(error, results){
          if (error) {
              endCallback(error);
              return;
          }
          if (results[2]) {
              endCallback(null, results[2]);
          }
          else {
            endCallback(new Error("Impossible to get the target folder after generating the site"));
          }


        }
    );


}

/**
 * Generate the .htaccess file for Apache
 *
 * @param the json object that match to the file cocoons.json
 * @param callback(error)
 */
var generateHtaccess = function (config, callback) {
  var targetFolder = config.dirname + "/" + config.target;

  htaccessTemplate = pt.resolve( __dirname, '../..', 'site-templates/htaccess') + "/htaccess.jade";

  var cloakingRules = [];

  if (config.cloaks) {
    cloakingRules = generateCloakingRules(config);
  }

  jade.renderFile(htaccessTemplate, {config : config, cloakingRules : cloakingRules}, function (error, file) {

      if (error) {
        callback(new Error("Error during the generation of htacces :" + error));
      }
      else {
         fs.writeFile(targetFolder + "/.htaccess", file, function (error) {
               callback(error);
         });

      }
  });

}


var generateCloakingRules = function (config) {

  /// RewriteCond %{HTTP_HOST} ^##\.##\.##\.##

  // RewriteCond %{HTTP_USER_AGENT} ^Google [OR]
  // RewriteCond %{HTTP_USER_AGENT} ^Mozilla/5\.0\ \(compatible;\ Googlebot/
  // RewriteRule ^markdown.html$ /gg/index.html [R=301]
  var cloakingRules = [];

  config.cloaks.forEach(function(rule) {

      var conditionRules = [];

      if (rule.conditions) {

            if (rule.conditions.userAgents) {

              // Check if there is an OR between user agents rules & HOST/IP rules
              var or = (rule.confitions && rule.confitions.or ? rule.confitions.or : false);

              var userAgentRules = addConditions(rule.conditions.userAgents, "RewriteCond %{HTTP_USER_AGENT}", or);
              Array.prototype.push.apply(conditionRules, userAgentRules);
            }


            if (rule.conditions.ips) {
              var ipRules = addConditions(rule.conditions.ips, "RewriteCond %{HTTP_HOST}");
              Array.prototype.push.apply(conditionRules, ipRules);
            }

      }

      rule.rewrites.forEach(function(rewrite) {

        //Add condition rules
        if (rule.conditions) {
            Array.prototype.push.apply(cloakingRules, conditionRules);
        }

        // Content replacement is not supporting in the htaccess
        // For the moment, only redirect 301, 302 and 404 are supported
        var type = (rewrite.type ? rewrite.type : "301" );
        if (type == "replace") {
          type = "301";
        }

        var htAccessRule = "RewriteRule " + rewrite.from + " " +  rewrite.to +  " [R=" + type + "]";
        cloakingRules.push(htAccessRule);

        //Little hack to insert blank line between rules
        cloakingRules.push("");

      });

      //Little hack to insert blank line between rules
      cloakingRules.push("");


  });
  log.info(cloakingRules);
  return cloakingRules;

}

var addConditions = function (conditions, conditionPrefix, or) {

  var htAccessRules = [];

  for (i=0; i< conditions.length; i++) {
    var htAccessRule = conditionPrefix + " " + conditions[i];
    if (conditions.length > 1 && i < conditions.length -1 ) {
      htAccessRule += " [OR]";
    }

    if (i == conditions.length -1 && or ) {
      htAccessRule += " [OR]"
    }

    htAccessRules.push(htAccessRule);
  }

  return htAccessRules;
}




/**
 * Read a source directory in order to analyse each item (files & subdirectories)
 *
 * @param the directory to analyse
 * @param callback(error)
 *
 */
var readDir = function (config, dir, targetFunction, endCallback) {

  fs.readdir(dir, function(error, files){
    log.debug("read dir : " + dir);
    if (error) {
      log.error("Error during reading the directory : " + dir + " : " + error);
      endCallback(error);
      return;
    }

    async.eachLimit(files, 10,
        function(file, callback) {
          var path = dir + "/" + file;
          log.debug("read file : " + path);
          copyToTarget(config, path, targetFunction, callback);
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
var copyToTarget = function (config, path, targetFunction, callback) {

    fs.stat(path, function(error, stats) {
      if (error) {
        log.error("Error during the file stat : " + error);
        callback(error);
        return;
      }

      if (stats.isFile()) {

          if (util.isMarkdownFile(path)) {
            copyMarkdownFile(config, path, callback);
            return;
          }

          if (util.isJsonFile(path)) {
            copyJsonFile(config, path, callback);
          }
          else {
            copyFile(path, targetFunction(config, path));
            callback();
          }
          return;
      }

      if (stats.isDirectory()) {
          fs.mkdir(targetFunction(config, path), function() {
            readDir(config, path, targetFunction, callback);
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
var copyMarkdownFile = function(config, file, callback) {
    //TODO : rewrite this code with async
    markdownPage.buildFromFile(file, function(error, page){
        if (error) {
          callback(error);
          return;
        }

        var params = {
          page: page,
          config : config,
          file : file
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
                     var htmlFile = targetSourceFolder(config, file.replace(util.MD_EXTENSION, util.HTML_EXTENSION));
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
var copyJsonFile = function(config, path, callback) {

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
          copyFile(path, targetSourceFolder(config, path));
          callback();
        }
    });

}


/**
 * Copy a file from a source folder into a target folder
 *
 * @param the path of the file to copy
 * @param the target path
 * @param callback()
 *
 */
var copyFile = function (from, to) {
  fs.createReadStream(from).pipe(fs.createWriteStream(to));
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
var targetSourceFolder = function(config, sourcePath) {
    return sourcePath.replace(config.source, config.dirname + "/" + config.target);
}

/**
 * Determine the target folder in function of the path of the public file to copy
 *
 * @param the path of the source file
 * @returns the target file path
 */
var targetPublicFolder = function(config, sourcePath) {
    return sourcePath.replace(config.public, config.dirname + "/" + config.target);
}

exports.generateSite = generateSite;
