var pt           = require('path');
var mkpath       = require('mkpath');
var fs           = require('graceful-fs');
var parser       = require('xml2js').parseString;
var async        = require('async');
var jade         = require('jade');
var log          = require('../logger.js').Logger;
var util         = require('../util.js');


// -----------------------------------------------------
// TODO :
//  - remove the current structure ?
//  - create only for non existing pages & directories ?
// => ask questions to the user or set a specific config
//    in the cocoons.json
//  - Partial generation of the site architecture based on url/path
// => ask a question to the user or set a specific config
//
// -----------------------------------------------------

// The template used to create the markdown content for each pages
var defaultTemplateFile = "mindmap/markdown.jade";


var template = null;
var converter = null;

/**
 * Main object that will generate a site structure & content in the file system.
 *
 * @param the config object. It matches mainly the cocoons.json file
 *
 */
function Mindmap (config, projectFolder) {

    this.config = config;
    converter = require(config.mindmapConverter);

    if (! projectFolder) {
        this.projectFolder = process.cwd();
    }
    else {
      this.projectFolder = projectFolder;
    }

    this.srcFolder = this.projectFolder + "/" + config.source +
                     (config.mindmapPrefix ? "/" +  config.mindmapPrefix : "") ;

    log.info("The site structure will be generated into : " + this.srcFolder);

}

/**
 * Generate the complete web site, in the source folder of the project
 *
 * @param the xml file that matches to the mindmap
 * @param callback(error, folder). folder = the source folder path
 */
Mindmap.prototype.generateFromMindmap = function(mindmapFilePath, endCallback) {

    var that = this;
    async.waterfall([

        //Compile the jade template that will be used to generate the different page files.
        function(callback){
            log.info("Compile the jade template that will be used to generate the different page files");
            var templateFile = that.projectFolder + "/" + that.config.templateFolder ;
            if (that.config.mindmapPageTemplate) {
              templateFile += "/" + that.config.mindmapPageTemplate;
            }
            else {
              templateFile += "/" + defaultTemplateFile;
            }
            util.compileJade(templateFile, function(error, compiledTemplate) {
              if (error) {
                callback(error);
                return;
              }

              template = compiledTemplate;
              callback(null);
            });
        },
        // Read the xml mindmap file & convert it into json
        function(callback){
            log.info("Read the mindmap file");
            if (! mindmapFilePath) {
                callback(new Error("mindMap file is not defined"));
                return;
            }

            fs.readFile(mindmapFilePath, function(error, xmlData) {

                if (error) {
                  callback(error);
                  return;
                }

                parser(xmlData, function (error, result) {
                    console.log(JSON.stringify(result));
                    callback(error, result);
                    /*
                    var jsonString = JSON.stringify(result);
                    console.log(jsonString);

                    var json = util.convertToJson(jsonString);
                    callback(error, json);
                    */

                });
                // Convert xml into json by using xmls2json module
                /*
                var jsonString = parser.toJson(xmlData);
                var json = util.convertToJson(jsonString);

                if (! json) {
                  callback(new Error("Impossible to parse into json the mindmap file : " + mindmapFilePath));
                  return;
                }
                callback(null, json);
                */

            });
        },
        // Convert mindmap json structure into our internal data structure
        // with the help of the the converter specified in the cocoons.json
        // By this way, we can support different mindmap xml file format
        // OPML is used by default.
        function(json, callback) {
            log.info("Convert the mindmap file");
            var homePage = converter.transform(json);
            callback(null, homePage);

        },
        // Now, it is time to generate our site
        function(homePage, callback) {
          log.info("Generate the site");
          that.generateSite(homePage, function (error) {
            callback(error)

          });

        }],

        function(error){
            endCallback(error, that.srcFolder);
        });

}

/**
 * Generate the web site based on our internal data structure
 * There are 2 steps :
 * 1. Create the different pages
 * 2. Create the main menu
 *
 * @param the home page of the mindmap structure
 * @param callback(error)
 */
