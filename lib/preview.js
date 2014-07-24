var express    = require('express');
var bodyParser = require('body-parser');
var favicon    = require('serve-favicon');
var jsonFile   = require('jsonfile');
var engine     = require('./cocoon-fs.js');



// Read the config file required by a cocoons.io application
var preview = function () {

	var configFile = process.cwd() + "/cocoons.json";
	var config = jsonFile.readFileSync(configFile);

	config.dirname = process.cwd();


	var preview = new engine.Preview(config);

	var app = express();

	app.use(bodyParser());
	//app.use(express.static(__dirname + config.source));
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

// Export in order to use Cocoons.io as an exectuable (npm global)
exports.preview = preview;
