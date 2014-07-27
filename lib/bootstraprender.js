var marked  = require('marked');

var renderer = new marked.Renderer();

renderer.table= function (header, body) {
                    return "<table class='table table-striped table-bordered'>\n"
                      + '<thead>\n'
                      + header
                      + '</thead>\n'
                      + '<tbody>\n'
                      + body
                      + '</tbody>\n'
                      + '</table>\n';


}

/*
renderer.code = function (code, language) {

                  console.log("language : " +  language);
                  console.log("code : " +  code);


}
*/


var renderToHTML = function (markdownContent) {

  return marked(markdownContent, {renderer : renderer});
}

module.exports.renderToHTML = renderToHTML;
