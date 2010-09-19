/*
Copyright (c) 2010 Heather Arthur

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var brain = (function(){
  var exports = {};

  /* Neural Network */
  NeuralNetwork = function(options) {
    this.learningRate = 0.5;
    this.growthRate = 0.5;
    if(options)
      this.setOptions(options);

    this.createLayers(this.hidden);
  }

  NeuralNetwork.prototype = {
    setOptions : function(options) {
      for(option in options)
        this[option] = options[option];
    },

    createLayers : function(hidden, json) {
      var nlayers = 3; // one hidden layer is default
      if(hidden)
        nlayers = hidden.length + 2;
      else if(json)
        nlayers = json.layers.length;

      this.layers = [];
      for(var i = 0; i < nlayers; i++) {
        var nnodes = hidden ? hidden[i - 1] : 0;
        var layerJSON = json ? json.layers[i] : null;
        var layer = new Layer(this, layer, nnodes, layerJSON);
        this.layers.push(layer);
      }

      this.inputLayer = this.layers[0];
      this.outputLayer = this.layers[nlayers - 1];
      if(!hidden && !json)
        this.hiddenLayer = this.layers[1]; // hold onto for growing
      else
        this.hiddenLayer = null;
    },

    run : function(inputs) {
      this.inputLayer.createNodes(inputs);
      if(this.hiddenLayer)
        this.hiddenLayer.growLayer(this.inputLayer.getSize());

      this.inputLayer.setOutputs(inputs);
      for(var i = 1; i < this.layers.length; i++)
        this.layers[i].calcOutputs();

      var outputs = this.outputLayer.getOutputs();
      return this.formatOutput(outputs);
    },

    trainItem : function(inputs, targets) {
      this.outputLayer.createNodes(targets);

      this.run(inputs);

      this.outputLayer.calcErrors(targets);
      for(var i = this.layers.length - 2; i >= 0; i--)
        this.layers[i].calcErrors();

      for(var i = 1; i < this.layers.length; i++)
        this.layers[i].adjustWeights();

      return this.outputLayer.getError();
    },

    train : function(data, iterations, errorThresh, callback, resolution) {
      if(!iterations)
        iterations = 20000;
      if(!errorThresh)
        errorThresh = 0.005;

      var error = 1;
      for(var i = 0; i < iterations && error > errorThresh; i++) {
        var sum = 0;
        for(var j = 0; j < data.length; j++) {
          var err = this.trainItem(data[j].input, data[j].output);
          sum += Math.pow(err, 2);
        }
        error = Math.sqrt(sum) / data.length; // mean squared error

        if(callback && (i % resolution == 0))
          callback({error: error, iterations: i});
      }
      return {error: error, iterations: i};
    },
  
    trainAll : function(data) { // called by brain.crossValidate()
      this.train(data);
    },
  
    getError : function(output, target) {
      var error = 0, count = 0;
      for(var id in output) {
        error += Math.pow(output[id] - target[id], 2);
        count++;
      }
      return error / count; // average mse
    },
  
    test : function(data) {
      var error = 0;
      for(var i = 0; i < data.length; i++) {
        var output = this.run(data[i].input);
        error += this.getError(output, data[i].output);
      }
      return error / data.length; // average error
    },

    formatOutput : function(outputs) {
      /* we use hashes internally, turn back into array if needed */
      var values = [];
      for(var id in outputs) {
        if(parseInt(id) != id) // not an array index
          return outputs;
        values.push(outputs[id]);
      }
      return values;
    },

    toJSON : function() {
      var json = {layers: []};
      for(var i = 0; i < this.layers.length; i++)
        json.layers.push(this.layers[i].toJSON());
      return json;
    },

    fromJSON : function(json) {
      this.createLayers(null, json);
      return this;
    },

    toFunction: function() {
      var json = this.toJSON();
      // currying w/ closures won't do, this needs to be standalone
      return new Function("inputs",
  '  var net = ' + JSON.stringify(json) + ';\n\n\
    for(var i = 1; i < net.layers.length; i++) {\n\
      var nodes = net.layers[i].nodes;\n\
      var outputs = {};\n\
      for(var id in nodes) {\n\
        var node = nodes[id];\n\
        var sum = node.bias;\n\
        for(var iid in node.weights)\n\
          sum += node.weights[iid] * inputs[iid];\n\
        outputs[id] = (1/(1 + Math.exp(-sum)));\n\
      }\n\
      inputs = outputs;\n\
    }\n\
    return outputs;');
      // note: this doesn't handle never-been-seen before inputs
    },

    toString : function() {
      return JSON.stringify(this.toJSON());
    }
  }

  function Layer(network, prevLayer, numNodes, json) {
    this.network = network;
    this.prevLayer = prevLayer;
    if(this.prevLayer) 
      this.prevLayer.nextLayer = this;

    this.nodes = {};
    if(json) {
      this.fromJSON(json);
    }
    else if(numNodes) {
      for(var i = 0; i < numNodes; i++)
        this.createNode(i);
    }
  }

  Layer.prototype = {
    getOutputs : function() { // output is kept as state for backpropagation
      return this.map(function(node) { return node.output; });
    },

    setOutputs : function(outputs) {
      this.map(function(node, id) { node.output = outputs[id] || 0; });
    },

    getError : function() {
      var sum = this.reduce(function(sum, node) { return sum + Math.pow(node.error, 2);}, 0);
      return Math.sqrt(sum) / this.getSize(); // mean squared error
    },

    getSize : function() {
      return this.reduce(function(count) { return ++count;}, 0);
    },

    map : function(callback) {
      var values = {};
      for(var id in this.nodes)
        values[id] = callback(this.nodes[id], id);
      return values;
    },

    reduce : function(callback, value) {
      for(var id in this.nodes)
        value = callback(value, this.nodes[id]);
      return value;  
    },

    growLayer : function(inputSize) {
      var targetSize = inputSize;
      if(inputSize > 5)
        targetSize *= this.network.growthRate;
      for(var i = this.getSize(); i < targetSize; i++)
        this.createNode(i);
    },

    createNodes : function(ids) {
      for(var id in ids) {
        if(!this.nodes[id])
          this.createNode(id);
      }
    },

    createNode : function(id) {
      var node = new Node(this, id);
      this.nodes[id] = node;
    
      if(this.nextLayer) {
        var outgoing = this.nextLayer.nodes;
        for(var outid in outgoing)
          outgoing[outid].addIncoming(id);
      }
    },

    calcOutputs : function() {
      this.map(function(node) { node.calcOutput(); });
    },

    calcErrors : function(targets) {
      this.map(function(node) { node.calcError(targets); });
    },

    adjustWeights : function() {
      this.map(function(node) { node.adjustWeights(); });
    },

    toJSON : function() {
      var json = { nodes: {}};
      for(var id in this.nodes)
        json.nodes[id] = this.nodes[id].toJSON();
      return json;
    },

    fromJSON : function(json) {
      this.nodes = {};
      for(var id in json.nodes)
        this.nodes[id] = new Node(this, id, json.nodes[id]);
    },
  }

  function Node(layer, id, json) {
    this.layer = layer;
    this.id = id;
    this.output = 0;

    if(json) {
      this.fromJSON(json);
    }
    else if(this.layer.prevLayer) {
      this.weights = {};
      for(var id in this.getIncoming())
        this.addIncoming(id);
      this.bias = this.randomWeight(); // instead of having a seperate bias node
    }
  }

  Node.prototype = {
    getInputs : function() { return this.layer.prevLayer.getOutputs(); },

    getIncoming : function() { return this.layer.prevLayer.nodes; },
 
    getOutgoing : function() { return this.layer.nextLayer.nodes; },

    randomWeight : function() {
      return Math.random() * 0.4  - 0.2;
    },

    sigmoid : function(num) {
      return 1/(1 + Math.exp(-num));
    },

    dsigmoid : function(num) {
      return num * (1 - num);
    },
 
    addIncoming : function(id) {
      this.weights[id] = this.randomWeight();
    },

    calcOutput : function() {
      var sum = this.bias;
      for(var id in this.weights)
        sum += this.weights[id] * this.getInputs()[id];
      this.output = this.sigmoid(sum);
    },

    calcError : function(targets) {
      if(targets) {
        var expected = targets[this.id] || 0;
        this.error = (expected - this.output);
      }
      else {
        this.error = 0;
        var outgoing = this.getOutgoing();
        for(var id in outgoing)
          this.error += outgoing[id].delta * outgoing[id].weights[this.id];
      }
      this.delta = this.error * this.dsigmoid(this.output);
    },

    adjustWeights : function() {
      var rate = this.layer.network.learningRate;
      for(var id in this.getInputs())
        this.weights[id] += rate * this.delta * this.getInputs()[id];
      this.bias += rate * this.delta; 
    },

    toJSON : function() {
      return { weights: this.weights, bias: this.bias };
    },

    fromJSON : function(json) {
      this.weights = json.weights;
      this.bias = json.bias;
    },
  }

  exports.NeuralNetwork = NeuralNetwork;

  /* Bayesian */
  var LocalStorageBackend = function(options) {
    var options = options || {};
    var name = options.name || Math.floor(Math.random() * 100000);

    this.prefix = 'brain.bayesian.' + name;
  
    if(options.testing)
      localStorage = {};
  }

  LocalStorageBackend.prototype = {
    async : false,

    getCats : function() {
      return JSON.parse(localStorage[this.prefix + '.cats'] || '{}');
    },
  
    setCats : function(cats) {
      localStorage[this.prefix + '.cats'] = JSON.stringify(cats); 
    },
  
    getWordCount : function(word) {
      return JSON.parse(localStorage[this.prefix + '.words.' + word] || '{}');    
    },
  
    setWordCount : function(word, counts) {
      localStorage[this.prefix + '.words.' + word] = JSON.stringify(counts);    
    },
  
    getWordCounts : function(words) {
      var counts = {};
      words.forEach(function(word) {
        counts[word] = this.getWordCount(word);
      }, this);
      return counts;
    },

    incCounts : function(catIncs, wordIncs) {
      var cats = this.getCats();
      _(catIncs).each(function(inc, cat) {
        cats[cat] = cats[cat] + inc || inc;
      }, this);
      this.setCats(cats);

      _(wordIncs).each(function(incs, word) {
        var wordCounts = this.getWordCount(word);
        _(incs).each(function(inc, cat) {
          wordCounts[cat] = wordCounts[cat] + inc || inc;
        }, this);
        this.setWordCount(word, wordCounts);
      }, this);
    }
  }

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
    }
  }

  BayesianClassifier = function(options) {
    options = options || {}
    this.thresholds = options.thresholds || {};
    this.def = options.def || 'unclassified';
    this.weight = options.weight || 1;
    this.assumed = options.assumed || 0.5;
  
    var backend = options.backend || {type: 'memory'};
    switch(backend.type.toLowerCase()) {
      case 'localstorage':
        this.backend = new LocalStorageBackend(backend.options);
        break;
      default:
        this.backend = new MemoryBackend();
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

  /* crossValidate */
  function testSet(classifierFunc, options, trainingSet, testingSet) {
    var classifier = new classifierFunc(options);
    var t1 = Date.now();
    classifier.trainAll(trainingSet);
    var t2 = Date.now();
    var error = classifier.test(testingSet);
    var t3 = Date.now();
  
    return {
      error : error,
      trainTime : t2 - t1,
      testTime : t3 - t2,
      trainSize: trainingSet.length,
      testSize: testingSet.length 
    };
  }

  var crossValidate = function(classifierFunc, options, data, slices) {
    var sliceSize = data.length / slices;
    var partitions = _.range(slices).map(function(i) {
      var dclone = _(data).clone();
      return [dclone.splice(i * sliceSize, sliceSize), dclone];
    });

    var results = _(partitions).map(function(partition, i) {
      return testSet(classifierFunc, options, partition[1], partition[0]);
    });
    return results;
  }

  exports.crossValidate = crossValidate;

  return exports;
})();