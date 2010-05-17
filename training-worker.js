importScripts('brain.js'); 

onmessage = function(event) {
  var data = event.data;
  var net = new NeuralNetwork();
	net.train(data, 5000);

  postMessage(net.toFunction().toString());
}
