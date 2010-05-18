importScripts("brain.js");

onmessage = function(event) {
  postMessage("hello");
  var data = event.data;
  var net = new NeuralNetwork();
  net.train(data);

  postMessage(net.toFunction().toString());
}
