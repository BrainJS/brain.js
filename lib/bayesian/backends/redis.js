var redis = require("redis"),
    _ = require("underscore")._,
    sys = require("sys");

var RedisBackend = function(options) {
  options = options || {};
  var port = options.port || 6379;
  var host = options.hostname || "localhost";
  var opts = options.options || {};
  this.client = function() {
    return redis.createClient(port, host, opts);
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
    client.multi(); // make multi so we can have one callback

    _(catIncs).each(function(inc, cat) {
      client.hincrby(this.catsKey, cat, inc);
    }, this);

    _(wordIncs).each(function(wordCounts, word) {
      _(wordCounts).each(function(inc, cat) {
        client.hincrby(this.wordsKey, this.key(word, cat), inc);
      }, this);
    }, this);

    var that = this;
    client.exec(function(err, ret) {
      client.close();
      callback(ret);
    });
  },

  getCats : function(callback) {
    var that = this;
    var client = this.client();
    client.hgetall(this.catsKey, function(err, cats) {
      _(cats).each(function(val, cat) {
        cats[cat] = parseInt(val); // redis lib gives strings back
      });
      client.close();
      callback(cats);
    });
  },

  getWordCounts : function(words, cats, callback) {
    var keys = _(words).reduce(function(keys, word) {
       return keys.concat(_(cats).map(function(count, cat) {
         return this.key(word, cat);
       },this));
    }, [], this);

    var that = this;
    // redis lib won't take array of args
    var hmgetArgs = [this.wordsKey].concat(keys);
    hmgetArgs.push(function(err, vals) {
      var counts = {};
      keys.map(function(key, i) {
         var pair = that.pair(key);
         var word = pair[0], cat = pair[1];
         counts[word] = counts[word] ? counts[word] : {};
         counts[word][cat] = parseInt(vals[i]) || 0;
      }, this);
      client.close();
      callback(counts);
    });
    var client = this.client();
    client.hmget.apply(client, hmgetArgs);
  },
}

exports.RedisBackend = RedisBackend;