import assert from 'assert';
import LSTM from '../../src/recurrent/lstm';
import DataFormatter from '../../src/utilities/data-formatter';

describe('lstm', () => {
  describe('math', () => {
    it('can predict math', function(done) {
      this.timeout(15000);
      const net = new LSTM();
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
        console.log(output);
        assert(/^[0-9]+[+][0-9]+[=][0-9]+$/.test(output));
      }
      done();
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        var net = new LSTM({
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
        var jsonString = JSON.stringify(new LSTM({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        var clone = new LSTM({ json: JSON.parse(jsonString) });

        assert.equal(jsonString, JSON.stringify(clone.toJSON()));
        assert.equal(clone.inputSize, 6);
        assert.equal(clone.inputRange, dataFormatter.characters.length);
        assert.equal(clone.outputSize, dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        var dataFormatter = new DataFormatter('abcdef'.split(''));
        var jsonString = JSON.stringify(new LSTM({
          inputSize: 6, //<- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length //<- length
        }).toJSON());

        var clone = new LSTM({ json: JSON.parse(jsonString) });
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
      var net = new LSTM({
        inputSize: 7,
        inputRange: dataFormatter.characters.length,
        outputSize: 7
      });

      for (var i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        if (i % 10) {
          console.log(dataFormatter.toCharacters(net.run()).join(''));
        }
      }

      var lastOutput = dataFormatter.toCharacters(net.run()).join('');
      assert(lastOutput.length > 0);
      assert.equal(dataFormatter.toCharacters(net.toFunction()()).join(''), lastOutput);
    });
    it('can include the DataFormatter', () => {
      const net = new LSTM();
      net.train(['hi mom!'], { iterations: 1 });
      const newNet = net.toFunction();
      const output = newNet('hi mom!');
      assert(output.length > 0);
    });
  });

  describe('.run', () => {
    it('can predict greetings in 100 trainings', () => {
      const net = new LSTM({
        //json: json
      });
      const trainingData = [{
        input: 'hi',
        output: 'mom'
      }, {
        input: 'howdy',
        output: 'dad'
      }, {
        input: 'hello',
        output: 'sis'
      }, {
        input: 'yo',
        output: 'bro'
      }];
      net.train(trainingData, { iterations: 100, log: true });
      assert.equal(net.run('hi'), 'mom');
      assert.equal(net.run('howdy'), 'dad');
      assert.equal(net.run('hello'), 'sis');
      assert.equal(net.run('yo'), 'bro');
    });
    it('can predict a string from index in 100 trainings', () => {
      const net = new LSTM();
      const transationTypes = {
        credit: 0,
        debit: 1,
        personalCard: 2,
        other: 3
      };
      const trainingData = [{
        input: [transationTypes.credit],
        output: 'credit'
      }, {
        input: [transationTypes.debit],
        output: 'debit'
      }, {
        input: [transationTypes.personalCard],
        output: 'personal card'
      }, {
        input: [transationTypes.other],
        output: 'other'
      }];
      net.train(trainingData, { iterations: 200, log: true });
      assert.equal(net.run([transationTypes.credit]), 'credit');
      assert.equal(net.run([transationTypes.debit]), 'debit');
      assert.equal(net.run([transationTypes.personalCard]), 'personal card');
      assert.equal(net.run([transationTypes.other]), 'other');
    });
  });
});
