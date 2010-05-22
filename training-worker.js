importScripts("brain.js");

onmessage = function(event) {
  var data = JSON.parse(event.data);
  var net = new NeuralNetwork();
  var iterations = 8000;
  net.train(data, iterations);

  postMessage(JSON.stringify(net.toJSON()));
}
