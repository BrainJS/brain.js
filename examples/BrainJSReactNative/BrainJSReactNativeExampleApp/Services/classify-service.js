const brain = require('brain.js')
const json = require('./trained-model')

export default classify = {

classifyLyrics(inputText) {

if(inputText == undefined || inputText == null) {
    return null;
}

//credit - Daniel Simmons - https://itnext.io/you-can-build-a-neural-network-in-javascript-even-if-you-dont-really-understand-neural-networks-e63e12713a3

let trainedNet;

var net = new brain.NeuralNetwork()

net.fromJSON(
    json
);

function encode(arg) {
    return arg.split('').map(x => (x.charCodeAt(0) / 256));
}
    let results = net.run(encode(inputText));
    return results
  }
}