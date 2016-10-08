import assert from 'assert';
import RNN from '../../src/recurrent/rnn';
import { vocab, build, train } from '../utilities/math-addition-vocab';

describe('rnn', () => {
  describe('basic operations', function() {
    it('starts with zeros in input.recurrence', function() {
      (new RNN()).model.input.recurrence.forEach(function(v) {
        assert(v === 0);
      });
    });
    it('after initial run, does not have zeros in recurrnce', function() {
      var net = new RNN();
      net.train([1, 1, 0]);
      net.runBackpropagate([1, 1, 0]);
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

      it('is fully connected and gives values in recurrence', function() {
        var net = xorNet();
        var notZero = false;

        net.train([0, 0, 0]);
        net.runBackpropagate([0, 0, 0]);
        net.model.input.recurrence.forEach(function(v) {
          if (v !== 0) {
            notZero = true;
          }
        });
        assert(notZero);
        notZero = false;

        net.train([0, 1, 1]);
        net.runBackpropagate([0, 1, 1]);
        net.model.input.recurrence.forEach(function(v) {
          if (v !== 0) {
            notZero = true;
          }
        });
        assert(notZero);
        notZero = false;

        net.train([1, 0, 1]);
        net.runBackpropagate([1, 0, 1]);
        net.model.input.recurrence.forEach(function(v) {
          if (v !== 0) {
            notZero = true;
          }
        });
        assert(notZero);
        notZero = false;

        net.train([1, 1, 0]);
        net.runBackpropagate([1, 1, 0]);
        net.model.input.recurrence.forEach(function(v) {
          if (v !== 0) {
            notZero = true;
          }
        });
        assert(notZero);
      });
    });
  });
  return;
  describe('math', () => {
    let mathProblems = build();
    function runAgainstMath(rnn) {
      train(rnn);
      var prediction = vocab.toCharacters(rnn.predict()).join('');
      console.log(prediction);
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