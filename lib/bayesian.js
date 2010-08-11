var _ = require("underscore")._,
  sys = require("sys");

BayesianClassifier = function(options) {
  this.words = {};
  this.cats = {};

  options = options || {}
  this.thresholds = options.thresholds || {};
  this.def = options.def || 'unclassified';
}

BayesianClassifier.prototype = {
  getWords : function(doc) {
    return doc.split(/\W+/);
  },
  
  numDocs : function() {
    return _(this.cats).reduce(0, function(memo, catCount) {
      return memo + catCount;
    }, this);
  },
  
  catCount : function(cat) {
    return this.cats[cat] || 0;
  },
  
  incCatCount : function(cat) {
    if(!this.cats[cat])
      this.cats[cat] = 0;
    this.cats[cat]++;
  },
  
  wordCount : function(word, cat) {
    if(this.words[word])
      return this.words[word][cat] || 0;
    return 0;
  },
  
  incWordCount : function(word, cat) {
    if(!this.words[word])
      this.words[word] = {};
    if(!this.words[word][cat])
      this.words[word][cat] = 0;
    this.words[word][cat]++;
  },
  
  threshold : function(cat) {
    return this.thresholds[cat] || 1;
  },
  
  setThresholds : function(thresholds) {
    this.thresholds = thresholds;
  },
  
  train : function(doc, cat) {
    var words = this.getWords(doc);
    _(words).map(function(word) {
      this.incWordCount(word, cat);
    }, this);
    this.incCatCount(cat);
  },
  
  trainAll : function(data) {
    data.forEach(function(item) {
      this.train(item.input, item.output);
    }, this);
  },

  wordProb : function(word, cat) {
    if(this.catCount(cat) == 0)
      return 0;
    return this.wordCount(word, cat) / this.cats[cat];
  },
  
  weightedProb : function(word, cat) {
    var prob = this.wordProb(word, cat);
    var total = _(this.cats).reduce(0, function(memo, p, cat) {
      return memo + this.wordCount(word, cat);
    }, this);
    var weight = 1, assumed = 0.5;
    var weighted = (weight * assumed + total * prob) / (weight + total);
    return weighted;
  },

  docProb : function(doc, cat) {
    var words = this.getWords(doc);
    var prob = _(words).reduce(1, function(memo, word) {
      return memo * this.weightedProb(word, cat);
    }, this);
    return prob;
  },

  prob : function(doc, cat) {
    var catProb = this.catCount(cat) / this.numDocs();
    var docProb = this.docProb(doc, cat);
    return catProb * docProb;
  },

  classify : function(doc) {
    var probs = _(this.cats).map(function(p, cat){
      return {cat: cat, prob: this.prob(doc, cat)};
    }, this);

    var max = _(probs).reduce(probs[0], function(memo, cat) {
      return memo.prob > cat.prob ? memo : cat;
    });

    var cat;
    _(probs).map(function(prob) {
      if(prob.cat == max.cat)
        return;
      if(prob.prob * this.threshold(max.cat) > max.prob)
        cat = this.def; // not greater than other category by enough - use default
    }, this);
    return cat || max.cat;
  },

  test : function(data) {
    var error = 0;
    for(var i = 0; i < data.length; i++) {
      var output = this.classify(data[i].input);
      error += output == data[i].output ? 0 : 1;
    }
    return error / data.length;
  }
}

exports.BayesianClassifier = BayesianClassifier;