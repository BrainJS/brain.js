var NeuralNetwork = function(options) {
  options = options || {};
  this.learningRate = options.learningRate || 0.5;
  this.growthRate = options.growthRate || 0.5;
  this.momentum = options.momentum || 0.1;

  this.createLayers(options.hidden);
}

NeuralNetwork.prototype = {
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
    iterations = iterations || 20000;
    errorThresh = errorThresh || 0.007;

    var error = 1;
    for(var i = 0; i < iterations && error > errorThresh; i++) {
      var sum = 0;
      for(var j = 0; j < data.length; j++) {
        var err = this.trainItem(data[j].input, data[j].output);
        sum += Math.pow(err, 2);
      }
      error = Math.sqrt(sum / data.length); // mean squared error

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
    var sum = this.reduce(function(sum, node) {
      return sum + Math.pow(node.error, 2);
    }, 0);
    return Math.sqrt(sum / this.getSize()) // mean squared error
  },

  getSize : function() {
    return this.reduce(function(count) { return ++count; }, 0);
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
    for(var id in this.nodes)
      this.nodes[id].calcOutput();
  },

  calcErrors : function(targets) {
    for(var id in this.nodes)
      this.nodes[id].calcError(targets);
  },

  adjustWeights : function() {
    for(var id in this.nodes)
      this.nodes[id].adjustWeights();
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
    this.change = {};
    for(var id in this.getIncoming())
      this.addIncoming(id);
    this.bias = this.randomWeight(); // instead of having a seperate bias node
  }
}

Node.prototype = {
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
    this.change[id] = 0;
  },

  calcOutput : function() {
    var sum = this.bias;
    var inputs = this.getIncoming();
    for(var id in this.weights)
      sum += this.weights[id] * inputs[id].output;
    this.output = this.sigmoid(sum);
  },

  calcError : function(targets) {
    if(targets) {
      var expected = targets[this.id] || 0;
      this.error = expected - this.output;
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
    var momentum = this.layer.network.momentum;

    var inputs = this.getIncoming();
    for(var id in inputs) {
      var change = rate * this.delta * inputs[id].output + momentum * this.change[id];
      this.change[id] = change;
      this.weights[id] += change;
    }
    this.bias += rate * this.delta; 
  },

  toJSON : function() {
    return { weights: this.weights, bias: this.bias };
  },

  fromJSON : function(json) {
    this.weights = json.weights;
    this.bias = json.bias;
  }
}

exports.NeuralNetwork = NeuralNetwork;
