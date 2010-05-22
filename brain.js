NeuralNetwork = function(options) {
  this.learningRate = 0.5;
  this.growthRate = 0.5;
  this.setOptions(options);

  this.createLayers(this.hidden);
}

NeuralNetwork.prototype = {

  setOptions : function(options) {
    if(options) {
      for(option in options)
        this[option] = options[option];
    }
  },

  createLayers : function(hidden, json) {
    this.layers = [];

    var nlayers = 3; // one hidden layer is default
    if(hidden)
      nlayers = hidden.length + 2;
    else if(json)
      nlayers = json.layers.length;

    var prevLayer;
    for(var i = 0; i < nlayers; i++) {
      if(hidden)
        var nnodes = hidden[i - 1];
      if(json)
        var layerJSON = json.layers[i];
      var layer = new Layer(this, prevLayer, nnodes, layerJSON);
      this.layers.push(layer);
      prevLayer = layer;
    }

    this.inputLayer = this.layers[0];
    this.outputLayer = this.layers[nlayers - 1];
    if(!hidden && !json)
      this.hiddenLayer = this.layers[1];
    else
      this.hiddenLayer = null;
  },

  run : function(inputs) {
    this.inputLayer.createNodes(inputs);
    if(this.hiddenLayer)
      this.hiddenLayer.growLayer(this.inputLayer.size);

    this.inputLayer.outputs = inputs;

    for(var i = 1; i < this.layers.length; i++)
      this.layers[i].calcOutputs();

    var outputs = this.outputLayer.outputs;
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

    return this.outputLayer.error;
  },

  train: function(data, iterations, errorThresh) {
    if(!iterations)
      iterations = 20000;
    if(!errorThresh)
      errorThresh = 0.01;
    var error = 1;
    for(var i = 0; i < iterations && error > errorThresh; i++) {
      var sum = 0;
      for(var j = 0; j < data.length; j++)
        sum += this.trainItem(data[j].input, data[j].output);
      error = sum / data.length;
    }
    return error;
  },

  formatOutput : function(outputs) {
    var values = [];
    for(var id in outputs) {
      if(parseInt(id) != id) // not an array
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
    this.layers = [];
    this.createLayers(null, json);
    return this;
  },

  toFunction: function() {
    var json = this.toJSON();
    // currying w/ closures won't do, this needs to be standalone
    return new Function("inputs",
 'var net = ' + JSON.stringify(json) + ';\n\n\
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
  get outputs() {
    return this.map(function(node) { return node.output; });
  },

  set outputs(outputs) {
    this.map(function(node, id) { node.output = outputs[id] || 0; });
  },

  get error() {
    var sum = 0;
    this.map(function(node) { sum += node.error; });
    return sum / this.size;
  },

  get size() {
    var n = 0;
    for(var id in this.nodes)
      n++;
    return n;
  },

  map : function(callback) {
    var values = {};
    for(var id in this.nodes)
      values[id] = callback(this.nodes[id], id);
    return values;
  },

  growLayer : function(inputSize) {
	if(inputSize < 5)
	  var targetSize = inputSize;
	else
	  var targetSize = inputSize * this.network.growthRate;
    for(var i = this.size; i < targetSize; i++)
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
    for(var id in this.incoming)
      this.weights[id] = this.randomWeight();
    this.bias = this.randomWeight(); // instead of having a seperate bias node
  }
}

Node.prototype = {
  get inputs() { return this.layer.prevLayer.outputs; },

  get incoming() { return this.layer.prevLayer.nodes; },
 
  get outgoing() { return this.layer.nextLayer.nodes; },

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
      sum += this.weights[id] * this.inputs[id];
    this.output = this.sigmoid(sum);
  },

  calcError : function(targets) {
    var error;
    if(targets) {
      var expected = targets[this.id] || 0;
      error = (expected - this.output);
    }
    else {
      error = 0;
      for(var id in this.outgoing)
        error += this.outgoing[id].delta * this.outgoing[id].weights[this.id];
    }
    this.error = Math.abs(error);
    this.delta = error * this.dsigmoid(this.output);
  },

  adjustWeights : function() {
    var rate = this.layer.network.learningRate;
    for(var id in this.inputs)
      this.weights[id] += rate * this.delta * this.inputs[id];
    this.bias += rate * this.delta; 
  },

  toJSON : function() {
    return { weights: this.weights, bias: this.bias};
  },

  fromJSON : function(json) {
    this.weights = json.weights;
    this.bias = json.bias;
  },
}

exports.NeuralNetwork = NeuralNetwork;
