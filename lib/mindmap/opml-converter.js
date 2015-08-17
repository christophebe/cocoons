var _  = require("underscore");

var tranform = function(json) {
    var pages = [];

    // 1. Create the home page
    var opmlNode  = json.opml.body[0].outline[0];
    var homePage = createHome(opmlNode);

    //2. Create subpages
    homePage.children = createChildPages(homePage, opmlNode);
    return homePage;

}


var createHome = function(opmlNode) {
  console.log(opmlNode);
  return {
    title : opmlNode.$.text,
    path : ""
  }
}

var createChildPages = function(parentPage, opmlNode) {
  var childPages = [];

  if (opmlNode.outline ) {

    // Create the subpages
    if (_.isArray(opmlNode.outline)) {
      opmlNode.outline.forEach(function(subNode) {
          var childPage = createPage(parentPage, subNode);
          childPages.push(childPage);

          if (subNode.outline) {
            childPage.children = createChildPages(childPage, subNode);
          }
      });

    }
    else {
      var childPage = createPage(parentPage, opmlNode.outline);
      childPages.push(childPage);
      if (opmlNode.outline.outline) {
        childPage.children = createChildPages(childPage, opmlNode.outline);
      }
    }

  }

  return childPages;
}

var createPage  = function(parentPage, opmlNode) {

  //TODO :
  // Actually, url is matching to the opml text attribute.
  // that means the opml text should be url friendly (no uppercase, no spaces, use - as word separator, ...)
  // Can we imagine to build mindmap with a text that is not url friendly ?
  // if yes, we have to create a function to translate opml text into a
  // correct url format

  var path = "/" + opmlNode.$.text;
  if (parentPage) {
      path = parentPage.path + path ;
  }

  return {
    title : opmlNode.$.text,
    path : path,
    parentPage : parentPage
  }

}

var getSisterPages = function (parentPage, page) {

  return  _.filter(parentPage.children, function(sisterPage){ return sisterPage.path != page.path ; });
}


module.exports.transform = tranform;
module.exports.getSisterPages = getSisterPages;
