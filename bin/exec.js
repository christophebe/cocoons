#!/usr/bin/env node

var preview  = require('../lib/preview.js');
var generate = require('../lib/generate.js');
var create = require('../lib/create.js');

if ( process.argv.length != 3 ) {
   console.log('Usage: cocoons [create|preview|generate]\n');
   return;
}

switch (process.argv[2]) {
      case "create":
          create.createWebsite(function(error, status) {
              if (error) {
                console.log("Error during the creation of the site : " + error );
              }
              else {
                console.log("The site is correctly created : " + status);
              }
          });
          break;
      case "preview":
          preview.preview();
          break;
      case "generate":
          generate.generateStaticSite(function(error, targetFolder) {
              if (error) {
                console.log("Error during the generation of the site : " + error );
              }
              else {
                console.log("The site is correctly generated in " + targetFolder);
              }
          });
          break;
      default:
          console.log("Invalid command, use : cocoons [create|preview|generate]");
          break;
}
