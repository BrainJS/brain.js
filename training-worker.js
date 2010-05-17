
onmessage = function(event) {
  postMessage("hello");
  var data = event.data;
  var net = new NeuralNetwork();
	net.train(data, 100);

  postMessage(net.toFunction().toString());
}
