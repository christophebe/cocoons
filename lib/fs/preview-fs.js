var fs           = require('graceful-fs');
var _            = require('underscore');
var pt           = require('path');
var mime         = require('mime');
var jade         = require('jade');
var async        = require('async');
var markdownPage = require('./markdown-page.js');
var widgetRenderer = require('./widget-fs.js')
var log          = require('../logger.js').Logger;
var util         = require('../util.js');

var defaultMarkdownRender = "./bootstrap-markdown-render.js";
var markdownRender = null; // load from the config (cocoons.js)

var defaultCloakingEngine = "./cloaking-engine.js";
var cloakingRules = null; // load from the config (cocoons.js)


/**
 * Preview the content that is stored in the file system
 *
 * @param the config objectif matchin to the cocoons.json file
 *
 */
function Preview (config) {

    this.config = config;

    //----------------------------------------------------
    // Create the markdown engine
    //----------------------------------------------------
    if (! config.markdownRender) {
      config.markdownRender = defaultMarkdownRender;
    }
    markdownRender = require(config.markdownRender);

    //----------------------------------------------------
    // Create the cloaking engine
    //----------------------------------------------------
    if (! config.cloakingEngine) {
      config.cloakingEngine = defaultCloakingEngine;
    }

    var cloakingEngine = require(config.cloakingEngine);
    cloakingRules = new cloakingEngine.CloakingRules(config);

    //----------------------------------------------------
    // init the widget template cache
    //----------------------------------------------------
    widgetRenderer.init(config);

}

/**
 * Retrieve a content (page, images, css, json, ..)
 *
 * @param the Express request
 * @param the Express response
 *
 */
Preview.prototype.get = function(req, res) {

        //log.info("[" + (req.headers['x-forwarder-for'] || req.connection.remoteAddress)  +"] :" +
        //          req.url + " - " + req.headers['user-agent'] + " ip : " + req.ip + " ips : " + req.ips);
        var logAccess = "[" + req.ip  +"] :" + req.url + " - " + req.headers['user-agent'] + " - ";

        if (this.config.useProxy){
          logAccess += " ips : " + req.ips;
        }

        log.info(logAccess);

        var that = this;
        this.getFilePath(req, res, function(error, path){

            if (error) {
              this.renderError(error, res);
            }

            // if path == "" => redirect made previously
            if (path == "") {
              return;
            }

            log.debug("Request made for file: " + path);

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
                    log.debug("Path (file or directory) not found : " + path);

                    // Make a try to find a markdown content
                    var extension = pt.extname(path);
                    if (extension == util.HTML_EXTENSION) {

                      var newPath = path.replace(util.HTML_EXTENSION, util.MD_EXTENSION);
                      log.debug("Try to find a markdown file based on url : " + req.url + " => " + newPath);
                      fs.exists(newPath, function(exists) {
                        if (exists) {
                            log.debug("Markdown file found : " + newPath);
                            that.renderMarkdown(newPath, res);
                        }
                        else {
                          //TODO : custom plugin ?
                          log.debug("Markdown file not found : " + newPath);
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


        });


    };


/**
 * Return the absolute path of the file to response to the browser
 *
 * @param
 * @returns
 */
Preview.prototype.getFilePath = function(req, res, callback) {

  var that = this;
  cloakingRules.extractPath(req, res, function(error, relativePath) {

     if (error) {
       callback(error);
       return;
     }

     // If relativePath =="" => probably a redirect made by the Cloaking Engine
     if (relativePath == ""){
        callback(null, "");
        return;
     }

     var path = that.config.dirname + "/" + that.config.source;
     path += (relativePath === "/") ? that.getHomePage(res) : relativePath;

     callback(null, path) ;

  });

}



/**
 * Render & send to the client a static file (html, images, ...)
 *
 * @param the path of the static file to render
 * @param the Express response
 *
 */
Preview.prototype.renderStaticFile = function (path, res) {
  var mimeType = mime.lookup(path);
  res.header("Content-Type", mimeType);
  res.sendFile(path);

}

/**
 *  Get the url of the home page (eg. /index.html)
 *
 * @param the Express response
 * @returns the home page url
 */
Preview.prototype.getHomePage = function(res) {
  if (this.config.homePage) {
    return "/" + this.config.homePage;
  }
  else {
    //TODO : add list of articles even if Blogging sucks ;-) ?
    render404(res);
  }
}

/**
 * Render into HTML & send to the client a markdown file
 *
 * This method also render the widget that are present in the template.
 *
 * @param the markdown file
 * @param the Express response
 */
Preview.prototype.renderMarkdown = function(file, res) {

  var that = this;

  markdownPage.buildFromFile(file, function(error, page){

      if (error) {
        that.renderError(error, res);
        return;
      }

      var params = {
          "page" : page,
          "config" : that.config
      };

      widgetRenderer.renderWidgets(params, function(error, htmlWidgets){
          if (error) {
            that.renderError(error, res);
          }
          else {
            params.widgets = htmlWidgets;
            page.content = new markdownRender.HTMLRenderer(params).renderToHTML(page.content);

            if (! page.properties.template) {
              log.warn("Use the default template : " + that.config.defaultTemplate);
              page.properties = {
                 "template": that.config.defaultTemplate
              }
            }

            res.render(page.properties.template, params );
          }

      });

  });

}

/**
 * Render an 500/error page
 *
 * @param the error
 * @param the Express response
 *
 */
Preview.prototype.renderError = function(error, res) {
  //TODO : use a jade template
  res.status(500).send("Error when retrieving the page : " + error );
}

/**
 * Render an 404 page
 *
 * @param the Express response
 *
 */
Preview.prototype.render404 = function(res) {
  //TODO : use a jade template
  res.status(404).send('Page not found');
}


module.exports.Preview = Preview;
