var express    = require('express');
var bodyParser = require('body-parser');
var favicon    = require('serve-favicon');
var jsonFile   = require('jsonfile');
var log        = require('../logger.js').Logger;
var defaultPreviewEngine = "../fs/preview-fs.js";


var CONFIG_FILE = "/cocoons.json";

/**
* Public method of this component.
* Preview a web site from specific folder
* This folder should contain all the artifacts (content, markdown, images, templates, widgets, ...)
*
* @param the web site folder
*/
var preview = function (websiteFolder) {
	//------------------------------------------------------
	// Read the config file cocoons.json
	//------------------------------------------------------
	var config = readConfig(websiteFolder);
	log.info("Start Cocoons.io from the directory : " + config.dirname);

	//------------------------------------------------------
	// Create the preview engine
	//------------------------------------------------------
	if (! config.previewEngine) {
		config.previewEngine = defaultPreviewEngine;
	}
	var engine = require(config.previewEngine);
	var preview = new engine.Preview(config);

  //------------------------------------------------------
	// Init & start Express
	//------------------------------------------------------
	var app = express();
	app.use(bodyParser());
	app.use(favicon(config.dirname + "/" + config.favicon));
	app.set('views', config.dirname + "/" + config.templateFolder);
	app.set('view engine', config.templateEngine);

	//------------------------------------------------------
	// All requests are dispatching to the preview engine
	//------------------------------------------------------
	app.get("/*",  function(req, res) {

		preview.get(req, res);
	});


	app.listen(config.port);
	log.info('Cocoons.io is running on port ' + config.port);

}

/**
 * Read the cocoons.json config file from the website folder
 *
 * @param
 * @returns
 */
var readConfig = function(websiteFolder) {

		if (! websiteFolder) {
			websiteFolder = process.cwd();
		}
		else {
			websiteFolder = process.cwd() + "/" + websiteFolder;
		}
		var configFile = websiteFolder + CONFIG_FILE;
		var config = jsonFile.readFileSync(configFile);

		config.dirname = websiteFolder;

		return config;

}


// Export in order to use Cocoons.io as an exectuable (npm global)
exports.preview = preview;
