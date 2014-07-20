/**
 *  This component read a markdown file to extract properties & content
 *  This is used by the markdown renderer to generate HTML pages
 *  The markdown file has to follow the following structure :
 *  ---
 *  property1:value
 *  property2:value
 *  ---
 *  Main content in the markdown format
 *
 *  Usual properties are :
 *  title : the title attribute of the HTML page
 *  description :  the meta description of the HTML page
 *  h1 : the main page title
 *  template : the jade template used to generate the HTML code
 *
 *  The jade templates have to check if thoses attributes exists or not.
 */

//var S  = require('string');
var fs = require('fs');
var async = require('async');
var log = require('./logger.js').Logger;


/**
 *  Read a markdown file that have some properties and return the following
 *  json by using a callback  :
 *
 * var page = {
 *    properties : [], // index match to the property names
 *    content : ""     // The content in the markdown format
 * };
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
            log.info("Try to find property file for markdown content : " + propsFile);
            fs.readFile(propsFile, "utf-8", function(error, data) {

                if (error) {
                  log.warn("Impossible to read the property file for markdown content : " +
                            propsFile + " - error : " + error );
                  callback(null, {});          
                  return;
                }

                try {

                  var properties = JSON.parse(data);
                  callback(null,properties);

                } catch (e) {

                  log.warn("Impossible to parse the property file for markdown content : " +
                            propsFile + " - error : " + e);
                  callback(null, {});
                }
            });
        }],

        function(error, results){

            if (error) {
              endCallback(error);
            }
            var page = {
              content : results[0],
              properties : results[1]

            };


            endCallback(null, page);
        }
    );

}

module.exports.buildFromFile = buildFromFile;
