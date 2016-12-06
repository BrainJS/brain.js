import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import Vocab from '../../src/utilities/vocab';
import rnnCheck from '../utilities/rnn-check';

function notZero(v) {
  return v !== 0;
}

function isZero(v) {
  return v === 0;
}

describe('rnn', () => {
  describe('basic operations', () => {
    it('starts with zeros in input.recurrence', () => {
      (new RNN()).model.input.recurrence.forEach((v) => {
        assert(v === 0);
      });
    });
    it('after initial run, does not have zeros in recurrence', () => {
      var net = new RNN({
        hiddenSizes: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2
      });
      net.runInput([1, 1, 0]);
      net.model.input.recurrence.forEach((v) => {
        assert.equal(v, 0);
      });
      net.runBackpropagate([1, 1, 0]);
      net.runBackpropagate([0, 1, 1]);
      net.runBackpropagate([1, 0, 1]);
      net.runBackpropagate([1, 1, 0]);
      assert(net.model.input.recurrence.some(notZero));
    });
  });
  describe('xor', () => {
    function xorNet() {
      return new RNN({
        hiddenSizes: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 3
      });
    }

    var xorNetValues = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0]
    ];

    it('properly provides values to equations[].run', () => {
      var net = xorNet();
      var called = [];
      net.model.equations[0] = { run: (v) => {
        called[0] = v;
        return {rows: 1, columns: 0, weights: [], recurrence: []}; }
      };
      net.model.equations[1] = { run: (v) => {
        called[1] = v;
        return {rows: 0, columns: 0, weights: [], recurrence: []}; }
      };
      net.model.equations[2] = { run: (v) => {
        called[2] = v;
        return {rows: 0, columns: 0, weights: [], recurrence: []}; }
      };
      net.model.equations[3] = { run: (v) => {
        called[3] = v;
        return {rows: 0, columns: 0, weights: [], recurrence: []}; }
      };
      net.model.equations[4] = { run: (v) => {
        called[4] = v;
        return {rows: 0, columns: 0, weights: [], recurrence: []}; }
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
      var net = xorNet();
      var backPropagateCalled = [];
      net.model.equations[0] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
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
      var net = xorNet();
      var backPropagateCalled = [];
      net.model.equations[0] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[0] = v;
        }
      };
      net.model.equations[1] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[1] = v;
        }
      };
      net.model.equations[2] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
        },
        runBackpropagate: (v) => {
          backPropagateCalled[2] = v;
        }
      };
      net.model.equations[3] = {
        run: () => {
          return {rows: 0, columns: 0, weights: [], recurrence: []};
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

    it('is fully connected and gives values in recurrence', () => {
      var net = xorNet();
      var input = xorNetValues[2];
      net.model.allMatrices.forEach((m) => {
        m.recurrence.forEach((value) => {
          assert.equal(value, 0);
        });
      });
      net.runInput(input);

      net.model.input.recurrence.forEach((v) => {
        assert.equal(v, 0);
      });
      net.model.hiddenLayers.forEach((layer) => {
        for (var p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          layer[p].recurrence.forEach((v) => {
            assert.equal(v, 0);
          });
        }
      });
      net.model.output.recurrence.forEach((v) => {
        assert.equal(v, 0);
      });

      net.runBackpropagate(input);

      assert(net.model.input.recurrence.some(notZero));
      net.model.hiddenLayers.forEach((layer) => {
        for (var p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          assert(layer[p].recurrence.some(notZero));
        }
      });
      assert(net.model.output.recurrence.some(notZero));

      net.model.equations.forEach((equation) => {
        equation.states.forEach((state) => {
          if (state.left && state.left.recurrence) state.left.recurrence.some(notZero);
          if (state.right && state.right.recurrence) state.right.recurrence.some(notZero);
          if (state.product && state.product.recurrence) state.product.recurrence.some(notZero);
        });
      });
    });

    it('recurrence is reset to zero after .step() is called', () => {
      var net = xorNet();
      var input = xorNetValues[2];
      net.runInput(input);
      net.runBackpropagate(input);
      net.step();

      assert(net.model.input.recurrence.every(isZero));
      net.model.hiddenLayers.forEach((layer) => {
        for (var p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          assert(layer[p].recurrence.every(isZero));
        }
      });
      assert(net.model.output.recurrence.every(isZero));

      net.model.equations.forEach((equation) => {
        equation.states.forEach((state) => {
          if (state.left && state.left.recurrence) state.left.recurrence.every(isZero);
          if (state.right && state.right.recurrence) state.right.recurrence.every(isZero);
          if (state.product && state.product.recurrence) state.product.recurrence.every(isZero);
        });
      });
    });

    it('recurrence and weights do not explode', () => {
      var net = xorNet();
      var input = xorNetValues[2];
      for (var i = 0; i < 100; i++)
      {
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(value < 50 && value > -50);
          });
        });
        net.runInput(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(value < 50 && value > -50);
          });
        });
        net.runBackpropagate(input);
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(value < 50 && value > -50);
          });
        });
        net.step();
        rnnCheck.allMatrices(net.model, (values) => {
          values.forEach((value, i) => {
            assert(value < 50 && value > -50);
          });
        });
      }
    });

    it('can learn xor (perplexity goes down)', () => {
      var net = xorNet();
      var initialPerplexity;
      var perplexity;

      for (var i = 0; i < 10; i++) {
        var input = xorNetValues[Math.floor((xorNetValues.length - 1) * Math.random())];
        perplexity = net.trainPattern(input);
        if (i === 0) {
          initialPerplexity = perplexity;
        }
        console.log(perplexity);
      }
      assert(initialPerplexity > perplexity);
    });

    it('can predict xor', () => {
      var net = xorNet();
      for (var i = 0; i < 200; i++) {
        var input = xorNetValues[Math.floor((xorNetValues.length - 1) * Math.random())];
        net.trainPattern(input);
      }

      assert.equal(net.run().length, 3);
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        var net = new RNN({
          inputSize: 6,
          inputRange: 12,
          outputSize: 6
        });
        var json = net.toJSON();

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
        var vocab = new Vocab('abcdef'.split(''));
        var jsonString = JSON.stringify(new RNN({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        }).toJSON());

        var clone = new RNN({ json: JSON.parse(jsonString) });

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, vocab.characters.length);
        assert.equal(clone.outputSize, vocab.characters.length);
      });

      it('can import model from json and train again', () => {
        var vocab = new Vocab('abcdef'.split(''));
        var jsonString = JSON.stringify(new RNN({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        }).toJSON());

        var clone = new RNN({ json: JSON.parse(jsonString) });
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        assert.notEqual(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, vocab.characters.length);
        assert.equal(clone.outputSize, vocab.characters.length);
      });
    });
  });

  describe('rnn.toFunction', () => {
    it('can output same as run method', () => {
      const vocab = new Vocab(['h', 'i', ' ', 'm', 'o', '!']);
      var net = new RNN({
        inputSize: 7,
        inputRange: vocab.characters.length,
        outputSize: 7
      });

      for (var i = 0; i < 100; i++) {
        net.trainPattern(vocab.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }

      var lastOutput = vocab.toCharacters(net.run()).join('');
      assert.equal(vocab.toCharacters(net.toFunction()()).join(''), lastOutput);
    });
  });
});