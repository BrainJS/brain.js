import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

describe('JSON', () => {
  let net = new NeuralNetwork();

  net.train([{input:  {'0': Math.random(), b: Math.random()},
              output: {c: Math.random(), '0': Math.random()}},
             {input:  {'0': Math.random(), b: Math.random()},
              output: {c: Math.random(), '0': Math.random()}}]);

  let serialized = net.toJSON();
  let net2 = new NeuralNetwork().fromJSON(serialized);

  let input = {'0' : Math.random(), b: Math.random()};

  it('toJSON()/fromJSON()', () => {
    let output1 = net.run(input);
    let output2 = net2.run(input);

    assert.equal(JSON.stringify(output1), JSON.stringify(output2),
                  'loading json serialized network failed');
  });

  it('toFunction()', () => {
    let output1 = net.run(input);
    let output2 = net.toFunction()(input);

    assert.equal(JSON.stringify(output1), JSON.stringify(output2),
                   'standalone network function failed');
  })
});
