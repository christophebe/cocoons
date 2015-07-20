var express     = require('express');
var bodyParser  = require('body-parser');
var serveStatic = require('serve-static');
var favicon     = require('serve-favicon');
var log         = require('../logger.js').Logger;
var util 			  = require("../util.js");

var defaultPreviewEngine = "../fs/preview-fs.js";


var CONFIG_FILE = "/cocoons.json";

/**
* Public method of this component.
* Preview a web site from specific folder
* This folder should contain all the artifacts (content, markdown, images, templates, widgets, ...)
*
* @param the web site folder
*/
var previewSite = function (websiteFolder) {
	//---------------------------------------------------------
	// Init the preview mode, mainly read the cocoons.json file
	//---------------------------------------------------------
	init(websiteFolder, function (error, config) {
			if (error) {
					log.error("Impossible to start the preview mode : " + error);
					return;
			}

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

			if (config.useProxy) {
				log.info("This cocoons.io server is configured to be used with a reverse proxy");
				app.enable('trust proxy');
			}


			app.use(bodyParser());
			if (config.public) {
					app.use(serveStatic(config.dirname + "/" + config.public));
					log.info("Cocoons public folder for static files : " + config.dirname + "/" + config.public);
			}
			
			app.set('views', config.dirname + "/" + config.templateFolder);
			app.set('view engine', config.templateEngine);

			//------------------------------------------------------
			// All requests are dispatching to the preview engine
			//------------------------------------------------------
			app.get("/*",  function(req, res) {
				preview.get(req, res);
			});

			if (config.hostname) {
				log.info('Cocoons.io is running on hostname ' + config.hostname + ' and on port : ' + config.port);
				app.listen(config.port, config.hostname);
			}
			else {
				log.info('Cocoons.io is running on localhost on port : ' + config.port);
				app.listen(config.port);
			}




	});

}

/**
 * Init the preview mode
 * Read the cocoons.json config file from the website folder
 *
 * @param the folder in which the site has been created
 * @param callback(error, config)
 */
var init = function(websiteFolder, callback) {

		if (! websiteFolder) {
			websiteFolder = process.cwd();
		}
		else {
			websiteFolder = process.cwd() + "/" + websiteFolder;
		}
		var configFile = websiteFolder + CONFIG_FILE;
		util.readJsonFile(configFile, function(error, config){
			if (! error) {
					config.dirname = websiteFolder;
			}
			callback(error, config);

		})

}


// Export in order to use Cocoons.io as an exectuable (npm global)
exports.previewSite = previewSite;
