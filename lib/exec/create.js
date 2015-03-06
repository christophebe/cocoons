var pt    = require('path');
var ncp   = require('ncp').ncp;
var async = require('async');
var log   = require('../logger').Logger;

var TEMPLATE_SITE_FOLDER = "site-templates/";
var DEFAULT_SITE =  TEMPLATE_SITE_FOLDER + 'basic';

var DEFAULT_WIDGET_FOLDER = 'widgets';
var TEMPLATE_DEFAULT_WIDGET_FOLDER = TEMPLATE_SITE_FOLDER + DEFAULT_WIDGET_FOLDER;


/**
 * Public method of this component.
 * Create a new web site in the current directory.
 * The creation of a new site is based on a template that match to a folder
 * By default, we use the DEFAULT_SITE folder.
 *
 * the content of this template folder is copying inside the folder used
 * for the new web site (current directory).
 *
 * @param the name of the site template to used for creating the new website
 * @param callback(error)
 */
var createSite = function(siteTemplateName, websiteFolder, endCallback) {

  // By default the site is created in the current folder
  if (! websiteFolder){
    websiteFolder = process.cwd();
  }

  var options = {
    filter : function(name) {
        return name.indexOf("target") < 0;
    },
    clobber : false

  }
  log.debug("Create a new web site in the folder : " + websiteFolder);

  async.parallel([

      // Copy the site template directory
      function(callback) {

        var siteTemplateFolder = pt.resolve(__dirname, '../..', siteTemplateName ? TEMPLATE_SITE_FOLDER + siteTemplateName : DEFAULT_SITE);
        log.debug("Use site template in : " + siteTemplateFolder);

        ncp(siteTemplateFolder, websiteFolder, options, function (error) {
           callback(error);
        });


      },

      // Copy the widget folder
      function(callback){

        var widgetTemplateFolder = pt.resolve(__dirname, '../..', TEMPLATE_DEFAULT_WIDGET_FOLDER);
        log.debug("Use widget templates in : " + widgetTemplateFolder);
        ncp(widgetTemplateFolder, websiteFolder + "/" + DEFAULT_WIDGET_FOLDER, options, function (error) {
           callback(error);
        });


      }
    ],

    function(error, results){
        if (error) {
          log.debug("Error during the creation of the site : " + error);
        }
        endCallback(error, websiteFolder);
    });

}


exports.createSite = createSite;
