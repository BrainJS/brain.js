import assert from 'assert';
import RNN from '../../../src/recurrent/rnn';
import rnnCheck from '../../utilities/rnn-check';

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
      net.train([1, 1, 0]);
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
  describe('toJSON method', () => {
    var net = new RNN();
    var json = net.toJSON();
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
      net.train([0, 0, 0]);
      assert.equal(called.length, 4);
      assert.equal(called[0], 0);
      assert.equal(called[1], 1);
      assert.equal(called[2], 1);
      assert.equal(called[3], 1);
      net.train([0, 1, 1]);
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
      net.train([0, 0, 0]);
      net.runBackpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.train([0, 1, 1]);
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
      net.train([0, 0, 0]);
      net.runBackpropagate([0, 0, 0]);
      assert.equal(backPropagateCalled.length, 4);
      assert.equal(backPropagateCalled[0], 0);
      assert.equal(backPropagateCalled[1], 1);
      assert.equal(backPropagateCalled[2], 1);
      assert.equal(backPropagateCalled[3], 1);
      net.train([0, 1, 1]);
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
      net.train(input);

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
      net.train(input);
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
        net.train(input);
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
        net.run(input);
        perplexity = net.totalPerplexity;
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
        net.run(input);
      }

      assert.equal(net.predict().length, 3);
    });
  });
});