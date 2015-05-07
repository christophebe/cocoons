var assert         = require("assert");
var util 		       = require("../lib/util.js");
var cloakingEngine = require("../lib/fs/cloaking-engine.js");
var mocks          = require("./mocks.js");

var dirname = "./test";
var configFile =  dirname + "/cocoons.json";

var testConfig = null;
var cloakingRules = null;


var ipUser = "11.11.11.11"; // why not ?
var ipGoogle = "66.249.66.1";
var ipMsn = "65.52.104.0";
var ipYahoo = "67.195.37.0";
var chromeUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36";
var googleBotUserAgent = "Googlebot/2.1 (+http://www.googlebot.com/bot.html)";
var dummyBotUserAgent = "I am a bot";


describe('Test Cloaking', function() {

    before(function(done){

          util.readJsonFile(configFile, function(error, config){
            if (! error) {
                testConfig = config;
                testConfig.dirname = dirname;

                cloakingRules = new cloakingEngine.CloakingRules(testConfig);
            }
            done(error);
          });
    });

    describe('non cloacked url', function(done){
      it('should return the same url for a non cloaked url', function(done){

          var req = new mocks.MockRequest("/non-clocked-url.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/non-clocked-url.html");
              done(error);
          });

      });
    });

    describe('redirect 301 without condition', function(done){
      it('should return a 301 status with another URL for a user', function(done){

          var req = new mocks.MockRequest("/index.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if redirect => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 301);
              assert(res.url == "/");

              done(error);
          });

      });

      it('should return a 301 status with another URL for GoogleBot', function(done){

          var req = new mocks.MockRequest("/index.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if redirect => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 301);
              assert(res.url == "/");

              done(error);
          });

      });
    });


    describe('redirect 302 without condition', function(done){
      it('should return a 302 status with another URL for a user', function(done){

          var req = new mocks.MockRequest("/out/external-url.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if redirect => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 302);
              assert(res.url == "http://www.google.com");

              done(error);
          });

      });

      it('should return a 302 status with another URL for GoogleBot', function(done){

          var req = new mocks.MockRequest("/out/external-url.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if redirect => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 302);
              assert(res.url == "http://www.google.com");

              done(error);
          });

      });
    });


    describe('Display another content to Google', function(done){
      it('should return the same file path to a user', function(done){

          var req = new mocks.MockRequest("/markdown.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/markdown.html", "incorrect path : " + path);

              done(error);
          });

      });

      it('should return another file path for GoogleBot', function(done){

          var req = new mocks.MockRequest("/markdown.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/cloaking/cloaked-content.html", "incorrect path : " + path);

              done(error);
          });

      });

      it('should return the default home page path to a user', function(done){

          var req = new mocks.MockRequest("/", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/", "incorrect path : " + path);

              done(error);
          });

      });

      it('should return another file path for the homepage to GoogleBot', function(done){

          var req = new mocks.MockRequest("/", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/cloaking/homepage-for-google.html", "incorrect path : " + path);

              done(error);
          });

      });


      it('should return an url based on a pattern', function(done){

          var req = new mocks.MockRequest("/content/test.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();


          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/gg/content/test.html", "incorrect path : " + path);
              done(error);
          });


      });

    });

    describe("Don't show specific content to the humans", function(done){
      it('should return a 404 status for a user', function(done){

          var req = new mocks.MockRequest("/cloaking/not-for-humans.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if 404 => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 404);
              assert(res.content == "Page not found", "incorrect res.content : " + res.content);

              done(error);
          });

      });

      it('should return a nice content for GoogleBot', function(done){

          var req = new mocks.MockRequest("/cloaking/not-for-humans.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();


          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/cloaking/not-for-humans.html", "incorrect path : " + path);
              done(error);
          });


      });
    });

    describe('Display another content to Google - Reverse DNS', function(done) {
      it('should return the same file path to a user', function(done){

          var req = new mocks.MockRequest("/markdown-reverse.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/markdown-reverse.html", "incorrect path : " + path);

              done(error);
          });

      });

      it('should return another file path for GoogleBot', function(done){

          var req = new mocks.MockRequest("/markdown-reverse.html", googleBotUserAgent, ipGoogle);
          //var req = new mocks.MockRequest("/markdown-reverse.html", dummyBotUserAgent, ipYahoo);

          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){

              assert(error == null);
              assert(path == "/cloaking/cloaked-content.html", "incorrect path : " + path);

              done(error);
          });

      });

    });

    describe("Don't show specific content to the humans - Reverse DNS", function(done){
      it('should return a 404 status for a user', function(done){

          var req = new mocks.MockRequest("/dns-cloaking/not-for-humans.html", chromeUserAgent, ipUser);
          var res = new mocks.MockResponse();

          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);

              //if 404 => path ==""
              //the final url is in the res object
              assert(path == "");
              assert(res.statusValue == 404);
              assert(res.content == "Page not found", "incorrect res.content : " + res.content);

              done(error);
          });

      });

      it('should return a nice content for GoogleBot', function(done){

          var req = new mocks.MockRequest("/dns-cloaking/not-for-humans.html", googleBotUserAgent, ipGoogle);
          var res = new mocks.MockResponse();


          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/dns-cloaking/not-for-humans.html", "incorrect path : " + path);
              done(error);
          });


      });

      it('should return a nice content for BingBot', function(done){

          var req = new mocks.MockRequest("/dns-cloaking/not-for-humans.html", googleBotUserAgent, ipMsn);
          var res = new mocks.MockResponse();


          cloakingRules.extractPath(req, res,function(error, path){
              assert(error == null);
              assert(path == "/dns-cloaking/not-for-humans.html", "incorrect path : " + path);
              done(error);
          });


      });

    });


});
