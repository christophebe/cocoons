
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

    // if no cloaking rule => use the request url
    if (! this.config.cloaks) {
      return req.url;
    }

    // Check if there are some cloaking rules defined for req.url
    var rules = _.filter(this.config.cloaks, function(foundRule) {

      var foundUrl = _.find(foundRule.rewrites, function(rewrite) {
        // remove the / at the first position in order to be compatible with
        // the htaccess regex
        log.info("check matching rule for url :" + req.url.slice(1) + " - regex : " + rewrite.from ); 
        var match = req.url.slice(1).match(rewrite.from);
        return match != null;

      });

      return foundUrl != null;
    });

    if (rules != null && rules.length > 0) {
      log.info("Cloaking rules found for " + req.url + " : " + rules);
      return this.applyCloakingRule(rules, req, res);
    }
    else {
      // if no cloaking rule found  => use the request url
      log.info("No cloaking rules found for " + req.url);
      return req.url;
    }
}

CloakingRules.prototype.applyCloakingRule = function (rules, req, res) {

    for(i=0; i<rules.length; i++) {
      var rule = rules[i];

      log.info("Check Cloaking rule : " + rule.name);
      var isUserAgentMatch = true;
      var isIpMatch = true;

      if (rule.conditions.userAgents) {
        isUserAgentMatch = (_.find(rule.conditions.userAgents, function(condition){ return req.headers['user-agent'].match(condition); }) !=null);
      }

      if (rule.conditions.ips) {
        var ip =  req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        isIpMatch = (_.find(rule.conditions.ips, function(condition){ return ip.match(condition); }) !=null);
      }


      if (isUserAgentMatch && isIpMatch ) {

            log.info("User agent & IP match ");
            var rewriter = _.find(rule.rewrites, function(rewrite) {
                // remove the / at the first position in order to be compatible with
                // the htaccess regex
                var match = req.url.slice(1).match(rewrite.from);
                return match != null;

            });


            if (rewriter.type == "replace") {
              log.info("Cloaking found (content replace) for : " + req.url + " by " + rewriter.to);
              return rewriter.to;
            }


            if (rewriter.type == "301") {
              log.info("Cloaking found (301) for : " + req.url + " => " + rewriter.to);
              res.redirect(301, rewriter.to);
              return "";
            }


            if (rewriter.type == "404") {
              log.info("Cloaking found (404) for : " + req.url);
              res.status(404).send('Page not found');
              return "";
            }

            log.warn("Invalid type rewrite : " + rewriter.type + " for : " + req.url);



      }

    }

    return req.url;

}


module.exports.CloakingRules = CloakingRules;
