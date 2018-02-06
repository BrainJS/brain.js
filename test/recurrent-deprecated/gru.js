import assert from 'assert';
import GRU from '../../src/recurrent/gru';
import DataFormatter from '../../src/utilities/data-formatter';

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
      const dataFormatter = new DataFormatter(['b', 'o']);
      const net = new GRU({
        inputSize: 3,
        inputRange: dataFormatter.characters.length,
        outputSize: 3
      });

      for (var i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes(phrase));
        if (i % 10 === 0) {
          console.log(dataFormatter.toCharacters(net.run()).join(''));
        }
      }
      assert.equal(dataFormatter.toCharacters(net.run(dataFormatter.toIndexes('b'))).join(''), 'ob');
      done();
    });

    it('can learn a phrase, export it to a function, and it still runs', (done) => {
      const phrase = 'hello world;|something I comment about';
      const dataFormatter = DataFormatter.fromString(phrase);
      const phraseAsIndices = dataFormatter.toIndexes(phrase);
      var net = new GRU({
        inputSize: 40,
        inputRange: dataFormatter.characters.length,
        outputSize: 40
      });
      for (var i = 0; i < 200; i++) {
        net.trainPattern(phraseAsIndices);
        if (i % 10 === 0) {
          console.log(dataFormatter.toCharacters(net.run()).join(''));
        }
      }
      assert.equal(dataFormatter.toCharacters(net.run()).join(''), phrase);
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
        var dataFormatter = new DataFormatter('abcdef'.split(''));
        var jsonString = JSON.stringify(new GRU({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        var clone = new GRU({ json: JSON.parse(jsonString) });

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        var dataFormatter = new DataFormatter('abcdef'.split(''));
        var jsonString = JSON.stringify(new GRU({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        var clone = new GRU({ json: JSON.parse(jsonString) });
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        assert.notEqual(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      var net = new GRU({
        inputSize: 6,
        inputRange: dataFormatter.characters.length,
        outputSize: 6
      });

      for (var i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(dataFormatter.toCharacters(net.run()).join(''));
        }
      }

      var lastOutput = dataFormatter.toCharacters(net.run()).join('');
      assert.equal(dataFormatter.toCharacters(net.toFunction()()).join(''), lastOutput);
    });

    it('can include the DataFormatter', () => {
      const net = new GRU();
      net.train(['hi mom!'], { iterations: 1 });
      const newNet = net.toFunction();
      newNet('hi mom!');
    });
  });
});
