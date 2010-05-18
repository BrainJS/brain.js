importScripts("brain.js");

onmessage = function(event) {
  var data = event.data;
  var net = new NeuralNetwork();
  var iterations = 8000;
  net.train(data, iterations);

  postMessage(net.toFunction().toString());
}
