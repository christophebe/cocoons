var log        = require('../logger').Logger;
var util 			 = require("../util.js");

var defaultMindmapEngine = "../fs/mindmap-fs.js";

// Converter the OPML format into our intertal data object
var defaultMindmapConverter = "../mindmap/opml-converter.js";

/**
 * Generate a web site based on a mindmap.
 * The mindmap should be exported into an xml file. By default, this is the
 * OPML format that is supported.
 *
 * You can use another XML grammar by creating your own xml converter
 * (see the file ../mindmap/opml-converter.js as example). In such case, you
 * have to set the attribute mindmapConverter into the cocoons.js file of the
 * project.
 *
 *
 * @param the xml file that matches to the mindmap
 * @param callback(error, folder) folder = the folder in which the site has been generated
 */
var generateFromMindmap = function(params, callback) {


  // -----------------------------------------------------
  // Init the config
  // -----------------------------------------------------
  configFile = process.cwd() + "/cocoons.json";

  init(configFile, function(error, config){
      if (error) {
          log.error("Impossible to start the generation of the pages from the site map : " + error);
          return;
      }


      log.info("Start the generation of the pages : " + config.dirname + "/" + config.source);

      //------------------------------------------------------
      // Create the mindmap engine
      //------------------------------------------------------
      if (! config.mindmapEngine) {
        config.mindmapEngine = defaultMindmapEngine;
      }

      if (! config.mindmapConverter) {
        config.mindmapConverter = defaultMindmapConverter;
      }

      var engine = require(config.mindmapEngine);
      
      if (params.mindmapPrefix) {
        config.mindmapPrefix = params.mindmapPrefix;
      }
      var mindmapEngine = new engine.Mindmap(config);

      //------------------------------------------------------
      // Generate the site from the mindmap
      //------------------------------------------------------
      mindmapEngine.generateFromMindmap(params.mindmapFile, function(error, folder){
        callback(error, folder);
      });


  });

}


/**
 *
 * Read the cocoons.json config file from the website folder
 *
 * @param the cocoons.json file of the current project
 * @param callback(error, config)
 */
var init = function(configFile, callback) {

    util.readJsonFile(configFile, function(error, config){
      if (! error) {
          config.dirname = process.cwd();
      }
      callback(error, config);

    })


}

exports.generateFromMindmap = generateFromMindmap;
