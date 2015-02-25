var assert       = require("assert");
var markdownPage = require('../lib/fs/markdown-page.js');



describe('Test Markdown', function(){

    describe('#IncorrectFilePath', function(){
      it('should return an error if the file does not exist', function(done){

          markdownPage.buildFromFile("./test/markdown-files/unknowfile.md", function(error, page){
              assert(error);
      		    done();
          });

      });
    });


    describe('#emptyfile', function(){
      it('should return a correct page if the md file is empty', function(done){
          markdownPage.buildFromFile("./test/markdown-files/empty-md.md", function(error, page){
            assert(page.properties.template == "template.jade");
            assert(page.content != null);
            done();
          });
      });
    });


    describe('#emptyProps', function(){
      it('should return a correct page if the json file is empty', function(done){
          markdownPage.buildFromFile("./test/markdown-files/empty-props.md", function(error, page){
            assert(page.properties.file == "./test/markdown-files/empty-props.md");
            assert(page.content == "This is the content\n", "invalid content");

            done();
          });
      });
    });



    describe('#invalid properties', function(){
      it('should return an error if the format for the properties is incorrect', function(done){
          markdownPage.buildFromFile("./test/markdown-files/invalid-properties.md", function(error, page){
            assert(page.properties);
            assert(page.content == "#Hello world\n");
            done();
          });
      });
    });

    describe('#checkproperty', function(){
      it('Properties are not correct', function(done){
          markdownPage.buildFromFile("./test/markdown-files/test.md", function(error, page){
              assert("template.jade", page.properties.template);
              assert("Nice Title with \" &  '", page.properties.title);
              assert(true, page.content != null);
              done();

          });
      });
    });

});
