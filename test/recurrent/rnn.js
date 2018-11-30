import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import DataFormatter from '../../src/utilities/data-formatter';
import rnnCheck from '../utilities/rnn-check';

function notZero(v) {
  return v !== 0;
}

describe('rnn', () => {
  describe('constructor', () => {
    it('does not initialize model', () => {
      const net = new RNN();
      assert.equal(net.model, null);
    });
  });
  describe('initialize', () => {
    it('initializes model', () => {
      const net = new RNN();
      net.initialize();
      assert.notEqual(net.model, null);
    });
    it('can setup different size hiddenLayers', () => {
      const inputSize = 2;
      const hiddenLayers = [5,4,3];
      const networkOptions = {
        learningRate: 0.001,
        decayRate: 0.75,
        inputSize: inputSize,
        hiddenLayers,
        outputSize: inputSize
      };

      const net = new RNN(networkOptions);
      net.initialize();
      net.bindEquation();
      assert.equal(net.model.hiddenLayers.length, 3);
      assert.equal(net.model.hiddenLayers[0].weight.columns, inputSize);
      assert.equal(net.model.hiddenLayers[0].weight.rows, hiddenLayers[0]);
      assert.equal(net.model.hiddenLayers[1].weight.columns, hiddenLayers[0]);
      assert.equal(net.model.hiddenLayers[1].weight.rows, hiddenLayers[1]);
      assert.equal(net.model.hiddenLayers[2].weight.columns, hiddenLayers[1]);
      assert.equal(net.model.hiddenLayers[2].weight.rows, hiddenLayers[2]);
    });
  });
  describe('basic operations', () => {
    it('starts with zeros in input.deltas', () => {
      const net = new RNN();
      net.initialize();
      net.model.input.deltas.forEach((v) => {
        assert(v === 0);
      });
    });
    it('after initial run, does not have zeros in deltas', () => {
      let net = new RNN({
        hiddenLayers: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2
      });
      net.initialize();
      net.trainInput([1, 1, 0]);
      net.model.input.deltas.forEach((v) => {
        assert.equal(v, 0);
      });
      net.backpropagate([1, 1, 0]);
      net.backpropagate([0, 1, 1]);
      net.backpropagate([1, 0, 1]);
      net.backpropagate([1, 1, 0]);
      assert(net.model.input.deltas.some(notZero));
    });
    it('can handle unrecognized input characters', () => {
      var net = new RNN({ hiddenLayers: [3] });
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
      const net = new RNN({
        hiddenLayers: [20, 20],
        inputSize: 3,
        inputRange: 3,
        outputSize: 3
      });
      net.initialize();
      return net;
    }

    let xorNetValues = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ];

    it('properly provides values to equations[].predictTargetIndex', () => {
      let net = xorNet();
      let called = [];
      net.model.equations[0] = {
        predictTargetIndex: (v) => {
          called[0] = v;
          return {rows: 1, columns: 0, weights: [], deltas: []};
        }
      };
      net.model.equations[1] = {
        predictTargetIndex: (v) => {
          called[1] = v;
          return {rows: 0, columns: 0, weights: [], deltas: []};
        }
      };
      net.model.equations[2] = {
        predictTargetIndex: (v) => {
          called[2] = v;
          return {rows: 0, columns: 0, weights: [], deltas: []};
        }
      };
      net.model.equations[3] = {
        predictTargetIndex: (v) => {
          called[3] = v;
          return {rows: 0, columns: 0, weights: [], deltas: []};
        }
      };
      net.model.equations[4] = {
        predictTargetIndex: (v) => {
          called[4] = v;
          return {rows: 0, columns: 0, weights: [], deltas: []};
        }
      };
      net.trainInput([0, 0, 0]);
      assert.equal(called.length, 4);
      assert.equal(called[0], 0);
      assert.equal(called[1], 1);
      assert.equal(called[2], 1);
      assert.equal(called[3], 1);
      net.trainInput([0, 1, 1]);
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
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[3] = v;
        }
      };
      net.trainInput([0, 0, 0]);
      net.backpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.trainInput([0, 1, 1]);
      net.backpropagate([0, 1, 1]);
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
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        predictTargetIndex: () => {
          return {rows: 0, columns: 0, weights: [], deltas: []};
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[3] = v;
        }
      };
      net.trainInput([0, 0, 0]);
      net.backpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.trainInput([0, 1, 1]);
      net.backpropagate([0, 1, 1]);
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
      net.trainInput(input);

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

      net.backpropagate(input);

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
        net.trainInput(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
        net.backpropagate(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(!isNaN(value));
          });
        });
        net.adjustWeights();
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
        error = 0;
        for (let j = 0; j < 4; j++) {
          error += net.trainPattern(xorNetValues[j], true);
        }
        if (i === 0) {
          initialError = error;
        }
      }
      assert(initialError > error);
    });

    it('can predict xor', () => {
      let net = xorNet();
      for (let i = 0; i < 10; i++) {
        xorNetValues.forEach(function(value) {
          console.log(net.trainPattern(value, true));
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
        const inputSize = 6;
        const hiddenLayers = [10, 20];
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(new RNN({
          inputSize, //<- length
          hiddenLayers,
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON(), null, 2);

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        const cloneString = JSON.stringify(clone.toJSON(), null, 2);
        assert.equal(jsonString, cloneString);
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);

        assert.equal(clone.model.hiddenLayers.length, 2);
        assert.equal(clone.model.hiddenLayers[0].weight.columns, inputSize);
        assert.equal(clone.model.hiddenLayers[0].weight.rows, hiddenLayers[0]);
        assert.equal(clone.model.hiddenLayers[1].weight.columns, hiddenLayers[0]);
        assert.equal(clone.model.hiddenLayers[1].weight.rows, hiddenLayers[1]);
      });

      it('can import model from json using .fromJSON()', () => {
        let dataFormatter = new DataFormatter('abcdef'.split(''));
        let jsonString = JSON.stringify(new RNN({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });

      it('will not initialize when importing json', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const original = new RNN({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          hiddenLayers: [3, 3],
          outputSize: dataFormatter.characters.length //<- length
        });

        original.initialize();
        const jsonString = JSON.stringify(original.toJSON());

        const json = JSON.parse(jsonString);
        const clone = new RNN();
        clone.fromJSON(json);
        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const net = new RNN({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        });

        net.initialize();

        // over fit on purpose
        for (let i = 0; i < 10; i++) {
          net.trainPattern([0, 1, 1]);
          net.trainPattern([1, 0, 1]);
          net.trainPattern([1, 1, 0]);
          net.trainPattern([0, 0, 0]);
        }

        const error = net.trainPattern([0, 1, 1], true);
        const jsonString = JSON.stringify(net.toJSON());
        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        const newError = clone.trainPattern([0, 1, 1], true);
        assert((error - newError) < 0.02);
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

  describe('maxPredictionLength', () => {
    it('gets a default value', () => {
      assert.equal(new RNN().maxPredictionLength, RNN.defaults.maxPredictionLength);
    });
    it('restores option', () => {
      const maxPredictionLength = Math.random();
      assert.equal(new RNN({ maxPredictionLength }).maxPredictionLength, maxPredictionLength);
    });
    it('can be set multiple times', () => {
      const net = new RNN({ maxPredictionLength: 5 });
      assert.equal(net.maxPredictionLength, 5);
      net.maxPredictionLength = 1;
      assert.equal(net.maxPredictionLength, 1);
    });
    it('shortens returned values', () => {
      const net = new RNN({ maxPredictionLength: 3 });
      net.train([{ input: '123', output: '456' }], { errorThresh: 0.011 });
      const output1 = net.run('123');
      assert.equal(output1.length, 3);
      net.maxPredictionLength = 1;
      const output2 = net.run('123');
      assert.equal(output2.length, 1);
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
      net.initialize();

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