Mindmap.prototype.generateSite = function(homePage, endCallback) {
      var that = this;

      async.parallel([
          function(callback){
              that.generatePages(homePage, callback);
          },
          function(callback){
              that.createMainMenu(homePage, callback);
          }
      ],

      function(error, result){
          endCallback(error);
      });


}

/**
 * Generate all pages from a main page like the home page.
 * It the page has some subpages, thoses pages will be also generated.
 *
 * @param the page to generate
 * @param callback(error)
 */
Mindmap.prototype.generatePages = function (page, endCallback) {


    var that = this;
    async.series([
        function(callback){
            that.generatePage(page, callback);
        },
        function(callback){
          // Create the subpages
          if (page.children) {
            async.each(page.children, function(subpage , callback) {
                    subpage.sisters = converter.getSisterPages(page,subpage);
                    that.generatePages(subpage, callback);
              },
              function(error){
                  callback(error);
              });

          }
          else {
            callback();
          }
       }
    ],

    function(error){
        endCallback(error);
    });
}

/**
 * Generate one page. They are 2 steps :
 * 1. Create a subdirectory if the page are subpages
 * 2. Create the page file : the markdown file + the json for the meta data
 *
 * @param the page to create
 * @param callback(error)
 */
Mindmap.prototype.generatePage = function(page, endCallback) {
    var that = this;

    async.series([
        function(callback){
            if (page.children)
            {
                log.info("Create directory : " + that.srcFolder + page.path);
                mkpath(that.srcFolder + page.path, function (error) {
                    callback(error);
                });
            }
            else {
              callback();
            }
        },
        function(callback){
          that.createFiles(page,callback);
        }
    ],
    function(error){
        endCallback(error);
    });

}

/**
 * Create the files (markdown & json/meta data) for one page
 *
 * @param the page for which the files have to be created
 * @param callback(error)
 */
Mindmap.prototype.createFiles = function(page, endCallback) {
    var that = this;

    async.parallel([
        // Create the md file
        function(callback){
            var mdContent = template(page);
            var file = that.getFileName(page, ".md");
            log.info("Create file : " + file );
            fs.writeFile(file, mdContent, function(error) {
                if (error) {
                  log.error(error);
                }
                callback(error);
            });

        },
        // Create the json file
        function(callback) {
            var meta = {
                  "template": "page-with-sidebar.jade",
                  "description" : "Add here the meta description",
                  "title": page.title,
                  "h1" : page.title
                }

            var jsonString = JSON.stringify(meta, null, 4);
            var file = that.getFileName(page, ".json");
            fs.writeFile(file, jsonString, function(error) {
                if (error) {
                  log.error(error);
                }
                callback(error);
            });

        }
    ],
    function(error){
        endCallback(error);
    });


}

/**
 * get the path & filename for a page
 *
 * @param the page
 * @param the extension used for the filename (ex. : .md, .json, ...)
 * @returns the complete path & filename
 */
Mindmap.prototype.getFileName = function (page, extension) {
  var file = "";
  // If this is the home page
  if (page.path == "") {
    file = this.srcFolder + "/index" + extension;
  }
  else {
    file = this.srcFolder + page.path + extension;
  }

  return file;
}

/**
 * Create the main menu for this new site
 * The cocoons.json file will be updated.
 *
 * @param the homePage of the site
 * @param callback(error)
 */
Mindmap.prototype.createMainMenu = function (homePage, callback) {
  var cocoonsFile = this.projectFolder + "/cocoons.json";
  util.readJsonFile(cocoonsFile, function (error, config) {

      if (error) {
        callback(error);
      }

      // 1. Modify the menu into the config file cocoons.json
      config.menu = {};
      homePage.children.forEach(function(subPage){
          config.menu[subPage.title] = subPage.path + ".html";
      });

      // 2. Update the cocoons.json
      var jsonString = JSON.stringify(config, null, 4);
      fs.writeFile(cocoonsFile, jsonString, function(error) {
          if (error) {
            log.error(error);
          }
          callback();
      });

  });
}

module.exports.Mindmap = Mindmap;
