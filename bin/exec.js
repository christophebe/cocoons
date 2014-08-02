#!/usr/bin/env node

var preview  = require('../lib/exec/preview.js');
var generate = require('../lib/exec/generate.js');
var create = require('../lib/exec/create.js');
var log = require('../lib/logger').Logger;

/**
 * Global application used to create, preview & generate a web site
 *
 */
if ( process.argv.length < 3 ) {
   console.log('Usage: cocoons [create|preview|generate]\n');
   return;
}

switch (process.argv[2]) {
      case "create":
          create.createWebsite(function(error, status) {
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
          preview.preview(projectFolder);
          break;

      case "generate":
          generate.generateStaticSite(function(error, targetFolder) {
              if (error) {
                log.error("Error during the generation of the site : " + error );
              }
              else {
                log.info("The site is correctly generated in " + targetFolder);
              }
          });
          break;

      default:
          log.error("Invalid command, use : cocoons [create|preview|generate]");
          break;
}
