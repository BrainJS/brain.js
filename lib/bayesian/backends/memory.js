var _ = require("underscore")._;

var MemoryBackend = function() {
  this.catCounts = {};
  this.wordCounts = {};
}

MemoryBackend.prototype = {
  async : false,

  incCounts : function(catIncs, wordIncs) {
    _(catIncs).each(function(inc, cat) {
      this.catCounts[cat] = this.catCounts[cat] + inc || inc;
    }, this);

    _(wordIncs).each(function(incs, word) {
      this.wordCounts[word] = this.wordCounts[word] || {};
      _(incs).each(function(inc, cat) {
        this.wordCounts[word][cat] = this.wordCounts[word][cat] + inc || inc;
      }, this);
    }, this);
  },

  getCats : function() {
    return this.catCounts;
  },

  getWordCounts : function(words, cats) {
    return this.wordCounts;
  },
  
  toJSON : function() {
    return {cats: this.catCounts, words: this.wordCounts}
  },
  
  fromJSON : function(json) {
    this.catCounts = json.cats;
    this.wordCounts = json.words;
  }
}

exports.MemoryBackend = MemoryBackend;