var _  = require("underscore");

var tranform = function(json) {

    var pages = [];

    // 1. Create the home page
    var node  = json.map.node[0];
    var homePage = createHome(node);

    //2. Create subpages
    homePage.children = createChildPages(homePage, node);
    return homePage;

};


var createHome = function(node) {

  return {
    title : getTitle(node),
    kw : getKeywords(node),
    path : ""
  };
};

var createChildPages = function(parentPage, node) {
  var childPages = [];

  var nodeChildren = node.node;
  if (nodeChildren) {
      nodeChildren.forEach(function(subNode){
          var childPage = createPage(parentPage, subNode);
          childPages.push(childPage);
          if (subNode.node) {
            childPage.children = createChildPages(childPage, subNode);
          }
      });
  }

  return childPages;
};

var getKeywords = function(node) {

    if (node.attribute) {
        return _.reduce(node.attribute, function(result, attribute){ return result + (attribute.$.NAME === "kw" ? attribute.$.VALUE : ""); }, "");
    }
    else {
      return node.$.TEXT;
    }
};

var getTitle = function(node) {

    if (node.attribute) {
        //return _.map(node.attribute, function(attribute){ return attribute.$.NAME === "kw" ? attribute.$.VALUE : ""; });
        var titleAttribute = _.find(node.attribute, function(attribute) { return attribute.$.NAME === "title"; });
        if (titleAttribute) {
            return titleAttribute.$.VALUE;
        }
        else {
            return node.$.TEXT;
        }

    }
    else {
      return node.$.TEXT;
    }
};

var createPage  = function(parentPage, node) {

  var path = "/" + node.$.TEXT;
  if (parentPage) {
      path = parentPage.path + path ;
  }

  var title = node.$.TEXT;
  var keywords = getKeywords(node);

  return {
    title : getTitle(node),
    kw : getKeywords(node),
    path : path,
    parentPage : parentPage
  };

};

var getSisterPages = function (parentPage, page) {
  return  _.filter(parentPage.children, function(sisterPage){ return sisterPage.path !== page.path ; });
};


module.exports.transform = tranform;
module.exports.getSisterPages = getSisterPages;
