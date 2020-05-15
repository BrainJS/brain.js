const GRU = require('../../src/recurrent/gru');
const RNN = require('../../src/recurrent/rnn');
const DataFormatter = require('../../src/utilities/data-formatter');
const istanbulLinkerUtil = require('../istanbul-linker-util');

describe('GRU', () => {
  describe('getModel', () => {
    test('overrides RNN', () => {
      expect(typeof GRU.getModel).toEqual('function');
      expect(GRU.getModel).not.toEqual(RNN.getModel);
    });
  });
  describe('getEquation', () => {
    test('overrides RNN', () => {
      expect(typeof GRU.getEquation).toEqual('function');
      expect(GRU.getEquation).not.toEqual(RNN.getEquation);
    });
  });
  describe('math', () => {
    it('can predict math', () => {
      const net = new GRU();
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

  describe('printable characters', () => {
    it('can learn a phrase', (done) => {
      const net = new GRU();
      net.train(
        [
          {
            input: 'hello world',
            output: 'comment',
          },
        ],
        { iterations: 100 }
      );
      expect(net.run('hello world')).toBe('comment');
      done();
    });

    it('can predict a phrase when given the first letter', (done) => {
      const phrase = 'bob';
      const dataFormatter = new DataFormatter(['b', 'o']);
      const net = new GRU({
        inputSize: 3,
        inputRange: dataFormatter.characters.length,
        outputSize: 3,
      });
      net.initialize();
      for (let i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes(phrase));
        // if (i % 10 === 0) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }
      expect(
        dataFormatter
          .toCharacters(net.run(dataFormatter.toIndexes('b')))
          .join('')
      ).toBe('ob');
      done();
    });

    it('can learn a phrase, export it to a function, and it still runs', (done) => {
      const phrase = 'hello world;|something I comment about';
      const dataFormatter = DataFormatter.fromString(phrase);
      const phraseAsIndices = dataFormatter.toIndexes(phrase);
      const net = new GRU({
        inputSize: 40,
        inputRange: dataFormatter.characters.length,
        outputSize: 40,
      });
      net.initialize();
      for (let i = 0; i < 200; i++) {
        net.trainPattern(phraseAsIndices);
        // if (i % 10 === 0) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }
      expect(dataFormatter.toCharacters(net.run()).join('')).toBe(phrase);
      done();
    });
  });

  describe('json', () => {
    describe('.toJSON', () => {
      it('can export model as json', () => {
        const net = new GRU({
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
          new GRU({
            inputSize: 6, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new GRU();
        clone.fromJSON(JSON.parse(jsonString));
        expect(jsonString).toEqual(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toEqual(6);
        expect(clone.inputRange).toEqual(dataFormatter.characters.length);
        expect(clone.outputSize).toEqual(dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new GRU({
            inputSize: 6, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new GRU();
        clone.fromJSON(JSON.parse(jsonString));
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        expect(jsonString).not.toEqual(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toEqual(6);
        expect(clone.inputRange).toEqual(dataFormatter.characters.length);
        expect(clone.outputSize).toEqual(dataFormatter.characters.length);
      });
    });
  });

  describe('.toFunction', () => {
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      const net = new GRU({
        inputSize: 6,
        inputRange: dataFormatter.characters.length,
        outputSize: 6,
      });
      net.initialize();
      for (let i = 0; i < 100; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        // if (i % 10) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }

      const lastOutput = dataFormatter.toCharacters(net.run()).join('');
      expect(
        dataFormatter
          .toCharacters(net.toFunction(istanbulLinkerUtil)())
          .join('')
      ).toBe(lastOutput);
    });

    it('can include the DataFormatter', () => {
      const net = new GRU();
      net.train(['hi mom!'], { iterations: 100, log: true });
      const expected = net.run('hi ');
      const newNet = net.toFunction(istanbulLinkerUtil);
      const output = newNet('hi ');
      expect(output).toBe(expected);
    });
  });
});
