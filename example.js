var brain = require("./brain");

var net = new brain.NeuralNetwork();

var data = [{input: [0, 0], target: [0]},
            {input: [0, 1], target: [1]},
            {input: [1, 0], target: [1]},
            {input: [1, 1], target: [0]}];

net.train(data);
var output = net.run([1, 0]);  // 0.988...


var sys = require("sys"); sys.puts(output); // node

// print(output); // narwhal


