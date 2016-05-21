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
   console.log('Usage: cocoons [create|preview|generate|ftp|mindmap]\n');
   return;
}

switch (process.argv[2]) {

      case "create":
          var siteTemplateName;

          if (process.argv.length === 4) {
            siteTemplateName = process.argv[3];
          }
          create.createSite(siteTemplateName, null, function(error, status) {
              if (error) {
                console.log("Error during the creation of the site : " + error );
              }
              else {
                console.log("The site is correctly created : " + status);
              }
          });
          break;

      case "mindmap" :

        var config = {};

        if (process.argv.length < 4 || process.argv.length > 6) {
            console.log('Usage: cocoons mindmap [mindmapFile] [pathPrefix] [proxy-file]\n');
            return;
          }

          if (process.argv[3]) {
            config.mindmapFile = process.argv[3];
          }

          if (process.argv[4]) {
            config.mindmapPrefix = process.argv[4];
          }

          if (process.argv[5]) {
            config.proxyFile = process.argv[5];
          }

          mindmap.generateFromMindmap(config,function(error, folder){
              if (error) {
                console.log("Error during the generation of the pages from the mindmap : " + error );
              }
              else {
                console.log("The pages are correctly generated from the mindmap in the folder : " + folder);
              }
          });

          break;

      case "preview":
          var projectFolder;

          if (process.argv.length === 4) {
            projectFolder = process.argv[3];
          }
          preview.previewSite(projectFolder);
          break;

      case "generate":
          generate.generateSite(function(error, targetFolder) {
              if (error) {
                console.log("Error during the generation of the site : " + error );
              }
              else {
                console.log("The site is correctly generated in " + targetFolder);
              }
          });
          break;

      case "ftp" :
          deploy.deploySite(function(error, serverInfo){
              if (error) {
                console.log("Error during the deployment of the site : " + error );
              }
              else {
                console.log("The site is correctly deployed in " + serverInfo);
              }
          });
          break;

      default:
        console.log("Invalid command, use : cocoons [create|mindmap|preview|generate|deploy]");
          break;
}
