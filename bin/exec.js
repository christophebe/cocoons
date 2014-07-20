#!/usr/bin/env node

var preview  = require('../lib/preview.js');
var generate = require('../lib/generate.js');


if ( process.argv.length != 3 ) {
   console.log('Usage: cocoons [preview|generate]\n');
   return;
}

switch (process.argv[2]) {
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
          console.log("Invalid command, use : cocoons [preview|generate]");
          break;
}
