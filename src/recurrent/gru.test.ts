import { GRU } from './gru';
import { IMatrixJSON } from './matrix';
import { RNN } from './rnn';
import { DataFormatter } from '../utilities/data-formatter';

describe('GRU', () => {
  describe('.getHiddenLayer()', () => {
    test('overrides RNN', () => {
      expect(typeof GRU.prototype.getHiddenLayer).toEqual('function');
      expect(GRU.prototype.getHiddenLayer).not.toEqual(
        RNN.prototype.getHiddenLayer
      );
    });
  });
  describe('.getEquation()', () => {
    test('overrides RNN', () => {
      expect(typeof GRU.prototype.getEquation).toEqual('function');
      expect(GRU.prototype.getEquation).not.toEqual(RNN.prototype.getEquation);
    });
  });
  describe('math', () => {
    it('can predict math', () => {
      const net = new GRU();
      const items = new Set<string>([]);
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
    jest.retryTimes(3);
    it('can learn a phrase', (done) => {
      const net = new GRU();
      net.train(
        [
          {
            input: 'hello world',
            output: 'comment',
          },
        ],
        { iterations: 200 }
      );
      const result = net.run('hello world');
      expect(result).toBe('comment');
      done();
    });

    it('can predict a phrase when given the first letter', (done) => {
      const phrase = 'bob';
      const dataFormatter = new DataFormatter(['b', 'o']);
      const net = new GRU({
        inputSize: 3,
        inputRange: dataFormatter.characters.length,
        outputSize: 3,
        dataFormatter,
      });
      net.initialize();
      for (let i = 0; i < 200; i++) {
        net.trainPattern(dataFormatter.toIndexes(phrase));
        // if (i % 10 === 0) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }
      const result = net.run(dataFormatter.toIndexes('b'));
      expect(result).toBe('ob');
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
        dataFormatter,
      });
      net.initialize();
      for (let i = 0; i < 200; i++) {
        net.trainPattern(phraseAsIndices);
        // if (i % 10 === 0) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }
      expect(net.run()).toBe(phrase);
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

        function compare(left: IMatrixJSON, right: IMatrixJSON) {
          left.weights.forEach((value, i) => {
            expect(value).toBe(right.weights[i]);
          });
          expect(left.rows).toBe(right.rows);
          expect(left.columns).toBe(right.columns);
        }

        compare(json.input, net.model.input.toJSON());
        net.model.hiddenLayers.forEach((layer, i) => {
          for (const p in layer) {
            if (!layer.hasOwnProperty(p)) continue;
            compare(json.hiddenLayers[i][p], layer[p].toJSON());
          }
        });
        compare(json.output, net.model.output.toJSON());
        compare(json.outputConnector, net.model.outputConnector.toJSON());
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
        expect(clone.options.inputSize).toEqual(6);
        expect(clone.options.inputRange).toEqual(
          dataFormatter.characters.length
        );
        expect(clone.options.outputSize).toEqual(
          dataFormatter.characters.length
        );
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new GRU({
            inputSize: dataFormatter.characters.length, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
            dataFormatter,
          }).toJSON()
        );

        const clone = new GRU();
        clone.fromJSON(JSON.parse(jsonString));
        clone.trainPattern([0, 1, 2, 3, 4, 5]);

        expect(jsonString).not.toEqual(JSON.stringify(clone.toJSON()));
        expect(clone.options.inputSize).toEqual(7); // 6 + also unrecognized
        expect(clone.options.inputRange).toEqual(
          dataFormatter.characters.length
        );
        expect(clone.options.outputSize).toEqual(
          dataFormatter.characters.length
        );
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
        dataFormatter,
      });
      net.initialize();
      for (let i = 0; i < 200; i++) {
        net.trainPattern(dataFormatter.toIndexes('hi mom!'));
        // if (i % 10) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }

      const lastOutput = net.run();
      const fn = net.toFunction();
      expect(fn()).toBe(lastOutput);
    });

    it('can include the DataFormatter', () => {
      const net = new GRU();
      net.train(['hi mom!'], { iterations: 200 });
      const expected = net.run('hi ');
      const newNet = net.toFunction();
      const output = newNet('hi ');
      expect(output).toBe(expected);
    });
  });
});
