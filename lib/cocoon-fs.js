var fs           = require('fs');
var mime         = require('mime');
var URI			     = require('URIjs');
var S            = require('string');
var markdownPage = require('./markdown-page.js');
var marked       = require('marked');


var Preview = function (config) {
    //this.attributes
    this.config = config;

    this.get = function(req, res) {
        var path = this.config.source + req.url;

        //TODO : Rewrite this code with async
        fs.exists(path, function (exists) {

            if (exists) {
                fs.stat(path,function(error, stats) {

                  // If the file exists => send it to the client
                  if (stats.isFile()) {
                      this.renderStaticFile(path, res);
                  }
                  else {
                      //TODO : do we have to manage a directory ?
                      this.renderError(new Error("path exists but this is not a file"), res);
                  }

                });
            }
            else {
                console.log("Path (file or directory) not found : " + path);

                // Make a try to find a markdown content
                var uri = URI(req.url);
                if (uri.suffix() == "html") {

                  var newPath = S(path).replaceAll(".html", ".md").s;
                  console.log("Try to find a markdown file based on url : " + req.url + " => " + newPath);
                  fs.exists(newPath, function(exists) {
                    if (exists) {
                        console.log("Markdown file found : " + newPath);
                        this.renderMarkdown(newPath, res);
                    }
                    else {
                      //TODO : custom plugin ?
                      console.log("Markdown file not found : " + newPath);
                      this.render404(res);
                    }
                  });

                }
                else {

                  //TODO : custom/plugin for a url without .html ?
                  this.render404(res);
                }
            }

        });

    };

    renderMarkdown = function(file, res) {

      markdownPage.buildFromFile(file, function(error, page){

          if (error) {
            renderError(error, res);
            return;
          }

          //Convert markdown into html
          page.content = marked(page.content)	;

          res.render(page.properties.template, { "page" : page});
      });

    }

    renderStaticFile = function (path, res) {
      var mimeType = mime.lookup(path);
      console.log("mimeType : " + mimeType);
      res.header("Content-Type", mimeType);
      res.sendfile(path);

    }

    renderError = function(error, res) {
      res.status(500).send("Error when retrieving the page : " + error );
    }

    render404 = function(res) {
      res.status(404).send('Page not found');
    }

};

module.exports.Preview = Preview;
