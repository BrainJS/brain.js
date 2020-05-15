const LSTM = require('../../src/recurrent/lstm');
const RNN = require('../../src/recurrent/rnn');
const DataFormatter = require('../../src/utilities/data-formatter');
const istanbulLinkerUtil = require('../istanbul-linker-util');

describe('lstm', () => {
  describe('getModel', () => {
    test('overrides RNN', () => {
      expect(typeof LSTM.getModel).toEqual('function');
      expect(LSTM.getModel).not.toEqual(RNN.getModel);
    });
  });
  describe('getEquation', () => {
    test('overrides RNN', () => {
      expect(typeof LSTM.getEquation).toEqual('function');
      expect(LSTM.getEquation).not.toEqual(RNN.getEquation);
    });
  });

  describe('math', () => {
    it('can predict math', () => {
      const net = new LSTM();
      const items = new Set([]);
      for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
          items.add(`${i}+${j}=${i + j}`);
          items.add(`${j}+${i}=${i + j}`);
        }
      }
      net.train(Array.from(items), { iterations: 60, errorThresh: 0.03 });
      for (let i = 0; i < 10; i++) {
        const output = net.run(`${i}+`);
        expect(/^[0-9]+[=][0-9]+$/.test(output)).toBe(true);
      }
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        const net = new LSTM({
          inputSize: 6,
          inputRange: 12,
          outputSize: 6,
        });
        const json = net.toJSON();

        function compare(left, right) {
          left.weights.forEach((value, i) => {
            expect(value).toBe(right.weights[i]);
          });
          expect(left.rows).toBe(right.rows);
          expect(left.columns).toBe(right.columns);
        }

        compare(json.input, net.model.input);
        net.model.hiddenLayers.forEach((layer, i) => {
          for (const p in layer) {
            compare(json.hiddenLayers[i][p], layer[p]);
          }
        });
        compare(json.output, net.model.output);
        compare(json.outputConnector, net.model.outputConnector);
      });
    });

    describe('.fromJSON', () => {
      it('can import model from json', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new LSTM({
            inputSize: 6, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new LSTM();
        clone.fromJSON(JSON.parse(jsonString));

        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new LSTM({
            inputSize: 6, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new LSTM();
        clone.fromJSON(JSON.parse(jsonString));
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        expect(jsonString).not.toEqual(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);
      });
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      const net = new LSTM({
        inputSize: 7,
        inputRange: dataFormatter.characters.length,
        outputSize: 7,
      });
      net.initialize();
      for (let i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        // if (i % 10) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }

      const lastOutput = dataFormatter.toCharacters(net.run()).join('');
      expect(lastOutput).toBe('hi mom!');
      expect(
        dataFormatter
          .toCharacters(net.toFunction(istanbulLinkerUtil)())
          .join('')
      ).toBe(lastOutput);
    });
    it('can include the DataFormatter', () => {
      const net = new LSTM();
      net.train(['hi mom!'], { iterations: 100, log: true });
      const expected = net.run('hi ');
      const newNet = net.toFunction(istanbulLinkerUtil);
      const output = newNet('hi ');
      expect(output).toBe(expected);
    });
  });

  describe('.run', () => {
    it('can predict greetings in 100 trainings', () => {
      const net = new LSTM();
      const trainingData = [
        {
          input: 'hi',
          output: 'mom',
        },
        {
          input: 'howdy',
          output: 'dad',
        },
        {
          input: 'hello',
          output: 'sis',
        },
        {
          input: 'yo',
          output: 'bro',
        },
      ];
      net.train(trainingData, { iterations: 100, log: true });
      expect(net.run('hi')).toBe('mom');
      expect(net.run('howdy')).toBe('dad');
      expect(net.run('hello')).toBe('sis');
      expect(net.run('yo')).toBe('bro');
    });
    it('can predict a string from index in 100 trainings', () => {
      const net = new LSTM();
      const transactionTypes = {
        credit: 0,
        debit: 1,
        personalCard: 2,
        other: 3,
      };
      const trainingData = [
        {
          input: [transactionTypes.credit],
          output: 'credit',
        },
        {
          input: [transactionTypes.debit],
          output: 'debit',
        },
        {
          input: [transactionTypes.personalCard],
          output: 'personal card',
        },
        {
          input: [transactionTypes.other],
          output: 'other',
        },
      ];
      net.train(trainingData, { iterations: 200, log: true });
      expect(net.run([transactionTypes.credit])).toBe('credit');
      expect(net.run([transactionTypes.debit])).toBe('debit');
      expect(net.run([transactionTypes.personalCard])).toBe('personal card');
      expect(net.run([transactionTypes.other])).toBe('other');
    });
  });
});
