importScripts("brain-0.1.js");

onmessage = function(event) {
  var data = JSON.parse(event.data);
  var net = new NeuralNetwork();
  var iterations = 9000;
  net.train(data, iterations, 0.005, postProgress, 1000);

  postMessage(JSON.stringify({type: 'result', net: net.toJSON()}));
}

function postProgress(progress) {
  progress.type = 'progress'
  postMessage(JSON.stringify(progress));
}