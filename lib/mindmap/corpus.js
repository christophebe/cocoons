var _      = require("underscore");
var search = require("generate-corpus");

module.exports.generateCorpus= function(keywords, country, language, callback ) {

  var options = {
      host : "google." + country,
      qs: {
          q: keywords,
          num : 50,
          pws : 0
          //lr : "lang_fr" //,
          //cr : "BE"
      },
      nbrGrams : [1,2,3],
      withStopWords : false,
      language : language,
      removeSpecials : true,
      removeDiacritics : true
      //,proxy
  };
  //console.log(options);

  search.generateCorpus(options, function(error, corpus){

      if (error) {
        return callback(error);
      }

      var allWords = Array.from(corpus[0].stats.values()).concat(Array.from(corpus[1].stats.values()).concat(Array.from(corpus[2].stats.values())));
      allWords = _.sortBy(allWords, function(word) { return -word.tfIdfSum;});

      allWords = _.map(allWords.slice(0,199), function(word) {return word.word; });
      callback(null, allWords);

  });
};
