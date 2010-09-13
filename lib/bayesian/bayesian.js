var _ = require("underscore")._,
  sys = require("sys");

BayesianClassifier = function(options) {
  this.words = {};
  this.cats = {};

  options = options || {}
  this.thresholds = options.thresholds || {};
  this.def = options.def || 'unclassified';
  this.weight = options.weight || 1;
  this.assumed = options.assumed || 0.5;
  
  var backend = options.backend || {type: 'in-memory'};
  if(backend.type.toLowerCase() == 'redis') {
    var redisBackend = require("./backends/redis-backend");
    this.backend = new redisBackend.RedisBackend(backend.options);
  } else {
    this.backend = new (require("./backends/memory-backend").MemoryBackend)();
  }
}

BayesianClassifier.prototype = {
  getCats : function(callback) {
    return this.backend.getCats(callback);
  },
  
  getWordCounts : function(words, cats, callback) {
    return this.backend.getWordCounts(words, cats, callback);
  },

  incDocCounts : function(docs, callback) {
    // accumulate all the pending increments
    var wordIncs = {};
    var catIncs = {};
    docs.forEach(function(doc) {
      var cat = doc.cat;
      catIncs[cat] = catIncs[cat] ? catIncs[cat] + 1 : 1;

      var words = this.getWords(doc.doc);
      words.forEach(function(word) {
        wordIncs[word] = wordIncs[word] || {};
        wordIncs[word][cat] = wordIncs[word][cat] ? wordIncs[word][cat] + 1 : 1;
      }, this);
    }, this);

    return this.backend.incCounts(catIncs, wordIncs, callback);
  },
  
  setThresholds : function(thresholds) {
    this.thresholds = thresholds;
  },
  
  getWords : function(doc) {
    return doc.split(/\W+/);
  },
  
  train : function(doc, cat, callback) {
    this.incDocCounts([{doc: doc, cat: cat}], function(err, ret) {
      callback(ret);
    });
  },
  
  trainAll : function(data, callback) {
    docs = data.map(function(item) {
      return {doc: item.input, cat: item.output};
    });
    this.incDocCounts(docs, function(err, ret) {
      callback(ret);
    });
  },
  
  wordCount : function(counts, word, cat) {
    return counts[word] ? counts[word][cat] || 0 : 0;
  },
  
  weightedProb : function(cats, counts, word, cat) {
    var prob = this.wordCount(counts, word, cat)  / cats[cat];;
    
    var total = _(cats).reduce(function(sum, p, cat) {
      return sum + this.wordCount(counts, word, cat);
    }, 0, this);
    
    return (this.weight * this.assumed + total * prob) / (this.weight + total);
  },
  
  getCatProbs : function(cats, words, counts) {
    var numDocs = _(cats).reduce(function(sum, count) {
      return sum + count;
    }, 0);
    
    var probs = {};
    _(cats).each(function(catCount, cat) {
      var catProb = (catCount || 0) / numDocs;
      
      var docProb = _(words).reduce(function(prob, word) {
        return prob * this.weightedProb(cats, counts, word, cat);
      }, 1, this);
      probs[cat] = catProb * docProb;
    }, this);
    return probs; 
  },
  
  getProbs : function(doc, callback) {
    var that = this;
    this.getCats(function(cats) {
      var words = that.getWords(doc);
      that.getWordCounts(words, cats, function(counts) {
        var probs = that.getCatProbs(cats, words, counts);
        callback(probs);
      });
    });
  },
  
  getProbsSync : function(doc, callback) {
    var words = this.getWords(doc);
    var cats = this.getCats();
    var counts = this.getWordCounts(words, cats);
    return this.getCatProbs(cats, words, counts);
  },
  
  bestMatch : function(probs) {
    var max = _(probs).reduce(function(memo, prob, cat) {
      return memo.prob > prob ? memo : {cat: cat, prob: prob};
    }, {prob: 0});

    var category = max.cat;
    var threshold = this.thresholds[max.cat] || 1;
    _(probs).map(function(prob, cat) {
     if(!(cat == max.cat) && prob * threshold > max.prob)
       category = this.def; // not greater than other category by enough
    }, this);
 
    return category;
  },

  classify : function(doc, callback) {
    if(!this.backend.async) 
      return this.classifySync(doc);

    var that = this;
    var probs = this.getProbs(doc, function(probs) {
      callback(that.bestMatch(probs));
    });
  },
  
  classifySync : function(doc) {
    var probs = this.getProbsSync(doc);
    return this.bestMatch(probs);
  },

  test : function(data) { // only for sync
    var error = 0;
    for(var i = 0; i < data.length; i++) {
      var output = this.classify(data[i].input);
      error += output == data[i].output ? 0 : 1;
    }
    return error / data.length;
  }
}

exports.BayesianClassifier = BayesianClassifier;
