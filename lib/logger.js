//var winston = require("winston");
var bunyan = require('bunyan');
var fs = require('graceful-fs');

var logFolder = process.cwd() + "/logs";
var debugLogFile = logFolder + '/debug.log';


fs.mkdir(logFolder, function(err) {

    if (err && err.code != "EEXIST") {
    	throw err;
    };
});

// Levels : trace, debug, info, warn, error

var Logger = bunyan.createLogger({
  name: 'cocoons',
  streams: [
    {
      level: 'info',
      stream: process.stdout
    },
    {
      level: 'debug',
      path: debugLogFile
    }
  ]
});

console.log("Cocoons log file " + debugLogFile);


module.exports.Logger = Logger;
