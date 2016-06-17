var fs     = require("fs");
var assert = require("assert");
var proxyLoader = require("simple-proxies/lib/proxyfileloader");
var m      = require("../lib/fs/mindmap-fs.js");


describe('Test Mindmap', function(){

      var proxyList = null;

      before(function(done) {
            this.timeout(100000);

            var config = proxyLoader.config().setProxyFile("/Users/christophe/nodejs/_MODULES/cocoons/cocoons-cms/proxies.txt")
                                             .setCheckProxies(true)
                                             .setRemoveInvalidProxies(false);

            proxyLoader.loadProxyFile(config,function(error, pl){
            //proxyLoader.loadDefaultProxies(function(error, pl){
                if (error) {
                  done(error);
                }
                proxyList = pl;
                console.log("Proxies Loaded", proxyList.getProxies().length);
                done();
            });

      });

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
         var mindmapFilePath = "test/site-test-mindmap/credit-auto.mm";

         var config =  {
           mindmapConverter : "../mindmap/freemind-converter.js",
           source : "src",
           templateFolder : "templates",
           mindmapMardownTemplate : "mindmap/markdown-fr.jade",
           mindmapJsonTemplate : "mindmap/json-fr.jade",
           //mindmapPrefix : "gg/content",
           country : "be",
           language : "fr",
           proxyList : proxyList
         };

         var mindmap = new m.Mindmap(config, "test/site-test-mindmap");

         mindmap.generateFromMindmap(mindmapFilePath, function(error, folder) {

            done(error);

         });
    });

    it('Empty', function(done) {
        done();
    });

});
