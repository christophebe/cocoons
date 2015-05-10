var fs     = require("fs");
var assert = require("assert");
var m      = require("../lib/fs/mindmap-fs.js");


describe('Test Mindmap', function(){

      it('Generate a site from a mindmap', function(done) {
          var mindmapFilePath = "test/site-test-mindmap/test.opml";

          var config =  {
            mindmapConverter : "../mindmap/opml-converter.js",
            source : "src",
            templateFolder : "templates",
            mindmapPrefix : "gg/content"
          }

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

});
