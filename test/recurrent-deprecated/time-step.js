import {assert} from 'chai';
import TimeStep from '../../src/recurrent/time-step';

/* NOTE: TimeStep here is deprecated though being committed as something new, it is the first feature we want using
 recurrent.js because it is simple one of the simplest recurrent neural networks and serves as a baseline to completing
 the GPU architecture.   This test is written so as to create the baseline we can measure against.
 We get this working, we have a baseline, we finish recurrent.js, we change the world.
  */
describe('timestep', () => {
  let xorNetValues = [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 0]
  ];
  it.only('can learn xor', () => {
    const net = new TimeStep({
      inputSize: 1,
      hiddenLayers: [20],
      outputSize: 1
    });
    net.train(xorNetValues, {
      iterations: 1000
    });
    console.log(net.run([0, 0]));
    console.log(net.run([0, 1]));
    console.log(net.run([1, 0]));
    console.log(net.run([1, 1]));
    assert(net.run([0, 0])[1] < 0.5);
    assert(net.run([0, 1])[1] > 0.5);
    assert(net.run([1, 0])[1] > 0.5);
    assert(net.run([1, 1])[1] < 0.5);
  });
});