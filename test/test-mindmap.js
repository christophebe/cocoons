var fs     = require("fs");
var assert = require("assert");
var m      = require("../lib/fs/mindmap-fs.js");


describe('Test Mindmap', function(){

      it.skip('Generate a site from a mindmap - opml file', function(done) {
          var mindmapFilePath = "test/site-test-mindmap/test.opml";

          var config =  {
            mindmapConverter : "../mindmap/opml-converter.js",
            source : "src",
            templateFolder : "templates",
            mindmapPrefix : "gg/content",
            country : "be",
            language : "fr"

          };

          var mindmap = new m.Mindmap(config, "test/site-test-mindmap");

          mindmap.generateFromMindmap(mindmapFilePath, function(error, folder) {
              if (error) {
                  done(error);
              }
              else {
                  fs.exists('test/site-test-mindmap/gg/content/page-1/page-1-1.md', function (exists) {
                    done();
                  });
              }

          });
     });

     it.skip('Generate a site from a mindmap - freemind file', function(done) {
        this.timeout(1000000);
         var mindmapFilePath = "test/site-test-mindmap/pret.mm";

         var config =  {
           mindmapConverter : "../mindmap/freemind-converter.js",
           source : "src",
           templateFolder : "templates",
           mindmapMardownTemplate : "mindmap/markdown-fr.jade",
           mindmapJsonTemplate : "mindmap/json-fr.jade",
           mindmapPrefix : "gg/content",
           country : "be",
           language : "fr"
         };

         var mindmap = new m.Mindmap(config, "test/site-test-mindmap");

         mindmap.generateFromMindmap(mindmapFilePath, function(error, folder) {

            done(error);
             /*
             if (error) {
                 done(error);
             }
             else {
                 fs.exists('test/site-test-mindmap/gg/content/pret-voiture-moto/moto.md', function (exists) {
                   done();
                 });
             }
             */

         });
    });

});
