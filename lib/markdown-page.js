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
 */

var S  = require('string');
var fs = require('fs');

var PROPERTY_BLOCK = "---";


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
var buildFromFile = function(file, callback) {
    fs.readFile(file, function(error, data) {
      if (error) {
        callback(new Error("Impossible to read the markdown file : " + file + " error : " + error));
        return;
      }
      var lines = data.toString().split('\n');
      buildFromArray(lines, callback);
    });

}

var buildFromArray = function(fileLines, callback) {

    var page = {
      properties : [],
      content : ""
    };


    if (fileLines.length == 0) {
        callback(new Error("The markdown file is empty"));
        return;
    }
    if (! S(fileLines[0]).startsWith(PROPERTY_BLOCK)) {
        callback(new Error("Invalid markdown file format : the first line of the file does not start with '---' : " + fileLines[0]));
        return;
    }

    // Loop on properties, the line format for properties is :
    // propertyName:value
    var i = 1;
    while (! S(fileLines[i]).startsWith(PROPERTY_BLOCK)) {
        //console.log("Get property line : " + fileLines[i]);
        var line = fileLines[i].split(":");

        if (line.length != 2) {
          callback(new Error("Invalid markdown file : Incorrect format for property line. It should be = propertyName:value - " + fileLines[i]));
          return;
        }
        page.properties[S(line[0]).replaceAll(" ", "").s] = S(line[1]).trimLeft().s;
        i++;

    }

    //Check if there is content after the properties
    if (++i == (fileLines.length-1)) {
      callback(new Error ("There is no content in the markdown file"));
      return;
    }

    // Get the content, it should be place after the properties & the line with "---"
    page.content = fileLines.slice(i).join("\n");

    callback(null, page);


};

module.exports.buildFromFile = buildFromFile;
module.exports.buildFromArray = buildFromArray;
