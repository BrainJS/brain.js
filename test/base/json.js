import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

function normalize(v) {
  const result = {};
  for (let p in v) {
    result[p] = v[p].toFixed(7);
  }
  return result;
}

describe('JSON', () => {
  let net = new NeuralNetwork();

  net.train([
    {
      input: {'0': 1, b: 1},
      output: {c: .5, '0': .5}
    },
    {
      input: {'0': .5, b: .5},
      output: {c: 0, '0': 0}
    }
  ]);

  let serialized = net.toJSON();
  let net2 = new NeuralNetwork().fromJSON(serialized);

  let input = {'0' : 1, b: 1};

  it('toJSON()/fromJSON()', () => {
    let output1 = net.run(input);
    let output2 = net2.run(input);

    assert.deepEqual(output2, output1,
      'loading json serialized network failed');
  });

  it('toFunction()', () => {
    const output1 = net.run(input);
    const output2 = net.toFunction()(input);

    assert.equal(JSON.stringify(normalize(output2)), JSON.stringify(normalize(output1)),
      'standalone network function failed');
  })
});
