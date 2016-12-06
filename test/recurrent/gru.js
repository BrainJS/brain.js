import assert from 'assert';
import GRU from '../../src/recurrent/gru';
import Vocab from '../../src/utilities/vocab';

function randomMath() {
  var left = Math.floor(Math.random() * 10);
  var right = Math.floor(Math.random() * 10);
  return left + '+' + right + '=' + (left + right);
}

describe('gru', () => {
  describe('math', () => {
    it('can predict what a math problem is after being fed 1000 random math problems', () => {
      const vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=', '-', '/', '*']);
      console.time('math gru');
      var net = new GRU({
        inputSize: vocab.characters.length,
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length
      });

      for (var i = 0; i < 1000; i++) {
        net.run(vocab.toIndexes(randomMath()));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.predict()).join(''));
        }
      }

      var prediction = vocab.toCharacters(net.predict()).join('');
      assert(/[+]/.test(prediction));
      assert(/[=]/.test(prediction));
      console.timeEnd('math gru');
      console.log(prediction);
    });
  });

  describe('printable characters', () => {
    it('can learn a phrase', (done) => {
      const phrase = 'hello world;|something I comment about';
      const vocab = Vocab.fromString(phrase);
      var net = new GRU({
        inputSize: 40,
        inputRange: vocab.characters.length,
        outputSize: 40
      });

      console.time('math lstm');
      for (var i = 0; i < 500; i++) {
        net.run(vocab.toIndexes(phrase));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.predict()).join(''));
        }
      }
      console.timeEnd('math lstm');
      console.log('');
      assert.equal(vocab.toCharacters(net.predict()).join(''), phrase);
      done();
    });

    it('can predict a phrase when given the first letter', (done) => {
      const phrase = 'bob';
      const vocab = new Vocab(['b', 'o']);
      var net = new GRU({
        inputSize: 3,
        inputRange: vocab.characters.length,
        outputSize: 3
      });

      console.time('math lstm');
      for (var i = 0; i < 100; i++) {
        net.run(vocab.toIndexes(phrase));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.predict()).join(''));
        }
      }
      console.timeEnd('math lstm');
      console.log('');
      assert.equal(vocab.toCharacters(net.predict(vocab.toIndexes('b'))).join(''), phrase);
      done();
    });

    it('can learn a phrase, export it to a function, and it still runs', (done) => {
      const phrase = 'hello world;|something I comment about';
      const vocab = Vocab.fromString(phrase);
      const phraseAsIndices = vocab.toIndexes(phrase);
      var net = new GRU({
        inputSize: 40,
        inputRange: vocab.characters.length,
        outputSize: 40
      });

      console.time('math lstm');
      for (var i = 0; i < 1000; i++) {
        net.run(phraseAsIndices);
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.predict()).join(''));
        }
      }
      console.timeEnd('math lstm');
      console.log('');
      assert.equal(vocab.toCharacters(net.predict()).join(''), phrase);
      done();
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const vocab = new Vocab(['h', 'i', ' ', 'm', 'o', '!']);
      var net = new GRU({
        inputSize: 7,
        inputRange: vocab.characters.length,
        outputSize: 7
      });

      for (var i = 0; i < 100; i++) {
        net.run(vocab.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(vocab.toCharacters(net.predict()).join(''));
        }
      }

      var lastOutput = vocab.toCharacters(net.predict()).join('');
      assert.equal(vocab.toCharacters(net.toFunction()()).join(''), lastOutput);
    });
  });
});
