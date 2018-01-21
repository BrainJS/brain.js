import assert from 'assert';
import NeuralNetwork from './../../src/neural-network';

describe('JSON', () => {
  let net = new NeuralNetwork();
  let test;
  let serialized;
  let net2;
  let input = {'0' : Math.random(), b: Math.random()};

  net.train ([{
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }, {
      input: {'0': Math.random(), b: Math.random()},
      output: {c: Math.random(), '0': Math.random()}
    }
  ]);

  serialized = net.toJSON();
  net2 = new NeuralNetwork().fromJSON(serialized);

  it('toJSON()/fromJSON()', () => {
    test = () => {
      let output1 = net.run(input);
      let output2 = net2.run(input);
      assert.equal(JSON.stringify(output2), JSON.stringify(output1), 'loading json serialized network failed');
    };
  });

  it('toFunction()', () => {
    test = () => {
      const output1 = net.run(input);
      const output2 = net.toFunction (input);

      function normalize(v) {
        const result = {};
        for (let p in v) {
          result[p] = v[p].toFixed(10);
        }
        return result;
      }
      assert.equal(JSON.stringify(normalize(output2)), JSON.stringify(normalize(output1)), 'standalone network function failed');
    };
  });
});
