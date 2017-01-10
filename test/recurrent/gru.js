import assert from 'assert';
import GRU from '../../src/recurrent/gru';
import Vocab from '../../src/utilities/vocab';

describe('gru', () => {
  describe('math', () => {
    it('can predict math', function(done) {
      this.timeout(15000);
      const net = new GRU();
      const items = [];
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          items.push(`${i}+${j}=${i + j}`);
          if (i === j) continue;
          items.push(`${j}+${i}=${i + j}`);
        }
      }
      net.train(items, { log: true, iterations: 100 });
      for (let i = 0; i < 10; i++) {
        const output = net.run();
        console.log(output, typeof output);
        assert(Boolean(/^[0-9]+[+][0-9]+[=][0-9]+$/.test(output)));
      }
      done();
    });
  });

  describe('printable characters', () => {
    it('can learn a phrase', (done) => {
      const net = new GRU();
      net.train([{
        input: 'hello world',
        output: 'comment'
      }], { iterations: 100 });
      assert.equal(net.run('hello world'), 'comment');
      done();
    });

    it('can predict a phrase when given the first letter', (done) => {
      const phrase = 'bob';
      const vocab = new Vocab(['b', 'o']);
      const net = new GRU({
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
      assert.equal(vocab.toCharacters(net.run(vocab.toIndexes('b'))).join(''), 'ob');
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
