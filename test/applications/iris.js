import iris from 'js-datasets-iris';
import NeuralNetwork from '../../src/neural-network.js';
import NeuralNetworkGPU from '../../src/neural-network-gpu.js';
iris.shuffle();

const data = iris.data;
let trainingSet = [];

function dressData() {
    data.forEach(row => {
        trainingSet.push({
            input: row.slice(0, 4),
            output: row.slice(4)
        });
    });
}

function mapStringClassesToNumber() {
    let names = new Set();

    trainingSet.forEach(row => {
        names.add(row.output[0]);
    });

    names = [...names];

    trainingSet = trainingSet.map(row=>{
        let index = names.indexOf(row.output[0]);
        row.output = [0,0,0];
        row.output[index] = 1;
        return row;
    });
}

dressData();
mapStringClassesToNumber();

const net = new NeuralNetworkGPU();

net.train(trainingSet, {
    log: true,
});