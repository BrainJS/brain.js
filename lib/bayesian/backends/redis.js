var redis = require("redis"),
    _ = require("underscore")._,
    sys = require("sys");

var RedisBackend = function(options) {
  options = options || {};
  var port = options.port || 6379;
  var host = options.hostname || "localhost";
  var opts = options.options || {};

  this.client = function() {
    var client = redis.createClient(port, host, opts);
    if(options.error)
      client.on('error', options.error);
    return client;
  }

  var name = options.name || Math.floor(Math.random() * 100000);
  this.catsKey = 'brain_bayes_cats_' + name;
  this.wordsKey = 'brain_bayes_words_' + name;

  if(options.db)
    this.client().select(options.db);
}

RedisBackend.prototype = {
  async : true,

  key : function(word, cat) {
    return word + "____" + cat; // flatten word count hash
  },

  pair : function(key) {
    return /(.*)____(.*)/.exec(key).slice(1);
  },

  incCounts : function(catIncs, wordIncs, callback) {
    // create new client for each call so we can close each time
    var client = this.client();
    var multi = client.multi(); // make multi so we can have one callback

    _(catIncs).each(function(inc, cat) {
      multi.hincrby(this.catsKey, cat, inc);
    }, this);

    _(wordIncs).each(function(wordCounts, word) {
      _(wordCounts).each(function(inc, cat) {
        multi.hincrby(this.wordsKey, this.key(word, cat), inc);
      }, this);
    }, this);

    var that = this;
    multi.exec(function(err, ret) {
      if(callback)
        callback(ret);
      client.quit();
    });
  },

  getCats : function(callback) {
    var that = this;
    var client = this.client();
    client.hgetall(this.catsKey, function(err, cats) {
      _(cats).each(function(val, cat) {
        cats[cat] = parseInt(val); // redis lib gives strings back
      });
      callback(cats);
      client.quit();
    });
  },

  getWordCounts : function(words, cats, callback) {
    var keys = _(words).reduce(function(keys, word) {
       return keys.concat(_(cats).map(function(count, cat) {
         return this.key(word, cat);
       },this));
    }, [], this);

    var that = this;
    var args = [this.wordsKey].concat(keys);
    var client = this.client();
    client.hmget(args, function(err, vals) {
      var counts = {};
      keys.map(function(key, i) {
         var pair = that.pair(key);
         var word = pair[0], cat = pair[1];
         counts[word] = counts[word] ? counts[word] : {};
         counts[word][cat] = parseInt(vals[i]) || 0;
      });
      callback(counts);
      client.quit();
    });
  },
  
  toJSON: function(callback) {
    var that = this;
    this.getCats(function(cats) {
      var client = that.client();
      client.hgetall(that.wordsKey, function(err, wordCounts) {
        var words = {};
        for(key in wordCounts) {
          var pair = that.pair(key);
          var word = pair[0], cat = pair[1];
          words[word] = words[word] ? words[word] : {};
          words[word][cat] = parseInt(wordCounts[key]) || 0;
        }
        callback({cats: cats, words: words});
        client.quit();
      });
    });
  },
  
  fromJSON: function(json, callback) {
    this.incCounts(json.cats, json.words, callback); 
  }
}

exports.RedisBackend = RedisBackend;