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
      /*net.runBackpropagate([0, 1, 1]);
      net.runBackpropagate([1, 0, 1]);
      net.runBackpropagate([1, 1, 0]);*/
      var notZero = false;
      net.model.input.recurrence.forEach(function(v) {
        if (v !== 0) {
          notZero = true;
        }
      });
      assert(notZero)
    });

    describe('xor', function() {
      function xorNet() {
        return new RNN({
          hiddenSizes: [3],
          inputSize: 3,
          inputRange: 2,
          outputSize: 1
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
        for (var i = 0; i < 1000; i++) {
          var input = xorNetValues[Math.floor(Math.random() * xorNetValues.length)];
          net.train(input);
          net.runBackpropagate(input);
          net.step();
          if (i % 10) {
            console.log(net.predict(3));
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