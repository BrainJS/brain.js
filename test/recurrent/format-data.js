import GRU from '../../src/recurrent/gru';
import fs from 'fs';
//var json = JSON.parse(fs.readFileSync('format-data.json').toString());
//delete json.options.vocab;
var net = new GRU();
var trainingData = [{
    input: 'hi',
    output: '1'
  }, {
    input: 'howdy',
    output: '2'
  }, {
    input: 'hello',
    output: '3'
  }, {
    input: 'yo',
    output: '4'
  }];
net.train(trainingData, { iterations: 20000, log: true });
fs.writeFileSync('format-data.json', JSON.stringify(net.toJSON()));
console.log(net.run('hi'));
console.log(net.run('howdy'));
console.log(net.run('hello'));
console.log(net.run('yo'));
