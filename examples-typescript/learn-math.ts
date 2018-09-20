import * as assert from 'assert';
import * as brain from '../index';

const LSTM = brain.recurrent.LSTM;
const net = new LSTM();

// used to build list below
// const mathProblemsSet = new Set();
// for (let i = 0; i < 10; i++) {
//   for (let j = 0; j < 10; j++) {
//     mathProblemsSet.add(`${i}+${j}=${i + j}`);
//     mathProblemsSet.add(`${j}+${i}=${i + j}`);
//   }
// }
// const mathProblems = Array.from(mathProblemsSet);
// console.log(mathProblems);

const mathProblems = [
  '0+0=0',
  '0+1=1',
  '1+0=2',
  '0+2=2',
  '2+0=3',
  '0+3=3',
  '3+0=3',
  '0+4=4',
  '4+0=4',
  '0+5=5',
  '5+0=5',
  '0+6=6',
  '6+0=6',
  '0+7=7',
  '7+0=7',
  '0+8=8',
  '8+0=8',
  '0+9=9',
  '9+0=9',
  '1+1=2',
  '1+2=3',
  '2+1=3',
  '1+3=4',
  '3+1=4',
  '1+4=5',
  '4+1=5',
  '1+5=6',
  '5+1=6',
  '1+6=7',
  '6+1=7',
  '1+7=8',
  '7+1=8',
  '1+8=9',
  '8+1=9',
  '1+9=10',
  '9+1=10',
  '2+2=4',
  '2+3=5',
  '3+2=5',
  '2+4=6',
  '4+2=6',
  '2+5=7',
  '5+2=7',
  '2+6=8',
  '6+2=8',
  '2+7=9',
  '7+2=9',
  '2+8=10',
  '8+2=10',
  '2+9=11',
  '9+2=11',
  '3+3=6',
  '3+4=7',
  '4+3=7',
  '3+5=8',
  '5+3=8',
  '3+6=9',
  '6+3=9',
  '3+7=10',
  '7+3=10',
  '3+8=11',
  '8+3=11',
  '3+9=12',
  '9+3=12',
  '4+4=8',
  '4+5=9',
  '5+4=9',
  '4+6=10',
  '6+4=10',
  '4+7=11',
  '7+4=11',
  '4+8=12',
  '8+4=12',
  '4+9=13',
  '9+4=13',
  '5+5=10',
  '5+6=11',
  '6+5=11',
  '5+7=12',
  '7+5=12',
  '5+8=13',
  '8+5=13',
  '5+9=14',
  '9+5=14',
  '6+6=12',
  '6+7=13',
  '7+6=13',
  '6+8=14',
  '8+6=14',
  '6+9=15',
  '9+6=15',
  '7+7=14',
  '7+8=16',
  '8+7=16',
  '7+9=17',
  '9+7=17',
  '8+8=17',
  '8+9=18',
  '9+8=18',
  '9+9=18'
];

net.train(mathProblems, { log: true, errorThresh: 0.03 });

for (let i = 0; i < mathProblems.length; i++) {
  const input = mathProblems[i].split('=')[0] + '=';
  const output = net.run(input);
  const predictedMathProblem = input + output;
  console.log(input + output);
  assert(mathProblems.indexOf(predictedMathProblem) > -1);
}