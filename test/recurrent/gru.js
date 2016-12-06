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
    it('can predict what a math problem is after being fed 1000 random math problems', (done) => {
      const vocab = new Vocab(['0','1','2','3','4','5','6','7','8','9','+','=', '-', '/', '*']);
      console.time('math gru');
      var net = new GRU({
        inputSize: vocab.characters.length,
        inputRange: vocab.characters.length,
        outputSize: vocab.characters.length
      });

      for (var i = 0; i < 1000; i++) {
        net.trainPattern(vocab.toIndexes(randomMath()));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }

      var prediction = vocab.toCharacters(net.run()).join('');
      assert(/[+]/.test(prediction));
      assert(/[=]/.test(prediction));
      console.timeEnd('math gru');
      console.log(prediction);
      done();
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

      for (var i = 0; i < 500; i++) {
        net.trainPattern(vocab.toIndexes(phrase));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }
      assert.equal(vocab.toCharacters(net.run()).join(''), phrase);
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

      for (var i = 0; i < 100; i++) {
        net.trainPattern(vocab.toIndexes(phrase));
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }
      assert.equal(vocab.toCharacters(net.run(vocab.toIndexes('b'))).join(''), phrase);
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
      for (var i = 0; i < 200; i++) {
        net.trainPattern(phraseAsIndices);
        if (i % 10 === 0) {
          console.log(vocab.toCharacters(net.run()).join(''));
        }
      }
      assert.equal(vocab.toCharacters(net.run()).join(''), phrase);
      done();
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        var net = new GRU({
          inputSize: 6,
          inputRange: 12,
          outputSize: 6
        });
        var json = net.toJSON();

        compare(json.input, net.model.input);
        net.model.hiddenLayers.forEach((layer, i) => {
          for (var p in layer) {
            compare(json.hiddenLayers[i][p], layer[p])
          }
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
        var jsonString = JSON.stringify(new GRU({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        }).toJSON());

        var clone = new GRU({ json: JSON.parse(jsonString) });

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, vocab.characters.length);
        assert.equal(clone.outputSize, vocab.characters.length);
      });

      it('can import model from json and train again', () => {
        var vocab = new Vocab('abcdef'.split(''));
        var jsonString = JSON.stringify(new GRU({
          inputSize: 6, //<- length
          inputRange: vocab.characters.length,
          outputSize: vocab.characters.length //<- length
        }).toJSON());

        var clone = new GRU({ json: JSON.parse(jsonString) });
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        assert.notEqual(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, vocab.characters.length);
        assert.equal(clone.outputSize, vocab.characters.length);
      });
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const vocab = new Vocab(['h', 'i', ' ', 'm', 'o', '!']);
      var net = new GRU({
        inputSize: 6,
        inputRange: vocab.characters.length,
        outputSize: 6
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
