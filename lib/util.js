var MD_EXTENSION = ".md";
var JSON_EXTENSION = ".json";
var HTML_EXTENSION = '.html';

var isHTMLFile = function(path) {
    return path.indexOf(HTML_EXTENSION, this.length - HTML_EXTENSION.length) !== -1;
}

var isMarkdownFile = function(path) {
    return path.indexOf(MD_EXTENSION, this.length - MD_EXTENSION.length) !== -1;
}

var isJsonFile = function(path) {
    return path.indexOf(JSON_EXTENSION, this.length - JSON_EXTENSION.length) !== -1;
}

module.exports.isMarkdownFile = isMarkdownFile;
module.exports.isJsonFile = isJsonFile;
module.exports.isHTMLFile = isHTMLFile;

module.exports.MD_EXTENSION = MD_EXTENSION;
module.exports.JSON_EXTENSION = JSON_EXTENSION;
module.exports.HTML_EXTENSION = HTML_EXTENSION;
