
var _   = require('underscore');
var log = require('../logger.js').Logger;


function CloakingRules (config) {
  this.config = config;

}


/**
* Extract the final file path from the request & the cocoons config
* - Check if there is a cloaking rule
* - if not, return the file content of the requested url
* - otherwise, apply the cloaking rule to find the target url (301) or the
*   associated file path
*
* If there are more cloaking rules for the request url, the first one is
* selected
*
* @param
* @returns
*/
CloakingRules.prototype.extractPath = function (req, res) {

    var that = this;
    // if no cloaking rule => use the request url
    if (! this.config.cloaks) {
      return req.url;
    }

    // Check if there are some cloaking rules defined for req.url
    var rules = _.filter(this.config.cloaks, function(foundRule) {

      var foundUrl = _.find(foundRule.rewrites, function(rewrite) {

        return that.isUrlMatch(foundRule, req.url, rewrite.from);

      });

      return foundUrl != null;
    });

    if (rules != null && rules.length > 0) {
      return this.applyCloakingRule(rules, req, res);
    }
    else {
      // if no cloaking rule found  => use the request url
      return req.url;
    }
}

CloakingRules.prototype.applyCloakingRule = function (rules, req, res) {

    var that = this;

    for(i=0; i<rules.length; i++) {
      var rule = rules[i];
      log.debug("Check user agent & ip for rule : " + rule.name);
      var isUserAgentMatch = true;
      var isIpMatch = true;

      if (rule.conditions && rule.conditions.userAgents) {
        isUserAgentMatch = (_.find(rule.conditions.userAgents, function(condition){ return req.headers['user-agent'].match(condition); }) !=null);
        log.debug("User agent : " + req.headers['user-agent'] + " isUserAgentMatch : " + isUserAgentMatch);
      }

      if (rule.conditions && rule.conditions.ips) {
        var ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        isIpMatch = (_.find(rule.conditions.ips, function(condition){ return ip.match(condition); }) !=null);
        log.debug("Ip : " + ip + " isIpMatch : " + isIpMatch);
      }

      var match = null;

      if (rule.conditions && rule.conditions.or) {
        match = isUserAgentMatch || isIpMatch;
      }
      else {
        match = isUserAgentMatch && isIpMatch;
      }

      if (match) {

            var rewriter = _.find(rule.rewrites, function(rewrite) {
                return that.isUrlMatch(rule, req.url, rewrite.from);
            });


            if (rewriter.type == "replace") {
              log.debug("Cloaking found (content replace) for : " + req.url + " by " + rewriter.to);
              return rewriter.to;
            }


            if (rewriter.type == "301") {
              log.debug("Redirect 301 found for : " + req.url + " => " + rewriter.to);
              res.redirect(301, rewriter.to);
              return "";
            }

            if (rewriter.type == "302") {
              log.debug("Redirect 302 found for : " + req.url + " => " + rewriter.to);
              res.redirect(302, rewriter.to);
              return "";
            }


            if (rewriter.type == "404") {
              log.debug("Cloaking found (404) for : " + req.url);
              res.status(404).send('Page not found');
              return "";
            }

            log.warn("Invalid type rewrite : " + rewriter.type + " for : " + req.url);

      }
    }

    return req.url;

}

CloakingRules.prototype.isUrlMatch = function (rule, url, regex) {

    var match = null;

    // remove the / at the first position in order to be compatible with
    // the htaccess regex
    if (url.length > 1 && url[0] == "/" ) {
      match = url.slice(1).match(regex);
    }
    else {
      match = url.match(regex);
    }

    if (match != null) {
      log.debug("Found URL matching for url : " + url + " in rule : " + rule.name  + " - regex : " + regex);
    }

    return match != null;
}


module.exports.CloakingRules = CloakingRules;
