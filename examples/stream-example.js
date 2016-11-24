var assert = require('assert');
var brain = require('../dist/brain');
var net = new brain.NeuralNetwork();
var xor = [
  { input: [0, 0], output: [0]},
  { input: [0, 1], output: [1]},
  { input: [1, 0], output: [1]},
  { input: [1, 1], output: [0]}
];

var trainStream = net.createTrainStream({
  /**
   * Write training data to the stream. Called on each training iteration.
   */
  floodCallback: function() {
    flood(trainStream, xor);
  },

  /**
   * Called when the network is done training.
   */
  doneTrainingCallback: function(obj) {
    console.log('trained in ' + obj.iterations + ' iterations with error: '
                + obj.error);

    var result = net.run([0, 1]);

    console.log('0 XOR 1: ', result);  // 0.987
  }
});

// kick it off
flood(trainStream, xor);

function flood(stream, data) {
  for (var i = 0; i < data.length; i++) {
    stream.write(data[i]);
  }
  // let it know we've reached the end of the data
  stream.write(null);
}
