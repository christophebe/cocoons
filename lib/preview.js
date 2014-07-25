var express    = require('express');
var bodyParser = require('body-parser');
var favicon    = require('serve-favicon');
var jsonFile   = require('jsonfile');
var log        = require('./logger.js').Logger;
var defaultPreviewEngine = "./cocoon-fs.js";

var CONFIG_FILE = "/cocoons.json";

var preview = function (projectFolder) {

	// Read the config file cocoons.json
	var config = readConfig(projectFolder);
	log.info("Start Cocoons.io from the directory : " + config.dirname);

	// Create the preview engine
	var engine     = require(config.previewEngine);
	var preview = new engine.Preview(config);

	// Init & start Express
	var app = express();
	app.use(bodyParser());
	app.use(favicon(config.dirname + "/" + config.favicon));
	app.set('views', config.dirname + "/" + config.templateFolder);
	app.set('view engine', config.templateEngine);

	app.get("/*",  function(req, res) {
		console.log("GET : " + req.url);
		preview.get(req, res);
	});


	app.listen(config.port);
	console.log('Cocoons.io is running on port ' + config.port);

}

var readConfig = function(projectFolder) {

		if (! projectFolder) {
			projectFolder = process.cwd();
		}
		else {
			projectFolder = process.cwd() + "/" + projectFolder;
		}
		var configFile = projectFolder + CONFIG_FILE;
		var config = jsonFile.readFileSync(configFile);

		config.dirname = projectFolder;

		return config;

}


// Export in order to use Cocoons.io as an exectuable (npm global)
exports.preview = preview;
