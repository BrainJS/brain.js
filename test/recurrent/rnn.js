import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import { vocab, build, train } from '../utilities/math-addition-vocab';

function equationStub(rnn, index) {
  return {
    run: function(v) {
      called[0] = v;
      return {
        rows: 0,
        columns: 0,
        weights: [],
        recurrence: []
      };
    }
  };
}

function notZero(v) {
  return v !== 0;
}

function isZero(v) {
  return v === 0;
}

describe('rnn', () => {
  describe('basic operations', function() {
    it('starts with zeros in input.recurrence', function() {
      (new RNN()).model.input.recurrence.forEach(function(v) {
        assert(v === 0);
      });
    });
    it('after initial run, does not have zeros in recurrence', function() {
      var net = new RNN({
        hiddenSizes: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2
      });
      net.train([1, 1, 0]);
      net.model.input.recurrence.forEach(function(v) {
        assert.equal(v, 0);
      });
      net.runBackpropagate([1, 1, 0]);
      net.runBackpropagate([0, 1, 1]);
      net.runBackpropagate([1, 0, 1]);
      net.runBackpropagate([1, 1, 0]);
      assert(net.model.input.recurrence.some(notZero));
    });

    describe('xor', function() {
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

      it('properly provides values to equations[].run', function() {
        var net = xorNet();
        var called = [];
        net.model.equations[0] = { run: function(v) {
          called[0] = v;
          return {rows: 0, columns: 0, weights: [], recurrence: []}; }
        };
        net.model.equations[1] = { run: function(v) {
          called[1] = v;
          return {rows: 0, columns: 0, weights: [], recurrence: []}; }
        };
        net.model.equations[2] = { run: function(v) {
          called[2] = v;
          return {rows: 0, columns: 0, weights: [], recurrence: []}; }
        };
        net.model.equations[3] = { run: function(v) {
          called[3] = v;
          return {rows: 0, columns: 0, weights: [], recurrence: []}; }
        };
        net.model.equations[4] = { run: function(v) {
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

      it('properly provides values to equations[].runBackpropagate', function() {
        var net = xorNet();
        var backPropagateCalled = [];
        net.model.equations[0] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[0] = v;
          }
        };
        net.model.equations[1] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[1] = v;
          }
        };
        net.model.equations[2] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[2] = v;
          }
        };
        net.model.equations[3] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
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

      it('properly provides values to equations[].runBackpropagate', function() {
        var net = xorNet();
        var backPropagateCalled = [];
        net.model.equations[0] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[0] = v;
          }
        };
        net.model.equations[1] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[1] = v;
          }
        };
        net.model.equations[2] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
            backPropagateCalled[2] = v;
          }
        };
        net.model.equations[3] = {
          run: function() {
            return {rows: 0, columns: 0, weights: [], recurrence: []};
          },
          runBackpropagate: function(v) {
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

      it('is fully connected and gives values in recurrence', function() {
        var net = xorNet();
        var input = xorNetValues[2];
        var initialWeights = [];
        net.model.allMatrices.forEach(function(m) {
          initialWeights.push(JSON.stringify(m.weights));
          m.recurrence.forEach(function(value) {
            assert.equal(value, 0);
          });
        });
        net.train(input);

        net.model.input.recurrence.forEach(function(v) {
          assert.equal(v, 0);
        });
        net.model.hiddenLayers.forEach(function(layer) {
          for (var p in layer) {
            if (!layer.hasOwnProperty(p)) continue;
            layer[p].recurrence.forEach(function(v) {
              assert.equal(v, 0);
            });
          }
        });
        net.model.output.recurrence.forEach(function(v) {
          assert.equal(v, 0);
        });

        net.runBackpropagate(input);

        assert(net.model.input.recurrence.some(notZero));
        net.model.hiddenLayers.forEach(function(layer) {
          for (var p in layer) {
            if (!layer.hasOwnProperty(p)) continue;
            assert(layer[p].recurrence.some(notZero));
          }
        });
        assert(net.model.output.recurrence.some(notZero));

        net.model.equations.forEach(function(equation) {
          equation.states.forEach(function(state) {
            if (state.left && state.left.recurrence) state.left.recurrence.some(notZero);
            if (state.right && state.right.recurrence) state.right.recurrence.some(notZero);
            if (state.product && state.product.recurrence) state.product.recurrence.some(notZero);
          });
        });
      });

      it('recurrence is reset to zero after .step() is called', function() {
        var net = xorNet();
        var input = xorNetValues[2];
        net.train(input);
        net.runBackpropagate(input);
        net.step();

        assert(net.model.input.recurrence.every(isZero));
        net.model.hiddenLayers.forEach(function(layer) {
          for (var p in layer) {
            if (!layer.hasOwnProperty(p)) continue;
            assert(layer[p].recurrence.every(isZero));
          }
        });
        assert(net.model.output.recurrence.every(isZero));

        net.model.equations.forEach(function(equation) {
          equation.states.forEach(function(state) {
            if (state.left && state.left.recurrence) state.left.recurrence.every(isZero);
            if (state.right && state.right.recurrence) state.right.recurrence.every(isZero);
            if (state.product && state.product.recurrence) state.product.recurrence.every(isZero);
          });
        });
      });

      it('can learn xor', function() {
        var net = xorNet();
        for (let i = 0, max = 1000; i < max; i++) {
          var input = xorNetValues[Math.floor((xorNetValues.length - 1) * Math.random())];
          net.run(input);
          if (i % 10 === 0) {
            console.log(JSON.stringify(net.predict()));
          }
        }
      });
    });

    return;
    describe('math', () => {
      let mathProblems = build();
      function runAgainstMath(rnn) {
        train(rnn);

        var prediction = vocab.toCharacters(rnn.predict()).join('');
        //console.log(prediction);
        assert(/^[0-9]+[+][0-9]+[=][0-9]+$/.test(prediction));
      }

      describe('#predict', () => {
        context('after being fed 1000 random addition problems', () => {
          it('can predict what a math addition problem is and create one', () => {
            console.time('math rnn');
            var rnn = new RNN({
              inputSize: 6, //<- length
              inputRange: vocab.characters.length,
              outputSize: vocab.characters.length //<- length
            });

            runAgainstMath(rnn);
            console.timeEnd('math rnn');
            console.log('');
          });
        });
      });
      /*describe('#toFunction', () => {
        var rnn = new RNN({
          inputSize: 6, //<- length
          inputRange: mathVocab.characters.length,
          outputSize: mathVocab.characters.length //<- length
        });

        runAgainstMath(rnn);
        require('fs').writeFileSync('raw-rnn.js', rnn.toFunction().toString());
      });*/
    });

    /*describe('#train', function() {
      it('can train', function() {
        var rnn = new RNN({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        });

        runAgainstMath(rnn, true);

        rnn.train([{input: [0, 0], output: [0]},
          {input: [0, 1], output: [1]},
          {input: [1, 0], output: [1]},
          {input: [1, 1], output: [0]}]);
      });
    });*/
  });
});