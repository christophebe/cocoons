var fs      = require('graceful-fs');
var jade    = require('jade');
var log     = require('./logger.js').Logger;

JSON.minify = JSON.minify || require("node-json-minify");

var MD_EXTENSION = ".md";
var JSON_EXTENSION = ".json";
var HTML_EXTENSION = '.html';
var JADE_EXTENSION = '.jade';

var isJadeFile = function(path) {
    return path.indexOf(JADE_EXTENSION, this.length - JADE_EXTENSION.length) !== -1;
}

var isHTMLFile = function(path) {
    return path.indexOf(HTML_EXTENSION, this.length - HTML_EXTENSION.length) !== -1;
}

var isMarkdownFile = function(path) {
    return path.indexOf(MD_EXTENSION, this.length - MD_EXTENSION.length) !== -1;
}

var isJsonFile = function(path) {
    return path.indexOf(JSON_EXTENSION, this.length - JSON_EXTENSION.length) !== -1;
}

/**
 * Read a json file asynchronously
 * Support comments in the file
 *
 * @param the json file path
 * @param callback(error, json)
 *
 */
var readJsonFile = function (jsonPath, callback) {


    fs.readFile(jsonPath, "utf-8", function (error, data) {
      if (error) {
        callback(error);
        return;
      }
      try {
        var json = JSON.parse(JSON.minify(data));
        callback(null, json);

      } catch (e) {
        callback(new Error("Impossible to parse the json file : " + jsonPath + " - error : " + e));
      }
    });

}

var convertToJson = function (jsonString) {

  try {
    return JSON.parse(jsonString);
  } catch (e) {
    log.error("Impossible to parse the json file : " + jsonPath + " - error : " + e);
    return null;
  }


}

var compileJade = function(jadeFile, callback) {

    fs.readFile(jadeFile, 'utf8', function(error, fileContent) {

        if (error) {
          callback(new Error("Error during reading the jade template file : " + jadeFile + " : " + error));
          return;
        }
        var template = jade.compile(fileContent);
        callback(null, template);

    });
}

module.exports.readJsonFile = readJsonFile;
module.exports.convertToJson = convertToJson;
module.exports.isMarkdownFile = isMarkdownFile;
module.exports.compileJade = compileJade;
module.exports.isJsonFile = isJsonFile;
module.exports.isHTMLFile = isHTMLFile;
module.exports.isJadeFile = isJadeFile;

module.exports.MD_EXTENSION = MD_EXTENSION;
module.exports.JSON_EXTENSION = JSON_EXTENSION;
module.exports.HTML_EXTENSION = HTML_EXTENSION;
module.exports.JADE_EXTENSION = JADE_EXTENSION;
