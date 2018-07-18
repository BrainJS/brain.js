import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import DataFormatter from '../../src/utilities/data-formatter';
import rnnCheck from '../utilities/rnn-check';

function notZero(v) {
  return v !== 0;
}

function isZero(v) {
  return v === 0;
}

describe('rnn', () => {
  describe('basic operations', () => {
    it('starts with zeros in input.deltas', () => {
      (new RNN()).model.input.deltas.forEach((v) => {
        assert(v === 0);
      });
    });
    it('after initial run, does not have zeros in deltas', () => {
      let net = new RNN({
        hiddenSizes: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2
      });
      net.runInput([1, 1, 0]);
      net.model.input.deltas.forEach((v) => {
        assert.equal(v, 0);
      });
      net.runBackpropagate([1, 1, 0]);
      net.runBackpropagate([0, 1, 1]);
      net.runBackpropagate([1, 0, 1]);
      net.runBackpropagate([1, 1, 0]);
      assert(net.model.input.deltas.some(notZero));
    });
    it('can handle unrecognized input characters', () => {
      var net = new RNN({ hiddenSizes: [3] });
      net.train([
        { input: '1', output: '2' },
        { input: '2', output: '3' },
      ]);

      assert.doesNotThrow(() => {
        net.run('7');
      });
    });
  });
  describe('xor', () => {
    function xorNet() {
      return new RNN({
        hiddenSizes: [9, 9],
        inputSize: 3,
        inputRange: 3,
        outputSize: 3
      });
    }

    let xorNetValues = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ];

    it('properly provides values to equations[].run', () => {
      let net = xorNet();
      let called = [];
      net.model.equations[0] = { run: (v) => {
        called[0] = v;
        return {rows: 1, columns: 0, weights: [], deltas: []}; }
      };
      net.model.equations[1] = { run: (v) => {
        called[1] = v;
        return {rows: 0, columns: 0, weights: [], deltas: []}; }
      };
      net.model.equations[2] = { run: (v) => {
        called[2] = v;
        return {rows: 0, columns: 0, weights: [], deltas: []}; }
      };
      net.model.equations[3] = { run: (v) => {
        called[3] = v;
        return {rows: 0, columns: 0, weights: [], deltas: []}; }
      };
      net.model.equations[4] = { run: (v) => {
        called[4] = v;
        return {rows: 0, columns: 0, weights: [], deltas: []}; }
      };
      net.runInput([0, 0, 0]);
      assert.equal(called.length, 4);
      assert.equal(called[0], 0);
      assert.equal(called[1], 1);
      assert.equal(called[2], 1);
      assert.equal(called[3], 1);
      net.runInput([0, 1, 1]);
      assert.equal(called.length, 4);
      assert.equal(called[0], 0);
      assert.equal(called[1], 1);
      assert.equal(called[2], 2);
      assert.equal(called[3], 2);
    });

    it('properly provides values to equations[].runBackpropagate', () => {
      let net = xorNet();
      let backPropagateCalled = [];
      net.model.equations[0] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[3] = v;
        }
      };
      net.runInput([0, 0, 0]);
      net.runBackpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.runInput([0, 1, 1]);
      net.runBackpropagate([0, 1, 1]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 2);
      assert.equal(backPropagateCalled[3], 2);
    });

    it('properly provides values to equations[].runBackpropagate', () => {
      let net = xorNet();
      let backPropagateCalled = [];
      net.model.equations[0] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[3] = v;
        }
      };
      net.runInput([0, 0, 0]);
      net.runBackpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.runInput([0, 1, 1]);
      net.runBackpropagate([0, 1, 1]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 2);
      assert.equal(backPropagateCalled[3], 2);
    });

    it('is fully connected and gives values in deltas', () => {
      let net = xorNet();
      let input = xorNetValues[2];
      net.model.allMatrices.forEach((m) => {
        m.deltas.forEach((value) => {
          assert.equal(value, 0);
        });
      });
      net.runInput(input);

      net.model.input.deltas.forEach((v) => {
        assert.equal(v, 0);
      });
      net.model.hiddenLayers.forEach((layer) => {
        for (let p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          layer[p].deltas.forEach((v) => {
            assert.equal(v, 0);
          });
        }
      });
      net.model.output.deltas.forEach((v) => {
        assert.equal(v, 0);
      });

      net.runBackpropagate(input);

      assert(net.model.input.deltas.some(notZero));
      net.model.hiddenLayers.forEach((layer) => {
        for (let p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          if (!layer[p].deltas.some(notZero)) console.log(p);
          //assert(layer[p].deltas.some(notZero));
        }
      });
      assert(net.model.output.deltas.some(notZero));

      net.model.equations.forEach((equation) => {
        equation.states.forEach((state) => {
          if (state.left && state.left.deltas) state.left.deltas.some(notZero);
          if (state.right && state.right.deltas) state.right.deltas.some(notZero);
          if (state.product && state.product.deltas) state.product.deltas.some(notZero);
        });
      });
    });

    it('deltas and weights do not explode', () => {
      let net = xorNet();
      let input = xorNetValues[2];
      for (let i = 0; i < 100; i++)
      {
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
        net.runInput(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
        net.runBackpropagate(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
        net.step();
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
      }
    });

    it('can learn xor (error goes down)', () => {
      let net = xorNet();
      let initialError;
      let error;

      for (let i = 0; i < 10; i++) {
        let input = xorNetValues[Math.floor((xorNetValues.length - 1) * Math.random())];
        error = net.trainPattern(input);
        if (i === 0) {
          initialError = error;
        }
        console.log(error);
      }
      assert(initialError > error);
    });

    it('can predict xor', () => {
      let net = xorNet();
      for (let i = 0; i < 10; i++) {
        xorNetValues.forEach(function(value) {
          console.log(net.trainPattern(value));
        });
      }
      assert.equal(net.run().length, 3);
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        let net = new RNN({
          inputSize: 6,
          inputRange: 12,
          outputSize: 6
        });
        let json = net.toJSON();

        compare(json.input, net.model.input);
        net.model.hiddenLayers.forEach((layer, i) => {
          compare(json.hiddenLayers[i].weight, layer.weight);
          compare(json.hiddenLayers[i].transition, layer.transition);
          compare(json.hiddenLayers[i].bias, layer.bias);
        });
        compare(json.output, net.model.output);
        compare(json.outputConnector, net.model.outputConnector);

        function compare(left, right) {
          left.weights.forEach((value, i) => {
            assert.equal(value, right.weights[i]);
          });
          assert.equal(left.rows, right.rows);
          assert.equal(left.columns, right.columns);
        }
      });
    });

    describe('.fromJSON', () => {
      it('can import model from json', () => {
        let dataFormatter = new DataFormatter('abcdef'.split(''));
        let jsonString = JSON.stringify(new RNN({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        let clone = new RNN({ json: JSON.parse(jsonString) });

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        let dataFormatter = new DataFormatter('abcdef'.split(''));
        let jsonString = JSON.stringify(new RNN({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        let clone = new RNN({ json: JSON.parse(jsonString) });
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        assert.notEqual(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });
    });
  });

  describe('rnn.trainPattern', () => {
    it('changes the neural net when ran', () => {
      let net = new RNN({
        dataFormatter: new DataFormatter([0, 1]),
        hiddenLayers: [2]
      });
      var netBeforeTraining = JSON.stringify(net.toJSON());

      net.train([
        [0, 0, 0],
        [0, 1, 1],
        [1, 0, 1],
        [1, 1, 0]
      ], { iterations: 10, log: true });
      var netAfterTraining = JSON.stringify(net.toJSON());
      assert.notEqual(netBeforeTraining, netAfterTraining);
    });
  });

  describe('rnn.toFunction', () => {
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      let net = new RNN({
        inputSize: 7,
        inputRange: dataFormatter.characters.length,
        outputSize: 7
      });

      for (let i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(dataFormatter.toCharacters(net.run()).join(''));
        }
      }

      let lastOutput = dataFormatter.toCharacters(net.run()).join('');
      assert.equal(dataFormatter.toCharacters(net.toFunction()()).join(''), lastOutput);
    });
    it('can include the DataFormatter', () => {
      const net = new RNN();
      net.train(['hi mom!'], { iterations: 1 });
      const newNet = net.toFunction();
      newNet('hi mom!');
    });
  });
});