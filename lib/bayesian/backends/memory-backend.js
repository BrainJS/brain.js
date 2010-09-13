var _ = require("underscore")._,
    sys = require("sys");

var MemoryBackend = function(options) {
  this.catCounts = {};
  this.wordCounts = {};
}

MemoryBackend.prototype = {
  async : false,

  incCounts : function(catIncs, wordIncs) {
    _(catIncs).each(function(inc, cat) {
      this.catCounts[cat] = this.catCounts[cat] + inc || inc;
    }, this);

    _(wordIncs).each(function(wordCounts, word) {
      _(wordCounts).each(function(inc, cat) {
        this.wordCounts[word] = this.wordCounts[word] || {};
        this.wordCounts[word][cat] = this.wordCounts[word][cat] + inc || inc;
      }, this);
    }, this);
  },

  getCats : function() {
    return this.catCounts;
  },

  getWordCounts : function(words, cats) {
    return this.wordCounts;
  }
}

exports.MemoryBackend = MemoryBackend;