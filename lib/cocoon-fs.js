var fs           = require('fs');
var mime         = require('mime');
var URI			     = require('URIjs');
var S            = require('string');
var markdownPage = require('./markdown-page.js');
var marked       = require('marked');


function Preview (config) {
    //this.attributes
    this.config = config;
}


Preview.prototype.get = function(req, res) {

        var path = this.config.source + req.url;

        if (req.url === "/") {
            path = this.config.source + this.getHomePage(res);
        }

        var that = this;

        //TODO : Rewrite this code with async
        fs.exists(path, function (exists) {

            if (exists) {
                fs.stat(path,function(error, stats) {

                  // If the file exists => send it to the client
                  if (stats.isFile()) {
                      that.renderStaticFile(path, res);
                  }
                  else {
                      //TODO : do we have to manage a directory ?
                      that.renderError(new Error("path exists but this is not a file"), res);
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
                        that.renderMarkdown(newPath, res);
                    }
                    else {
                      //TODO : custom plugin ?
                      console.log("Markdown file not found : " + newPath);
                      that.render404(res);
                    }
                  });

                }
                else {

                  //TODO : custom/plugin for a url without .html ?
                  that.render404(res);
                }
            }

        });

    };

Preview.prototype.renderStaticFile = function (path, res) {
  var mimeType = mime.lookup(path);
  res.header("Content-Type", mimeType);
  res.sendfile(path);

}

Preview.prototype.getHomePage = function(res) {
  if (this.config.homePage) {
    return this.config.homePage;
  }
  else {
    //TODO : add list of articles even if Blogging sucks ?
    render404(res);
  }
}

Preview.prototype.renderMarkdown = function(file, res) {

  var that = this;
  markdownPage.buildFromFile(file, function(error, page){

      if (error) {
        renderError(error, res);
        return;
      }

      //Convert markdown into html
      page.content = marked(page.content)	;

      res.render(page.properties.template, { "page" : page, "config" : that.config });
  });

}

Preview.prototype.renderError = function(error, res) {
  //TODO : use a jade template
  res.status(500).send("Error when retrieving the page : " + error );
}

Preview.prototype.render404 = function(res) {
  //TODO : use a jade template
  res.status(404).send('Page not found');
}



module.exports.Preview = Preview;
