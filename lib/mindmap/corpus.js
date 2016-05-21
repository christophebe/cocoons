var _      = require("underscore");
var search = require("generate-corpus");

module.exports.generateCorpus= function(keywords, config, callback ) {

  var proxy = null;

  if (config.proxyList) {
    proxy = config.proxyList.pick().getUrl();
  }

  var options = {
      host : "google." + config.country,
      num : 30,
      qs: {
          q: keywords,
          pws : 0,
          //lr : "lang_fr" //,
          //cr : "BE"
      },
      nbrGrams : [1,2,3],
      withStopWords : false,
      language : config.language,
      removeSpecials : true,
      removeDiacritics : true,
      proxy : proxy
  };


  search.generateCorpus(options, function(error, corpus){

      if (error) {
        return callback(error);
      }

      var allWords = Array.from(corpus[0].stats.values()).concat(Array.from(corpus[1].stats.values()).concat(Array.from(corpus[2].stats.values())));
      //allWords = _.map(allWords.slice(0,199), function(word) {return word.word; });
      allWords = _.map(_.filter(_.sortBy(allWords, function(word) { return -word.tfIdfSum;}), function(word){ return word.nbrDocs > 1;}), function(word) {return word.word; }).slice(0,100);
      callback(null, allWords);

  });
};
