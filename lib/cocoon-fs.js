var fs           = require('fs');
var pt           = require('path');
var mime         = require('mime');
var marked       = require('marked');
var jade         = require('jade');
var async        = require('async');
var markdownPage = require('./markdown-page.js');
var widgetRender = require('./widget-fs.js')
var log          = require('./logger.js').Logger;
var util         = require('./util.js');


function Preview (config) {
    //this.attributes
    this.config = config;

}

Preview.prototype.get = function(req, res) {

        var path;
        if (req.url === "/") {
            path = this.config.dirname + "/" + this.config.source + this.getHomePage(res);
        }
        else {
          path = this.config.dirname + "/" + this.config.source + req.url;

        }
        log.debug("Path file to check : " + path);

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
                log.info("Path (file or directory) not found : " + path);

                // Make a try to find a markdown content
                var extension = pt.extname(path);
                if (extension == util.HTML_EXTENSION) {

                  var newPath = path.replace(util.HTML_EXTENSION, util.MD_EXTENSION);
                  log.info("Try to find a markdown file based on url : " + req.url + " => " + newPath);
                  fs.exists(newPath, function(exists) {
                    if (exists) {
                        log.info("Markdown file found : " + newPath);
                        that.renderMarkdown(newPath, res);
                    }
                    else {
                      //TODO : custom plugin ?
                      log.info("Markdown file not found : " + newPath);
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
        that.renderError(error, res);
        return;
      }

      page.content = marked(page.content);

      if (! page.properties.template) {
        log.warn("Use the default template : " + that.config.defaultTemplate);
        page.properties = {
           "template": that.config.defaultTemplate
        }
      }

      params = {
          "page" : page,
          "config" : that.config
      };

      widgetRender.renderWidgets(params, function(error, htmlWidgets){
          if (error) {
            that.renderError(error, res);
          }
          else {
            params.widgets = htmlWidgets;
            res.render(page.properties.template, params );
          }

      });

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
