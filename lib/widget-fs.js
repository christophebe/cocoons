var fs    = require("fs");
var jade  = require('jade');
var async = require('async');
var _     = require('underscore');
var log   = require('./logger.js').Logger;
var util  = require('./util.js');
var Map   = require("collections/map");

var widgetCache = null;
var widgetConfig = null;

/**
 *  Generate the HTML code for the different widgets.
 *  This is mainly used when the engine is generated a markdown page.
 *
 *  @params {json} : a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 *
 *
 *  @params fn(error,widgets) : callback used to return asynchronously the result of the generated widget
 */
var renderWidgets = function(params, endCallback) {

    var that = this;
    var widgets = {};

    async.each(params.config.widgets,
      function(regionWidgets, callback) {
          log.debug("Render HTML for widgets in region : " + regionWidgets.region);
          renderWidgetsForRegion(params, regionWidgets, function(error, regionHTML){
              if(error) {
                callback(error);
                return;
              }
              widgets[regionWidgets.region] = regionHTML;
              callback();
          });

      },
      function(error){
        if (error) {
          endCallback(error);
        }
        else {

          endCallback(null, widgets);
        }
      });

}

var renderWidgetsForRegion = function(params, regionWidgets, endCallback) {
    var regionHTML = [];

    async.each(regionWidgets.widgets,
      function(widget, callback) {
          var htmlCode = renderHTML(params, widget);
          regionHTML.push({order : widget.order, html : htmlCode});
          callback();

      },
      function(error) {
          if (error) {
            endCallback(error);
          }
          else {
            endCallback(null, _.sortBy(regionHTML, function(widgetHTML){ return widgetHTML.order; }));
          }
      });

}

var renderHTML = function(params, widget) {

  if (! widgetCache) {
    var error = "Widget cache is not defined";
    log.error(error);
    return error;
  }

  if (util.isHTMLFile(widget.name)) {
    return widgetCache.get(widget.name);
  }

  if (util.isJadeFile(widget.name)) {
    var template = widgetCache.get(widget.name);
    params.widget = widget;
    return template(params);
  }

  /*
  log.debug("Render HTML for widget : " + widget.name);
  var widgetFile = params.config.dirname + "/" + params.config.widgetFolder + "/" + widget.name;
  if (util.isHTMLFile(widgetFile)) {
      fs.readFile(widgetFile, 'utf8', function(error, data) {
          if (error) {
            callback(new Error("Error during reading the widget : " + + widget.name + " : " + error));
            return;
          }
          callback(null, data);

      });

  }

  if (util.isJadeFile(widgetFile)) {
    log.debug("Get HTML code for jade template : " + widget.name);
    if (! widgetCache) {
      log.error("Template cache is not defined");

    }
    var template = widgetCache.get(widget.name);
    params.widget = widget;
    callback(null,template(params));

  }
  */

}


// ---------------------------------------------------------------------------
//  The following methods can be used to create a cache of
//  compiled templates.
//
//  The cache is refreshed when a template file is modified
// ----------------------------------------------------------------------------

var init = function(config) {
    widgetConfig = config;
    refreshTemplateCache(config);
    // Watching widget directory is not necessary
    // if we used nodemon for the preview mode
    //watchWidgetDirectory();
}

var refreshTemplateCache = function(config) {

    var that = this;
    readWidgetDirectory(config, function(error, result){
        if (error) {
          log.error("Impossible to compile the widgets : " + error);
        }
        widgetCache = result;
        widgetCache.keys().forEach(function(key){
          log.info("Widget found & compiled: " + key);
        });
    });


}

var readWidgetDirectory = function(config, callback) {

    var dir = config.dirname + "/" + config.widgetFolder;
    log.info("Read widgets from the directory : " + dir);
    fs.exists(dir, function (exists) {
        if (!exists) {
          callback(new Error("The widget directory " + dir + " does not exist"));
        }
        else {
          readWidgets(config, dir, callback);
        }

    });

}

var readWidgets = function (config, dir, endCallback) {
    fs.readdir(dir, function(error, files){

      if (error) {
        endCallback(new Error("Error during reading the widget directory : " + dir + " : " + error));
        return;
      }

      var widgetList = new Map();
      async.each(files,
          function(file, callback) {
            if (util.isHTMLFile(file)) {
              var widgetFile = config.dirname + "/" + config.widgetFolder + "/" + file;
              fs.readFile(widgetFile, 'utf8', function(error, data) {
                  if (error) {
                    callback(new Error("Error during reading the widget : " + file + " : " + error));
                    return;
                  }
                  widgetList.set(file, data);
                  callback();

              });

              return;
            }

            if (util.isJadeFile(file)) {
              var widgetFile = dir + "/" + file;
              compileWidget(widgetFile, function(error, widgetTemplate){
                  if (error) {
                      callback(error);
                      return;
                  }

                  widgetList.set(file, widgetTemplate);
                  callback();
              })
              return;
            }

            callback(new Error("Invalid Widget format for : " + file));
          },

          function(error) {

              if (error) {
                endCallback(error);
              }
              endCallback(null, widgetList);
          });

    });

}

var compileWidget = function(widgetFile, callback) {
    fs.readFile(widgetFile, 'utf8', function(error, data) {
        if (error) {
          callback(new Error("Error during reading the widget : " + error));
          return;
        }
        var template = jade.compile(data);
        callback(null, template);

    });

}

// -----------------------------------------------------------------------------------
// Check if a widget template file has been changed in order to refresh the cache
// important note : 
// Watching widget directory is not necessary if we used nodemon for the preview mode
// -----------------------------------------------------------------------------------

var watchWidgetDirectory = function() {
  var widgetFolder = widgetConfig.dirname + "/" + widgetConfig.widgetFolder;

  fs.watch( widgetFolder, function (event, filename) {
    refreshTemplateCache(widgetConfig);
  });

}


module.exports.init = init;
module.exports.renderWidgets = renderWidgets;
module.exports.renderHTML = renderHTML;
