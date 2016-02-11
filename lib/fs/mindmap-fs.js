var pt           = require('path');
var mkpath       = require('mkpath');
var fs           = require('graceful-fs');
var parser       = require('xml2js').parseString;
var async        = require('async');
var jade         = require('jade');
var log          = require('../logger.js').Logger;
var util         = require('../util.js');
var corpus       = require('../mindmap/corpus.js');



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

// The template used to create the markdown content for each page
var defaultMDTemplate = "mindmap/markdown-en.jade";
// The template used to create the json content for each page
var defaultJsonTemplate = "mindmap/json-en.jade";


//var templateMd = null;
//var templateJson = null;
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

        // Compile the jade templates that will be used to generate the different page files (md & json).
        //  & Read the mindmap file
        function(callback){
            that.readFiles(mindmapFilePath, callback);
        },
        // Convert mindmap json structure into our internal data structure
        // with the help of the the converter specified in the cocoons.json
        // By this way, we can support different mindmap xml file format
        // OPML is used by default.
        function(data, callback) {
            log.info("Convert the mindmap file");
            var homePage = converter.transform(data.mindmapJson);
            data.homePage = homePage;

            callback(null, data);

        },
        // Now, it is time to generate our site
        function(data, callback) {
          log.info("Generate the site");
          that.generateSite(data, function (error) {
            callback(error);

          });

        }],

        function(error){
            endCallback(error, that.srcFolder);
        });

};

Mindmap.prototype.readFiles = function(mindmapFilePath, endCallback) {
  var that = this;

  async.parallel([
        function(callback) {
          that.compiledTemplateMD(callback);
        },
        function(callback) {
          that.compiledTemplateJson(callback);
        },
        function(callback) {
          that.readMindmapFile(mindmapFilePath, callback);
        }

      ],
      // optional callback
      function(error, results){
        if (error) {
          return endCallback(error);
        }
        endCallback(null, {templateMD : results[0], templateJson : results[1], mindmapJson : results[2]});

      });
  };

Mindmap.prototype.compiledTemplateMD = function(callback) {
  log.info("Compile the jade templates that will be used to generate the markdown files");
  var that = this;

  var templateFile = that.projectFolder + "/" + that.config.templateFolder ;
  if (that.config.mindmapMardownTemplate) {
    templateFile += "/" + that.config.mindmapMardownTemplate;
  }
  else {
    templateFile += "/" + defaultMDTemplate;
  }
  util.compileJade(templateFile, function(error, compiledTemplate) {
    if (error) {
      callback(error);
      return;
    }

    callback(null, compiledTemplate);
  });
};

Mindmap.prototype.compiledTemplateJson = function(callback) {
  log.info("Compile the jade templates that will be used to generate the json files");
  var that = this;

  var templateFile = that.projectFolder + "/" + that.config.templateFolder ;
  if (that.config.mindmapJsonTemplate) {
    templateFile += "/" + that.config.mindmapJsonTemplate;
  }
  else {
    templateFile += "/" + defaultJsonTemplate;
  }
  util.compileJade(templateFile, function(error, compiledTemplate) {
    if (error) {
      callback(error);
      return;
    }

    callback(null, compiledTemplate);
  });
};


Mindmap.prototype.readMindmapFile = function(mindmapFilePath, callback){
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
            //console.log("json >>>> ", JSON.stringify(result));
            callback(error, result);

        });
    });
};

/**
 * Generate the web site based on our internal data structure
 * There are 2 steps :
 * 1. Create the different pages
 * 2. Create the main menu
 *
 * @param the home page of the mindmap structure
 * @param callback(error)
 */
Mindmap.prototype.generateSite = function(data, endCallback) {
      var that = this;

      async.parallel([
          function(callback){
              that.generatePages(data.homePage, data.templateMD, data.templateJson, callback);
          },
          function(callback){
              that.createMainMenu(data.homePage, callback);
          }
      ],

      function(error, result){
          endCallback(error);
      });
};

/**
 * Generate all pages from a main page like the home page.
 * It the page has some subpages, thoses pages will be also generated.
 *
 * @param the page to generate
 * @param callback(error)
 */
Mindmap.prototype.generatePages = function (page, templateMD, templateJson, endCallback) {


    var that = this;
    async.series([
        function(callback){
            that.generatePage(page, templateMD, templateJson, callback);
        },
        function(callback){
          // Create the subpages
          if (page.children) {
            async.each(page.children, function(subpage , callback) {
                    subpage.sisters = converter.getSisterPages(page,subpage);
                    that.generatePages(subpage, templateMD, templateJson, callback);
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
};

/**
 * Generate one page. They are 2 steps :
 * 1. Create a subdirectory if the page are subpages
 * 2. Create the page file : the markdown file + the json for the meta data
 *
 * @param the page to create
 * @param callback(error)
 */
Mindmap.prototype.generatePage = function(page, templateMD, templateJson, endCallback) {
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
        function(callback) {
              var options = {
                  keyword : page.kw,
                  country : that.config.country,
                  ngrams: 1,
                  language : that.config.language
                };

                /*corpus.generateCorpus(options, function(error, corpus) {

                });*/
                callback();
        },
        function(callback){
          that.createFiles(page,templateMD, templateJson, callback);
        }
    ],
    function(error){
        endCallback(error);
    });

};

Mindmap.prototype.generateCorpus = function(page) {

};
/**
 * Create the files (markdown & json/meta data) for one page
 *
 * @param the page for which the files have to be created
 * @param callback(error)
 */
Mindmap.prototype.createFiles = function(page, templateMD, templateJson, endCallback) {
    var that = this;

    async.parallel([
        // Create the md file
        function(callback){
            page.config = that.config;
            var mdContent = templateMD(page);
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
          page.config = that.config;
          var json = templateJson(page);
          var file = that.getFileName(page, ".json");
          log.info("Create file : " + file );
          fs.writeFile(file, json, function(error) {
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


};

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
  if (page.path === "") {
    file = this.srcFolder + "/index" + extension;
  }
  else {
    file = this.srcFolder + page.path + extension;
  }

  return file;
};

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
};

module.exports.Mindmap = Mindmap;
