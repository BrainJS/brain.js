// import LSTM from '../../src/recurrent/lstm';
// import fs from 'fs';
// //var json = JSON.parse(fs.readFileSync('format-data.json').toString());
// var net = new LSTM({
//   //json: json
// });
// var trainingData = [{
//     input: 'hi',
//     output: 'mom'
//   }, {
//     input: 'howdy',
//     output: 'dad'
//   }, {
//     input: 'hello',
//     output: 'sis'
//   }, {
//     input: 'yo',
//     output: 'bro'
//   }];
// net.train(trainingData, { iterations: 200, log: true });
// fs.writeFileSync('format-data.json', JSON.stringify(net.toJSON()));
// console.log(net.run('hi'));
// console.log(net.run('howdy'));
// console.log(net.run('hello'));
// console.log(net.run('yo'));
import Vocab from '../../src/utilities/vocab';
import LSTM from '../../src/recurrent/lstm';
import fs from 'fs';
import assert from 'assert';
//var json = JSON.parse(fs.readFileSync('transaction-training-data.json').toString()); //<- uncomment to read for further training
let net = new LSTM();
let transationTypes = {
credit: 0,
debit: 1,
personalCard: 2,
other: 3
};
var trainingData = [{
input: [transationTypes.credit],
output: 'credit'
}, {
input: [transationTypes.debit],
output: 'debit'
}, {
input: [transationTypes.personalCard],
output: 'personal card'
}, {
input: [transationTypes.other],
output: 'other'
}];
net.train(trainingData, { iterations: 100, log: true });
//fs.writeFileSync('transaction-training-data.json', JSON.stringify(net.toJSON()));
console.log(net.run([transationTypes.credit]));
console.log(net.run([transationTypes.debit]));
console.log(net.run([transationTypes.personalCard]));
console.log(net.run([transationTypes.other]));

