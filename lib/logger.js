//var winston = require("winston");
var bunyan = require('bunyan');
var fs = require('graceful-fs');

fs.mkdir('./logs', function(err) {
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
      path: './logs/debug.log'
    }
  ]
});

module.exports.Logger = Logger;
