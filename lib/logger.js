var winston = require("winston");
var fs = require('graceful-fs');

fs.mkdir('./logs', function(err) {
    if (err && err.code != "EEXIST") {
    	throw err;
    };
});


var customLevels = {
  levels: {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  },
  colors: {
    debug: 'blue',
    info: 'green',
    warn: 'yellow',
    error: 'red'
  }
};

//create the main logger
var Logger = new(winston.Logger)({
    level: 'debug',
    levels: customLevels.levels,
    transports: [
        // setup console logging
        new(winston.transports.Console)({
            level: 'info', // Only write logs of info level or higher
            levels: customLevels.levels,
            colorize: true
        }),

        // setup debug to file
        new(winston.transports.File)({
            filename: './logs/debug.log',
            maxsize: 1024 * 1024 * 10, // 10MB,
            maxFiles: 50,
            level: 'debug',
            levels: customLevels.levels,
            handleExceptions: true,
            json : false
        })

    ]
});

/*
var init = function(config) {
  if ()

}

var getLogger() {
  return Logger;
}


module.exports.init = init;
module.exports.getLogger = getLogger;
*/

module.exports.Logger = Logger;
