var _ = require("underscore")._,
  sys = require("sys");

var BayesianClassifier = function(options) {
  options = options || {}
  this.thresholds = options.thresholds || {};
  this.def = options.def || 'unclassified';
  this.weight = options.weight || 1;
  this.assumed = options.assumed || 0.5;

  var backend = options.backend || {type: 'memory'};
  switch(backend.type.toLowerCase()) {
    case 'redis':
      this.backend = new (require("./backends/redis").RedisBackend)(backend.options);
      break;
    case 'localstorage':
      this.backend = new (require("./backends/localStorage")
                     .LocalStorageBackend)(backend.options);
      break;
    default:
      this.backend = new (require("./backends/memory").MemoryBackend)();
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
    if(_(doc).isArray())
      return doc;
    var words = doc.split(/\W+/);
    return _(words).uniq();
  },

  train : function(doc, cat, callback) {
    this.incDocCounts([{doc: doc, cat: cat}], function(err, ret) {
      if (callback)
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

  wordProb : function(word, cat, cats, counts) {
    // times word appears in a doc in this cat / docs in this cat
    var prob = (counts[cat] || 0) / cats[cat];

    // get weighted average with assumed so prob won't be extreme on rare words
    var total = _(cats).reduce(function(sum, p, cat) {
      return sum + (counts[cat] || 0);
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
        var wordCounts = counts[word] || {};
        return prob * this.wordProb(word, cat, cats, wordCounts);
      }, 1, this);

      // the probability this doc is in this category
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
    var max = _(probs).reduce(function(max, prob, cat) {
      return max.prob > prob ? max : {cat: cat, prob: prob};
    }, {prob: 0});

    var category = max.cat || this.def;
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
    this.getProbs(doc, function(probs) {
      callback(that.bestMatch(probs));
    });
  },

  classifySync : function(doc) {
    var probs = this.getProbsSync(doc);
    return this.bestMatch(probs);
  },

  test : function(data) { // only for sync
    var error = 0;
    data.forEach(function(datum) {
      var output = this.classify(datum.input);
      error += output == datum.output ? 0 : 1;
    }, this);
    return error / data.length;
  }
}

exports.BayesianClassifier = BayesianClassifier;
