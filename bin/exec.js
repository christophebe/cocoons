#!/usr/bin/env node

var preview  = require('../lib/exec/preview.js');
var generate = require('../lib/exec/generate.js');
var deploy   = require('../lib/exec/deploy-ftp.js');
var create   = require('../lib/exec/create.js');
var mindmap  = require ('../lib/exec/mindmap.js');
var log      = require('../lib/logger').Logger;

/**
 * Global application (command line) used to  :
 * - create    : create a new empty site,
 * - mindmap   : create a new site structure & content based on a mindmap,
 * - preview   : preview the site on localhost,
 * - generate  : generate html pages & other artifacts,
 * - ftp       : deploy a web site
 *
 */
if ( process.argv.length < 3 ) {
   log.error('Usage: cocoons [create|preview|generate|ftp|mindmap]\n');
   return;
}

switch (process.argv[2]) {

      case "create":
          var siteTemplateName;

          if (process.argv.length == 4) {
            siteTemplateName = process.argv[3];
          }
          create.createSite(siteTemplateName, function(error, status) {
              if (error) {
                log.error("Error during the creation of the site : " + error );
              }
              else {
                log.info("The site is correctly created : " + status);
              }
          });
          break;

      case "mindmap" :
          var mindmapFile;

          if (process.argv.length == 4) {
            mindmapFile = process.argv[3];
          }
          else {
            log.error('Usage: cocoons mindmap [pathToMindmapFile]\n');
            return;
          }

          mindmap.generateFromMindmap(mindmapFile,function(error, folder){
              if (error) {
                log.error("Error during the generation of the pages from the mindmap : " + error );
              }
              else {
                log.info("The pages are correctly generated from the mindmap in the folder : " + folder);
              }
          });

          break;

      case "preview":
          var projectFolder;

          if (process.argv.length == 4) {
            projectFolder = process.argv[3];
          }
          preview.previewSite(projectFolder);
          break;

      case "generate":
          generate.generateSite(function(error, targetFolder) {
              if (error) {
                log.error("Error during the generation of the site : " + error );
              }
              else {
                log.info("The site is correctly generated in " + targetFolder);
              }
          });
          break;

      case "ftp" :
          deploy.deploySite(function(error, serverInfo){
              if (error) {
                log.error("Error during the deployment of the site : " + error );
              }
              else {
                log.info("The site is correctly deployed in " + serverInfo);
              }
          });
          break;

      default:
          log.error("Invalid command, use : cocoons [create|mindmap|preview|generate|deploy]");
          break;
}
