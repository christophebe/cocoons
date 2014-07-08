/*
 * To run correctly the tests, you need a MongoDB running on localhost
 * see the dbconfig.json file
 *
 */

var assert       = require("assert");
var markdownPage = require('../lib/markdown-page.js');
var markdown     = require('markdown').markdown;


describe('Test Markdown', function(){

    describe('#IncorrectFilePath', function(){
      it('should return an error if the file does not exist', function(done){
          markdownPage.buildFromFile("./test/files/unknowfile.md", function(error, page){
              assert(error);
      		    done();
          });

      });
    });



  describe('#DoNotStartWith---', function(){
    it('should return an error if the first line is not starting with ---', function(done){
        markdownPage.buildFromFile("./test/files/incorrect-first-line.md", function(error, page){
            assert(error);
            done();
        });

    });
  });

  describe('#emptyfile', function(){
    it('should return an error if the md file is empty', function(done){
        markdownPage.buildFromFile("./test/files/empty.md", function(error, page){
            assert(error);
            done();
        });
    });
  });


  describe('#invalid properties', function(){
    it('should return an error if the format for the properties is incorrect', function(done){
        markdownPage.buildFromFile("./test/files/invalid-properties.md", function(error, page){
            assert(error);
            done();
        });
    });
  });

  describe('#nocontent', function(){
    it('should return an error if there is no content', function(done){
        markdownPage.buildFromFile("./test/files/nocontent.md", function(error, page){
            assert(error);
            done();
        });
    });
  });

  describe('#checkproperty', function(){
    it('Properties are not correct', function(done){
        markdownPage.buildFromFile("./test/files/test.md", function(error, page){
            assert("template.jade", page.properties.template);
            assert("Nice Title with \" &  '", page.properties.title);
            assert(true, page.content != null);
            done();

        });
    });
  });


  describe('#simpleparse', function(){
    it('Error when parsing a simple markdowb file', function(done){
        markdownPage.buildFromFile("./test/files/test.md", function(error, page){

            assert(true, page.content != null);
            var tree = markdown.parse(page.content);
            console.log(tree);

            done();

        });
    });
  });


});
