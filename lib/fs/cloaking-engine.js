var dns   = require('native-dns');
var _     = require('underscore');
var async = require('async');

var log   = require('../logger.js').Logger;


function CloakingRules (config) {
  this.config = config;

}


/**
* Extract the final file path from the request & the cocoons config
* - Check if there is a cloaking rule
* - if not, return the full path to used for the requested url
* - otherwise, apply the cloaking rule to find which content to display
*   The rule could be a 301, 302, 404 or just a replacement of the content
*
* If there are more cloaking rules for the request url, the first one is
* selected
*
* @param
* @returns
*/
CloakingRules.prototype.extractPath = function (req, res, callback) {


    var that = this;
    // if no cloaking rule => use the request url
    if (! this.config.cloaks) {
      callback(null, req.url);
      return;
    }

    // Check if there are some cloaking rules defined for req.url
    var rules = _.filter(this.config.cloaks, function(foundRule) {

      var foundUrl = _.find(foundRule.rewrites, function(rewrite) {
        return that.isUrlMatch(foundRule, req, rewrite.from);

      });

      return foundUrl != null;
    });

    if (rules != null && rules.length > 0) {

      debug(req, "Number of rules found base on the url matching: " + rules.length + " for : " + req.url);
      this.applyCloakingRule(rules, req, res, callback);
    }
    else {
      debug(req, "No rule found" + " for : " + req.url);
      callback(null, req.url);
    }
}

CloakingRules.prototype.applyCloakingRule = function (rules, req, res, endCallback) {

      var that = this;
      async.detectSeries(rules, function(rule, callback){

          debug(req, "Find Rule - Check conditions for : "  + req.url + " for rule : " + rule.name);

          that.checkConditions(rule, req, function(error, match) {

            if (error) {
              debug(req, "Error when checking cloaking condition, try the next one - Error : " + error);
              callback(false);
              return;
            }
            //debug(req, "Checked conditiond for : "  + req.url + " for rule : " + rule.name + " - result : " + match);
            callback(match);
          });

      },
      function(rule){

          if (rule) {
            debug(req, "Rule found for request " + req.url + " : " + rule.name);
            var rewriter = _.find(rule.rewrites, function(rewrite) {
                return that.isUrlMatch(rule, req, rewrite.from);
            });


            if (rewriter.type == "replace") {
              debug(req, "Cloaking found (content replace) for : " + req.url + " by " + rewriter.to);
              endCallback(null, rewriter.to);
              return;
            }


            if (rewriter.type == "301") {
              debug(req, "Redirect 301 found for : " + req.url + " => " + rewriter.to);
              res.redirect(301, rewriter.to);
              endCallback(null, "");
              return;
            }

            if (rewriter.type == "302") {
              debug(req, "Redirect 302 found for : " + req.url + " => " + rewriter.to);
              res.redirect(302, rewriter.to);
              endCallback(null, "");
              return;
            }


            if (rewriter.type == "404") {
              debug(req, "Cloaking found (404) for : " + req.url);
              res.status(404).send('Page not found');
              endCallback(null, "");
              return;
            }

            if (rewriter.type == "500") {
              debug(req, "Cloaking found (500) for : " + req.url);
              res.status(500).send('Page not found');
              endCallback(null, "");
              return;
            }

            error(req, "Invalid rewrite type (value different of : 301,302,404 or replace) : " + rewriter.type + " for : " + req.url);
            endCallback(null, req.url);


        }
        // rule not found
        else {
            debug(req, "No conditions matching in the selected rule for " + req.url );
            endCallback(null, req.url);
        }
      });


}

CloakingRules.prototype.checkConditions = function (rule, req, callback) {

    // if there is no condtion : cool, that's match in all conditions !
    if (! rule.conditions) {
      callback(null, true);
      return ;
    }

    // If there is a dns rule, this is not necessary to check the user agent
    // & the ip rules.
    if (rule.conditions.dns) {

      this.checkDns(rule, req, callback);

    }
    else {
      this.checkUserAgentIp(rule, req, callback);
    }

}

CloakingRules.prototype.checkUserAgentIp = function (rule, req, callback) {

    var check = {
      isUserAgentMatch : true,
      isIpMatch : true
    }


    if (rule.conditions && rule.conditions.userAgents) {
      check.isUserAgentMatch = (_.find(rule.conditions.userAgents, function(condition){ return req.headers['user-agent'].match(condition); }) !=null);
      debug(req, "User agent : " + req.headers['user-agent'] + " isUserAgentMatch : " + check.isUserAgentMatch);
    }

    if (rule.conditions && rule.conditions.ips) {

      var ip =  req.ip;
      check.isIpMatch = (_.find(rule.conditions.ips, function(condition){ return ip.match(condition); }) !=null);
      debug(req, "Ip : " + ip + " isIpMatch : " + check.isIpMatch);
    }

    var match = false;

    if (rule.conditions && rule.conditions.or) {
      match = check.isUserAgentMatch || check.isIpMatch;
    }
    else {
      match = check.isUserAgentMatch && check.isIpMatch;
    }

    callback(null, match);

}

CloakingRules.prototype.checkDns = function (rule, req, callback) {

    var DUMMY_DNS_USER = "mylocalhost";

    debug(req, "Check reverse dns for " + req.url);

    dns.reverse(req.ip, function(error, domains) {

      if (error) {

        if (error.code == 'ENOTFOUND') {
          debug(req, "No domains found for the request ip for " + req.url +  "  - assign a dummy dns name");
          domains = [DUMMY_DNS_USER];

        }
        else {
          debug(req, "Error when making reverse dns for " + req.url);
          callback(error, false);
          return;
        }

      }


      debug(req, "Reverse DNS - domains found : " + JSON.stringify(domains));

      var isDnsMatch = (_.find(domains, function(domain){
                return _.find(rule.conditions.dns,function(dns){ return domain.match(dns);}) != null;}) != null );

      debug(req,"Ip : " + req.ip + " isDnsMatch : " + isDnsMatch);

      callback(null, isDnsMatch);


    });

}


CloakingRules.prototype.isUrlMatch = function (rule, req, regex) {

    var match = null;

    // remove the / at the first position in order to be compatible with
    // the htaccess regex
    if (req.url.length > 1 && req.url[0] == "/" ) {
      match = req.url.slice(1).match(regex);
    }
    else {
      match = req.url.match(regex);
    }

    return match != null;
}


function debug(req, message) {
  log.debug("[" + req.ip + "] " + message);
  //console.log( "[" + req.ip + "] " + message);
}

function warn(req, message) {
  log.warn("[" + req.ip + "] " + message);
}

function error(req, message) {
  log.error("[" + req.ip + "] " + message);
  //console.log( "[" + req.ip + "] " + message);
}

module.exports.CloakingRules = CloakingRules;
