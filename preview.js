var express    = require('express');
var bodyParser = require('body-parser');
var favicon    = require('serve-favicon');
var jsonFile   = require('jsonfile');


// Read the config file required by a cocoons.io application
var configFile = "./cocoons.json";
var config = jsonFile.readFileSync(configFile);

var engine = require(config.engine);
var preview = new engine.Preview(config);

var app = express();

app.use(bodyParser());
//app.use(express.static(__dirname + config.source));
app.use(favicon(__dirname + config.favicon));
app.set('views', __dirname + config.templateFolder);
app.set('view engine', config.templateEngine);

app.get("/*",  function(req, res) {
	console.log("GET : " + req.url);
	preview.get(req, res);
});


app.listen(config.port);
console.log('Cocoon.io is running on port ' + config.port);
