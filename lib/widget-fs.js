var fs    = require("fs");
var jade  = require('jade');
var async = require('async');
var _     = require('underscore');
var log   = require('./logger.js').Logger;
var util  = require('./util.js');

//var Map   = require("collections/map"); Only used for the template cache

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
          log.debug("Render HTML for widgets : " + regionWidgets.widgets + " for region : " + regionWidgets.region);
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
          renderHTML(params, widget, function(error, htmlCode){
            if (error) {
              callback(error);
              return;
            }
            regionHTML.push({order : widget.order, html : htmlCode});
            callback();
          });

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

var renderHTML = function(params, widget, callback) {

  var widgetFile = params.config.dirname + "/" + params.config.widgetFolder + "/" + widget.name;
  if (util.isHTMLFile(widgetFile)) {
      fs.readFile(widgetFile, 'utf8', function(error, data) {
          if (error) {
            callback(new Error("Error during reading the widget : " + error));
            return;
          }
          callback(null, data);

      });

  }

  if (util.isJadeFile(widgetFile)) {
    compileWidget(widgetFile,function(error, template){
        if (error) {
          callback(error);
          return;
        }
        params.widget = widget;
        callback(null, template(params));
    });

  }

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

// ---------------------------------------------------------------------------
//  The following methods can be used to create a cache of
//  compiled templates.
//
//  This solution is not yet necessary because the performances are good
//  If later, we decide to use this cache, we need to refresh the cache
//  when a widget file is modified.
// ----------------------------------------------------------------------------
/*
var init = function(config) {
    var that = this;
    compileWidgets(config, function(error, widgetTemplates){
        if (error) {
          log.error("Impossible to compile the widgets : " + error);
        }
        that.widgetTemplates = widgetTemplates;
        widgetTemplates.keys().forEach(function(key){
          log.info("Widget found & compiled : " + key);
        });
    });
}

var compileWidgets = function(config, callback) {

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
            var widgetFile = dir + "/" + file;
            compileWidget(widgetFile, function(error, widgetTemplate){
                if (error) {
                    callback(error);
                    return;
                }

                widgetList.set(file, widgetTemplate);
                callback();
            })
          },

          function(error) {

              if (error) {
                endCallback(error);
              }
              endCallback(null, widgetList);
          });

    });

}


var getHTMLContents = function(params, templateList) {
  var htmlContents = [];

  for (i=0; i<templateList.length; i++) {
    var widgetTemplate = this.widgetTemplates.get(templateList[i]);
    htmlContents.push(widgetTemplate(params));
  }
  return htmlContents;
}



module.exports.init = init;
module.exports.getHTMLContents = getHTMLContents;
*/

module.exports.renderWidgets = renderWidgets;
