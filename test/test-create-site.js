var assert   = require("assert");
var _        = require("underscore");
var fs       = require('graceful-fs');
var rimraf   = require("rimraf");
var create   = require('../lib/exec/create.js');
var util 		 = require("../lib/util.js");

var TEST_SITE_FOLDER = process.cwd() + "/test/test-new-site";
var FILES_TO_CHECK = ["public", "src", "templates", "cocoons.json", "preview.sh", "widgets" ];
var FILES_TO_IGNORE = [ ".DS_Store", "logs"];


describe('Test Create Site', function() {

    afterEach(function(done) {
          rimraf(TEST_SITE_FOLDER, function(error){
              done(error);
          });
    });

    describe('Basic site creation', function(done){
        it('should return a nice new site in a target folder based on the default template site', function(done){

            var siteTemplateName = "";

            create.createSite(siteTemplateName, TEST_SITE_FOLDER, function(error, status) {
                if (error) {
                  console.log("Error during the creation of the site : " + error );
                  done(error)
                }
                else {
                  console.log("The site is correctly created in " + status);
                  checkSiteDirectories(done);
                }

            });


        });
    });

    describe('Create a new site with an unknown site template', function(done){
        it('should return an error because the site template does not exist', function(done){

            var siteTemplateName = "xxxx";

            create.createSite(siteTemplateName, TEST_SITE_FOLDER, function(error, status) {
                if (! error) {
                  done(new Error("There is no error"));
                }
                done();
            });


        });
    });

});


var checkSiteDirectories = function (done) {

    fs.readdir(TEST_SITE_FOLDER, function(error, files){

        if (error) {
          log.error("Error during reading the directory : " + dir + " : " + error);
          done(error);
          return;
        }

        var diff = _.difference(_.difference(files,FILES_TO_IGNORE), FILES_TO_CHECK);

        assert(diff && diff.length == 0, "The site is not correctly created : directories are missing or invalid");
        done();

    });


}
