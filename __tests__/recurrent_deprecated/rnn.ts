import {
  RNN,
  defaults,
  trainPattern,
  RNNFunction,
} from '../../src/recurrent/rnn';
import { DataFormatter } from '../../src/utilities/data-formatter';
import { allMatrices } from '../test-utils';
import { Equation } from '../../src/recurrent/matrix/equation';
import { IMatrixJSON } from '../../src/recurrent/matrix';

function notZero(v: number) {
  return v !== 0;
}

describe('RNN', () => {
  describe('.constructor()', () => {
    describe('when called without options.json', () => {
      it('does not initialize model', () => {
        const net = new RNN();
        expect(net.model.isInitialized).toBe(false);
      });
    });
    describe('when called with options.json', () => {
      const getJSON = () => {
        const net = new RNN({
          hiddenLayers: [3],
          inputSize: 3,
          inputRange: 2,
          outputSize: 2,
        });
        net.initialize();
        return net.toJSON();
      };
      let fromJSONMock: jest.SpyInstance;
      beforeEach(() => {
        fromJSONMock = jest.spyOn(RNN.prototype, 'fromJSON');
      });
      afterEach(() => {
        fromJSONMock.mockRestore();
      });
      it('calls this.fromJSON() with it', () => {
        const json = getJSON();
        const net = new RNN({ json });
        expect(fromJSONMock).toBeCalledWith(json);
      });
    });
  });
  describe('.initialize()', () => {
    describe('when creating hidden layers', () => {
      let createHiddenLayersMock: jest.SpyInstance;
      let getHiddenLayerMock: jest.SpyInstance;
      beforeEach(() => {
        createHiddenLayersMock = jest.spyOn(
          RNN.prototype,
          'createHiddenLayers'
        );
        getHiddenLayerMock = jest.spyOn(RNN.prototype, 'getHiddenLayer');
      });
      afterEach(() => {
        createHiddenLayersMock.mockRestore();
        getHiddenLayerMock.mockRestore();
      });
      it('calls createHiddenLayers', () => {
        const net = new RNN();
        net.initialize();
        expect(RNN.prototype.createHiddenLayers).toBeCalled();
      });
      it('calls static getHiddenLayer method', () => {
        const net = new RNN();
        net.initialize();
        expect(getHiddenLayerMock).toBeCalled();
      });
    });
    it('initializes model', () => {
      const net = new RNN();
      net.initialize();
      expect(net.model).not.toBe(null);
    });
    it('can setup different size hiddenLayers', () => {
      const inputSize = 2;
      const hiddenLayers = [5, 4, 3];
      const networkOptions = {
        learningRate: 0.001,
        decayRate: 0.75,
        inputSize: inputSize,
        hiddenLayers,
        outputSize: inputSize,
      };

      const net = new RNN(networkOptions);
      net.initialize();
      net.bindEquation();
      expect(net.model.hiddenLayers.length).toBe(3);
      expect(net.model.hiddenLayers[0].weight.columns).toBe(inputSize);
      expect(net.model.hiddenLayers[0].weight.rows).toBe(hiddenLayers[0]);
      expect(net.model.hiddenLayers[1].weight.columns).toBe(hiddenLayers[0]);
      expect(net.model.hiddenLayers[1].weight.rows).toBe(hiddenLayers[1]);
      expect(net.model.hiddenLayers[2].weight.columns).toBe(hiddenLayers[1]);
      expect(net.model.hiddenLayers[2].weight.rows).toBe(hiddenLayers[2]);
    });
  });
  describe('.createHiddenLayers()', () => {
    it('creates hidden layers in the expected size', () => {
      const net = new RNN({
        inputSize: 1,
        hiddenLayers: [15, 20],
        outputSize: 1,
      });
      const hiddenLayers = net.createHiddenLayers();
      expect(hiddenLayers.length).toEqual(2);
      expect(hiddenLayers[0].weight.rows).toEqual(15);
      expect(hiddenLayers[0].weight.columns).toEqual(1);
      expect(hiddenLayers[0].bias.rows).toEqual(15);
      expect(hiddenLayers[0].bias.columns).toEqual(1);
      expect(hiddenLayers[0].transition.rows).toEqual(15);
      expect(hiddenLayers[0].transition.columns).toEqual(15);
      expect(hiddenLayers[1].weight.rows).toEqual(20);
      expect(hiddenLayers[1].weight.columns).toEqual(15);
      expect(hiddenLayers[1].bias.rows).toEqual(20);
      expect(hiddenLayers[1].bias.columns).toEqual(1);
      expect(hiddenLayers[1].transition.rows).toEqual(20);
      expect(hiddenLayers[1].transition.columns).toEqual(20);
    });
  });
  describe('.createOutputMatrices()', () => {
    it('creates output layers in the expected size', () => {
      const net = new RNN({
        inputSize: 1,
        hiddenLayers: [22],
        outputSize: 1,
      });
      const { output, outputConnector } = net.createOutputMatrices();
      expect(outputConnector.rows).toBe(2);
      expect(outputConnector.columns).toBe(22);
      expect(output.rows).toBe(2);
      expect(output.columns).toBe(1);
    });
  });
  describe('basic operations', () => {
    it('starts with zeros in input.deltas', () => {
      const net = new RNN();
      net.initialize();
      net.model.input.deltas.forEach((v) => {
        expect(v === 0).toBeTruthy();
      });
    });
    it('after initial run, does not have zeros in weights and produces error', () => {
      const net = new RNN({
        hiddenLayers: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2,
      });
      net.initialize();
      const error = net.trainInput([1, 1, 0]);
      expect(net.model.input.weights.some(notZero)).toBeTruthy();
      expect(
        net.model.hiddenLayers[0].weight.weights.some(notZero)
      ).toBeTruthy();
      expect(net.model.outputConnector.weights.some(notZero)).toBeTruthy();
      expect(error).toBeGreaterThan(0);
      expect(error).toBeLessThan(Infinity);
    });
    it('after initial run, input does not have zeros in deltas', () => {
      const net = new RNN({
        hiddenLayers: [3],
        inputSize: 3,
        inputRange: 2,
        outputSize: 2,
      });
      net.initialize();
      net.trainInput([1, 1, 0]);
      net.model.input.deltas.forEach((v) => {
        expect(v).toBe(0);
      });
      net.backpropagate([1, 1, 0]);
      net.backpropagate([0, 1, 1]);
      net.backpropagate([1, 0, 1]);
      net.backpropagate([1, 1, 0]);
      expect(net.model.input.deltas.some(notZero)).toBeTruthy();
    });
    it('can handle unrecognized input characters', () => {
      const net = new RNN({ hiddenLayers: [3] });
      net.train([
        { input: '1', output: '2' },
        { input: '2', output: '3' },
      ]);

      expect(() => {
        net.run('7');
      }).not.toThrow();
    });
  });
  describe('xor', () => {
    function xorNet() {
      const net = new RNN({
        hiddenLayers: [20, 20],
        inputSize: 3,
        inputRange: 3,
        outputSize: 3,
      });
      net.initialize();
      net.train(xorNetValues, { iterations: 1 });
      return net;
    }

    const xorNetValues = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ];

    let predictTargetIndex: jest.SpyInstance;
    let backpropagateIndex: jest.SpyInstance;
    beforeEach(() => {
      predictTargetIndex = jest.spyOn(Equation.prototype, 'predictTargetIndex');
      backpropagateIndex = jest.spyOn(Equation.prototype, 'backpropagateIndex');
    });
    afterEach(() => {
      predictTargetIndex.mockRestore();
      backpropagateIndex.mockRestore();
    });

    it('properly provides values to equations[].predictTargetIndex', () => {
      const net = xorNet();
      predictTargetIndex.mockReset();
      net.trainInput([0, 0, 0]);
      // called in reverse
      expect(predictTargetIndex).toHaveBeenNthCalledWith(1, 0, 1);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(2, 1, 1);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(3, 1, 1);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(4, 1, 0);
      predictTargetIndex.mockReset();
      net.trainInput([0, 1, 1]);
      // called in reverse
      expect(predictTargetIndex).toHaveBeenNthCalledWith(1, 0, 1);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(2, 1, 2);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(3, 2, 2);
      expect(predictTargetIndex).toHaveBeenNthCalledWith(4, 2, 0);
    });

    it('properly provides values to equations[].runBackpropagate', () => {
      const net = xorNet();
      backpropagateIndex.mockReset();

      net.trainInput([0, 0, 0]);
      net.backpropagate([0, 0, 0]);
      expect(backpropagateIndex).toBeCalledTimes(4);
      // called in reverse
      expect(backpropagateIndex).toHaveBeenNthCalledWith(1, 1);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(2, 1);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(3, 1);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(4, 0);
      net.trainInput([0, 1, 1]);
      backpropagateIndex.mockReset();
      net.backpropagate([0, 1, 1]);
      expect(backpropagateIndex).toBeCalledTimes(4);
      // called in reverse
      expect(backpropagateIndex).toHaveBeenNthCalledWith(1, 2);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(2, 2);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(3, 1);
      expect(backpropagateIndex).toHaveBeenNthCalledWith(4, 0);
    });

    it('is fully connected and gives values in deltas', () => {
      const net = xorNet();
      net.initialize();
      const input = xorNetValues[2];
      net.model.allMatrices.forEach((m) => {
        m.deltas.forEach((value) => {
          expect(value).toBe(0);
        });
      });
      net.trainInput(input);

      net.model.input.deltas.forEach((v) => {
        expect(v).toBe(0);
      });
      net.model.hiddenLayers.forEach((layer) => {
        for (const p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          layer[p].deltas.forEach((v) => {
            expect(v).toBe(0);
          });
        }
      });
      net.model.output.deltas.forEach((v) => {
        expect(v).toBe(0);
      });

      net.backpropagate(input);

      expect(net.model.input.deltas.some(notZero)).toBeTruthy();
      net.model.hiddenLayers.forEach((layer) => {
        for (const p in layer) {
          if (!layer.hasOwnProperty(p)) continue;
          // if (!layer[p].deltas.some(notZero)) console.log(p);
          // assert(layer[p].deltas.some(notZero));
        }
      });
      expect(net.model.output.deltas.some(notZero)).toBeTruthy();

      net.model.equations.forEach((equation) => {
        equation.states.forEach((state) => {
          if (state.left && state.left.deltas) state.left.deltas.some(notZero);
          if (state.right && state.right.deltas)
            state.right.deltas.some(notZero);
          if (state.product && state.product.deltas)
            state.product.deltas.some(notZero);
        });
      });
    });

    it('deltas and weights do not explode', () => {
      const net = xorNet();
      const input = xorNetValues[2];

      function checkExploded() {
        allMatrices(net.model, (values: Float32Array) => {
          values.forEach((value) => {
            if (isNaN(value)) throw new Error('exploded');
          });
        });
      }

      expect(() => {
        for (let i = 0; i < 100; i++) {
          checkExploded();
          net.trainInput(input);
          checkExploded();
          net.backpropagate(input);
          checkExploded();
          net.adjustWeights();
          checkExploded();
        }
      }).not.toThrow();
    });

    it('can learn xor (error goes down)', () => {
      const net = xorNet();
      let initialError = Infinity;
      let error;

      for (let i = 0; i < 10; i++) {
        error = 0;
        for (let j = 0; j < 4; j++) {
          error += trainPattern(net, xorNetValues[j], true);
        }
        if (i === 0) {
          initialError = error;
        }
      }
      expect(error).toBeLessThan(initialError);
    });

    it('can predict xor', () => {
      const net = xorNet();
      for (let i = 0; i < 10; i++) {
        xorNetValues.forEach(function (value) {
          trainPattern(net, value, true);
        });
      }
      expect(net.run().length).toBe(3);
    });
  });

  describe('json', () => {
    describe('.toJSON()', () => {
      it('can export model as json', () => {
        const net = new RNN({
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

        compare(json.input, net.model.input);
        net.model.hiddenLayers.forEach((layer, i) => {
          compare(json.hiddenLayers[i].weight, layer.weight);
          compare(json.hiddenLayers[i].transition, layer.transition);
          compare(json.hiddenLayers[i].bias, layer.bias);
        });
        compare(json.output, net.model.output);
        compare(json.outputConnector, net.model.outputConnector);
      });
    });

    describe('.fromJSON()', () => {
      it('can import model from json', () => {
        const inputSize = 7;
        const hiddenLayers = [10, 20];
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new RNN({
            inputSize, // <- length
            hiddenLayers,
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
            dataFormatter,
          }).toJSON(),
          null,
          2
        );

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        const cloneString = JSON.stringify(clone.toJSON(), null, 2);
        expect(jsonString).toBe(cloneString);
        expect(clone.options.inputSize).toBe(dataFormatter.characters.length);
        expect(clone.options.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.options.outputSize).toBe(dataFormatter.characters.length);

        expect(clone.model.hiddenLayers.length).toBe(2);
        expect(clone.model.hiddenLayers[0].weight.columns).toBe(inputSize);
        expect(clone.model.hiddenLayers[0].weight.rows).toBe(hiddenLayers[0]);
        expect(clone.model.hiddenLayers[1].weight.columns).toBe(
          hiddenLayers[0]
        );
        expect(clone.model.hiddenLayers[1].weight.rows).toBe(hiddenLayers[1]);
      });

      it('can import model from json using .fromJSON()', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new RNN({
            inputSize: dataFormatter.characters.length, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));

        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        expect(clone.options.inputSize).toBe(7);
        expect(clone.options.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.options.outputSize).toBe(dataFormatter.characters.length);
      });

      it('will not initialize when importing json', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const original = new RNN({
          inputSize: 6, // <- length
          inputRange: dataFormatter.characters.length,
          hiddenLayers: [3, 3],
          outputSize: dataFormatter.characters.length, // <- length
          dataFormatter,
        });

        original.initialize();
        const jsonString = JSON.stringify(original.toJSON());

        const json = JSON.parse(jsonString);
        const clone = new RNN();
        clone.fromJSON(json);
        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        expect(clone.options.inputSize).toBe(7);
        expect(clone.options.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.options.outputSize).toBe(dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const net = new RNN({
          inputSize: 6, // <- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length, // <- length
          dataFormatter,
        });

        net.initialize();

        // over fit on purpose
        for (let i = 0; i < 10; i++) {
          trainPattern(net, [0, 1, 1]);
          trainPattern(net, [1, 0, 1]);
          trainPattern(net, [1, 1, 0]);
          trainPattern(net, [0, 0, 0]);
        }

        const error = trainPattern(net, [0, 1, 1], true);
        const jsonString = JSON.stringify(net.toJSON());
        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        const newError = trainPattern(clone, [0, 1, 1], true);
        expect(error - newError < 0.02).toBeTruthy();
        expect(jsonString).not.toBe(JSON.stringify(clone.toJSON()));
        expect(clone.options.inputSize).toBe(7);
        expect(clone.options.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.options.outputSize).toBe(dataFormatter.characters.length);
      });
    });
  });

  describe('.trainPattern()', () => {
    it('changes the neural net when ran', () => {
      const net = new RNN({
        dataFormatter: new DataFormatter([0, 1]),
        hiddenLayers: [2],
      });
      const netBeforeTraining = JSON.stringify(net.toJSON());

      net.train(
        [
          [0, 0, 0],
          [0, 1, 1],
          [1, 0, 1],
          [1, 1, 0],
        ],
        { iterations: 10, log: true }
      );
      const netAfterTraining = JSON.stringify(net.toJSON());
      expect(netBeforeTraining).not.toBe(netAfterTraining);
    });
  });

  describe('maxPredictionLength', () => {
    it('gets a default value', () => {
      expect(new RNN().options.maxPredictionLength).toBe(
        defaults().maxPredictionLength
      );
    });
    it('restores option', () => {
      const maxPredictionLength = Math.random();
      expect(new RNN({ maxPredictionLength }).options.maxPredictionLength).toBe(
        maxPredictionLength
      );
    });
    it('can be set multiple times', () => {
      const net = new RNN({ maxPredictionLength: 5 });
      expect(net.options.maxPredictionLength).toBe(5);
      net.options.maxPredictionLength = 1;
      expect(net.options.maxPredictionLength).toBe(1);
    });
    it('shortens returned values', () => {
      const net = new RNN({ maxPredictionLength: 3 });
      net.train([{ input: '123', output: '456' }], { errorThresh: 0.011 });
      const output1 = net.run('123');
      expect(output1.length).toBe(3);
      net.options.maxPredictionLength = 1;
      const output2 = net.run('123');
      expect(output2.length).toBe(1);
    });
  });

  describe('.toFunction()', () => {
    describe('without callback argument', () => {
      it('returns function that works still produces stable output', () => {
        const net = new RNN({
          hiddenLayers: [3],
        });
        net.train([
          { input: '1', output: '2' },
          { input: '2', output: '3' },
        ]);
        const expected1 = net.run('1');
        const expected2 = net.run('2');
        const fn = net.toFunction();

        expect(fn('1')).toBe(expected1);
        expect(fn('2')).toBe(expected2);
      });
    });
    describe('with callback argument', () => {
      it('returns string, which expects a result that makes a function that works still produces stable output', async () => {
        const net = new RNN({
          hiddenLayers: [3],
        });
        net.train([
          { input: '1', output: '2' },
          { input: '2', output: '3' },
        ]);
        const expected1 = net.run('1');
        const expected2 = net.run('2');
        const fn = await new Promise<RNNFunction>((resolve, reject) => {
          try {
            resolve(
              net.toFunction((_fnBody) => {
                expect(typeof _fnBody).toBe('string');
                return _fnBody;
              })
            );
          } catch (e) {
            reject(e);
          }
        });
        expect(fn('1')).toBe(expected1);
        expect(fn('2')).toBe(expected2);
      });
    });
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      const net = new RNN({
        inputSize: 7,
        inputRange: dataFormatter.characters.length,
        outputSize: 7,
        dataFormatter,
      });
      net.initialize();

      for (let i = 0; i < 100; i++) {
        trainPattern(net, dataFormatter.toIndexes('hi mom!'));
        // if (i % 10) {
        //   console.log(dataFormatter.toCharacters(net.run()).join(''));
        // }
      }

      const lastOutput = net.run();
      expect(net.toFunction()()).toBe(lastOutput);
    });
    it('can include the DataFormatter', () => {
      const net = new RNN();
      net.train(['hi mom!'], { log: true, errorThresh: 0.011 });
      const expected = net.run('hi');
      const newNet = net.toFunction();
      expect(newNet('hi')).toBe(expected);
    });
  });

  describe('.bindEquation()', () => {
    let getEquation: jest.SpyInstance;
    beforeEach(() => {
      getEquation = jest.spyOn(RNN.prototype, 'getEquation');
    });
    afterEach(() => {
      getEquation.mockRestore();
    });
    it('calls static getEquation method', () => {
      const net = new RNN();
      net.initialize();
      net.bindEquation();
      expect(getEquation).toBeCalled();
    });
  });
});
