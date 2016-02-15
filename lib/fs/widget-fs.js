var fs    = require("fs");
var jade  = require('jade');
var async = require('async');
var _     = require('underscore');
var Map   = require("collections/map");
var log   = require('../logger.js').Logger;
var util  = require('../util.js');

var widgetCache = null;
var widgetConfig = null;

/**
 *  Generate the HTML code for the different widgets.
 *  This is mainly used when the engine (preview or generate) is rendering a markdown page.
 *
 *  @params {json} : a json structure that contains the following attributes :
 *        - page   : information on the page (attributes & content)
 *        - config : the cocoons.io config info (matching to the file cocoons.json)
 *
 *
 *  @params callback(error,widgets) : callback used to return asynchronously the result of the generated widgets
 */
var renderWidgets = function(params, endCallback) {

    var that = this;
    var widgets = {};


    async.each(params.config.widgets,
      function(regionWidgets, callback) {
          //log.debug("Render HTML for widgets in region : " + regionWidgets.region);
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

/**
 * Render all widgets for one template region
 *
 * @param params that will used by the templates
 * @param the widget list
 * @param callback(error, widgetHTML) - widgetHTML is an array of String (HTML code)
 */
var renderWidgetsForRegion = function(params, regionWidgets, endCallback) {
    var regionHTML = [];

    async.each(regionWidgets.widgets,
      function(widget, callback) {
          var useThisWidget = true;
          if (widget.urls) {
              console.log("params.url.match(widget.urls)", params.url, params.url.match(widget.urls));
              useThisWidget = params.url.match(widget.urls) !== null;
          }
          if (useThisWidget) {
            var htmlCode = renderHTML(params, widget);
            regionHTML.push({order : widget.order, html : htmlCode});
          }

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

/**
 * Render a widget into HTML
 *
 * This method has to synchronous because is used by the marked component that
 * do not support asynchronous process
 *
 * @param params that will used by the templates
 * @param the widget to render
 * @returns the HTML code
 */
var renderHTML = function(params, widget) {


  if (! widgetCache) {
    var error = "Impossible to generate the widget. Widget cache is not defined";
    log.error(error);
    return error;
  }

  if (util.isHTMLFile(widget.name)) {
    return widgetCache.get(widget.name);
  }

  if (util.isJadeFile(widget.name)) {
    var template = widgetCache.get(widget.name);
    if (template) {
        params.widget = widget;
        return template(params);
    }
    else {
      log.error("The widget " + widget.name +  " doesn't exist !");
      return "ERROR : " + "The widget " + widget.name +  " doesn't exist !"
    }

  }


}


// ---------------------------------------------------------------------------
//  The following methods can be used to create a cache of widgets.
//  If the widget is in HTML, the HTML code will add directly in the cache map.
//  If the widget is a jade template, the compiled version will be added in the cache map.
//
//  If the preview mode is running with nodemon, the cache is refreshed when a
//  template file is modified (with the nodemon options : -e js,json,jade)
//
//  Otherwise it is possible to call the watchWidgetDirectory when the preview
//  engine is starting
//
// ----------------------------------------------------------------------------

/**
 * Init the widget cache
 *
 * @param the cocoon config that match to the cocoons.json file
 *
 */
var init = function(config) {
    widgetConfig = config;
    refreshTemplateCache(config);
    // Watching widget directory is not necessary
    // if we used nodemon for the preview mode
    //watchWidgetDirectory();
}

/**
 * Refresh the widget cache which is a map.
 * the key of this map is the widgetname.
 *
 * @param the cocoon config that match to the cocoons.json file
 *
 */
var refreshTemplateCache = function(config) {

    var that = this;
    readWidgetDirectory(config, function(error, result){
        if (error) {
          log.error("Impossible to compile the widgets : " + error);
        }
        widgetCache = result;
        widgetCache.keys().forEach(function(key){
          log.debug("Widget found & compiled: " + key);
        });
    });


}

/**
 * Read the files into widget directory
 *
 * @param the cocoon config that match to the cocoons.json file
 * @param callback(error, htmlWidgets)
 *        htmlWidgets is an array of widgets (HTML or jade compile code) to set into the cache
 */
var readWidgetDirectory = function(config, callback) {

    var dir = config.dirname + "/" + config.widgetFolder;
    log.debug("Read widgets from the directory : " + dir);
    fs.exists(dir, function (exists) {
        if (!exists) {
          callback(new Error("The widget directory " + dir + " does not exist"));
        }
        else {
          readWidgets(config, dir, callback);
        }

    });

}

/**
 * Read the widgets
 *
 * @param the cocoon config that match to the cocoons.json file
 * @param the widget directory
 * @param callback(error, htmlWidgets)
 *        htmlWidgets is an array of widgets (HTML or jade compile code) to set into the cache
 */
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

            // If the widget is not a jade or HTML file => just an error message
            log.error("Invalid widget file : " + file + ". This widget will be ignored.");
            callback();

          },

          function(error) {

              if (error) {
                endCallback(error);
              }
              endCallback(null, widgetList);
          });

    });

}

/**
 * Compile a jade template
 *
 * @param the jade template matching to the widget
 * @param(error, compiledTemplate)
 */
var compileWidget = function(widgetFile, callback) {

  util.compileJade(widgetFile, function(error, template){
    callback(error, template);
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
