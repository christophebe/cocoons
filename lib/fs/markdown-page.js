var fs      = require('graceful-fs');
var async   = require('async');
var log     = require('../logger.js').Logger;
var util    = require("../util.js");



/**
 *  Read a markdown file & its associated json file.
 *
 *  The json file contains the page properties.
 *  It could the title & the description or specific application properties.
 *
 *
 *  @param the path of the markdown file
 *  @param callback(error, page)
 *q
 *  the method callback returns a object page that contains the content & the page properties :
 *
 *  var page = {
 *    properties, // all attributes found in the .json property file
 *    content     // The content in the markdown format
 *  };
 *
 */
var buildFromFile = function(file, endCallback) {

    async.parallel([
        function(callback){
          fs.readFile(file, "utf-8", function(error, data) {

              if (error) {
                callback(new Error("Impossible to read the markdown file : " + file + " - error : " + error));
                return;
              }

              callback(null,data);
          });
        },
        function(callback){

            var propsFile = file.replace('.md', '.json');
            util.readJsonFile(propsFile, function (error, jsonProps){
                if (error) {
                  // if the file doesn't exist or if there is an error when reading the file
                  // => log a warning & set the property list to empty
                  log.warn("Impossible to read the property file for markdown content : " +
                            propsFile + " - error : " + error );
                  callback(null, {});
                  return;
                }
                callback(null, jsonProps);
            })

        }],

        function(error, results){

            if (error) {
              endCallback(error);
              return; 
            }
            var page = {
              content : results[0],
              properties : results[1]

            };
            page.properties.file = file;

            endCallback(null, page);
        }
    );

}

module.exports.buildFromFile = buildFromFile;
