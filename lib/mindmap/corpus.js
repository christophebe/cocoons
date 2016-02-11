var _      = require("underscore");
var search = require("generate-corpus");

module.exports.generateCorpus= function(options, callback ) {

  var searchOptions = {
      host : "google." + options.country,
      qs: {
          q: options.keyword,
          num : 20// Number of results in the SERP
      },
      nbrGrams : options.ngrams, // expression len (one or more words)
      withStopWords : false, // with or without stopwords
      language : options.language
      //,proxy - if need see the npm module simple-proxies
  };

  search.generateCorpus(searchOptions, function(error, corpus){

      if (error) {
        callback(error);
      }

      //console.log(corpus);
      var result = [];
      _.keys(corpus.stats.words).forEach(function(word) {
        result.push({word : word,
                     tfIdfSum : corpus.stats.words[word].tfIdfSum
                   });
      });

      result = _.sortBy(result, function(word) { return -word.tfIdfSum;}).slice(0,20);
      result = _.map(result, function(word) {return word.word; });

      callback(null, result); 


  });
};
