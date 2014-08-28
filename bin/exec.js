#!/usr/bin/env node

var preview  = require('../lib/exec/preview.js');
var generate = require('../lib/exec/generate.js');
var deploy   = require('../lib/exec/deploy-ftp.js');
var create   = require('../lib/exec/create.js');
var log      = require('../lib/logger').Logger;

/**
 * Global application used to create, preview,generate & ftp (deploy) a web site
 *
 */
if ( process.argv.length < 3 ) {
   console.log('Usage: cocoons [create|preview|generate|ftp]\n');
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
          log.error("Invalid command, use : cocoons [create|preview|generate|deploy]");
          break;
}
