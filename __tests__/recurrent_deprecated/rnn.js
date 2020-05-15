const RNN = require('../../src/recurrent/rnn');
const DataFormatter = require('../../src/utilities/data-formatter');
const { allMatrices } = require('../test-utils');
const istanbulLinkerUtil = require('../istanbul-linker-util');

function notZero(v) {
  return v !== 0;
}

describe('RNN', () => {
  describe('.constructor()', () => {
    it('does not initialize model', () => {
      const net = new RNN();
      expect(net.model).toBe(null);
    });
    describe('if has options.json', () => {
      const json = (() => {
        const net = new RNN({
          hiddenLayers: [3],
          inputSize: 3,
          inputRange: 2,
          outputSize: 2,
        });
        net.initialize();
        return net.toJSON();
      })();
      beforeEach(() => {
        jest.spyOn(RNN.prototype, 'fromJSON');
      });
      afterEach(() => {
        RNN.prototype.fromJSON.mockRestore();
      });
      it('calls this.fromJSON() with it', () => {
        const net = new RNN({ json });
        expect(net.fromJSON).toBeCalledWith(json);
      });
    });
  });
  describe('.initialize()', () => {
    describe('when creating hidden layers', () => {
      beforeEach(() => {
        jest.spyOn(RNN.prototype, 'createHiddenLayers');
        jest.spyOn(RNN, 'getModel');
      });
      afterEach(() => {
        RNN.prototype.createHiddenLayers.mockRestore();
        RNN.getModel.mockRestore();
      });
      it('calls createHiddenLayers', () => {
        const net = new RNN();
        net.initialize();
        expect(RNN.prototype.createHiddenLayers).toBeCalled();
      });
      it('calls static getModel method', () => {
        const net = new RNN();
        net.initialize();
        expect(RNN.getModel).toBeCalled();
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
  describe('basic operations', () => {
    it('starts with zeros in input.deltas', () => {
      const net = new RNN();
      net.initialize();
      net.model.input.deltas.forEach((v) => {
        expect(v === 0).toBeTruthy();
      });
    });
    it('after initial run, does not have zeros in deltas', () => {
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
      return net;
    }

    const xorNetValues = [
      [0, 0, 0],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
    ];

    it('properly provides values to equations[].predictTargetIndex', () => {
      const net = xorNet();
      const called = [];
      net.model.equations[0] = {
        predictTargetIndex: (v) => {
          called[0] = v;
          return { rows: 1, columns: 0, weights: [], deltas: [] };
        },
      };
      net.model.equations[1] = {
        predictTargetIndex: (v) => {
          called[1] = v;
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
      };
      net.model.equations[2] = {
        predictTargetIndex: (v) => {
          called[2] = v;
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
      };
      net.model.equations[3] = {
        predictTargetIndex: (v) => {
          called[3] = v;
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
      };
      net.model.equations[4] = {
        predictTargetIndex: (v) => {
          called[4] = v;
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
      };
      net.trainInput([0, 0, 0]);
      expect(called.length).toBe(4);
      expect(called[0]).toBe(0);
      expect(called[1]).toBe(1);
      expect(called[2]).toBe(1);
      expect(called[3]).toBe(1);
      net.trainInput([0, 1, 1]);
      expect(called.length).toBe(4);
      expect(called[0]).toBe(0);
      expect(called[1]).toBe(1);
      expect(called[2]).toBe(2);
      expect(called[3]).toBe(2);
    });

    it('properly provides values to equations[].runBackpropagate', () => {
      const net = xorNet();
      const backPropagateCalled = [];
      net.model.equations[0] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[0] = v;
        },
      };
      net.model.equations[1] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[1] = v;
        },
      };
      net.model.equations[2] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[2] = v;
        },
      };
      net.model.equations[3] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[3] = v;
        },
      };
      net.trainInput([0, 0, 0]);
      net.backpropagate([0, 0, 0]);
      expect(backPropagateCalled.length).toBe(4);
      expect(backPropagateCalled[0]).toBe(0);
      expect(backPropagateCalled[1]).toBe(1);
      expect(backPropagateCalled[2]).toBe(1);
      expect(backPropagateCalled[3]).toBe(1);
      net.trainInput([0, 1, 1]);
      net.backpropagate([0, 1, 1]);
      expect(backPropagateCalled.length).toBe(4);
      expect(backPropagateCalled[0]).toBe(0);
      expect(backPropagateCalled[1]).toBe(1);
      expect(backPropagateCalled[2]).toBe(2);
      expect(backPropagateCalled[3]).toBe(2);
    });

    it('properly provides values to equations[].runBackpropagate', () => {
      const net = xorNet();
      const backPropagateCalled = [];
      net.model.equations[0] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[0] = v;
        },
      };
      net.model.equations[1] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[1] = v;
        },
      };
      net.model.equations[2] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[2] = v;
        },
      };
      net.model.equations[3] = {
        predictTargetIndex: () => {
          return { rows: 0, columns: 0, weights: [], deltas: [] };
        },
        backpropagateIndex: (v) => {
          backPropagateCalled[3] = v;
        },
      };
      net.trainInput([0, 0, 0]);
      net.backpropagate([0, 0, 0]);
      expect(backPropagateCalled.length).toBe(4);
      expect(backPropagateCalled[0]).toBe(0);
      expect(backPropagateCalled[1]).toBe(1);
      expect(backPropagateCalled[2]).toBe(1);
      expect(backPropagateCalled[3]).toBe(1);
      net.trainInput([0, 1, 1]);
      net.backpropagate([0, 1, 1]);
      expect(backPropagateCalled.length).toBe(4);
      expect(backPropagateCalled[0]).toBe(0);
      expect(backPropagateCalled[1]).toBe(1);
      expect(backPropagateCalled[2]).toBe(2);
      expect(backPropagateCalled[3]).toBe(2);
    });

    it('is fully connected and gives values in deltas', () => {
      const net = xorNet();
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
        allMatrices(net.model, (values) => {
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
      let initialError;
      let error;

      for (let i = 0; i < 10; i++) {
        error = 0;
        for (let j = 0; j < 4; j++) {
          error += net.trainPattern(xorNetValues[j], true);
        }
        if (i === 0) {
          initialError = error;
        }
      }
      expect(initialError > error).toBeTruthy();
    });

    it('can predict xor', () => {
      const net = xorNet();
      for (let i = 0; i < 10; i++) {
        xorNetValues.forEach(function (value) {
          net.trainPattern(value, true);
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

        function compare(left, right) {
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
        const inputSize = 6;
        const hiddenLayers = [10, 20];
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const jsonString = JSON.stringify(
          new RNN({
            inputSize, // <- length
            hiddenLayers,
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON(),
          null,
          2
        );

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        const cloneString = JSON.stringify(clone.toJSON(), null, 2);
        expect(jsonString).toBe(cloneString);
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);

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
            inputSize: 6, // <- length
            inputRange: dataFormatter.characters.length,
            outputSize: dataFormatter.characters.length, // <- length
          }).toJSON()
        );

        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));

        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);
      });

      it('will not initialize when importing json', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const original = new RNN({
          inputSize: 6, // <- length
          inputRange: dataFormatter.characters.length,
          hiddenLayers: [3, 3],
          outputSize: dataFormatter.characters.length, // <- length
        });

        original.initialize();
        const jsonString = JSON.stringify(original.toJSON());

        const json = JSON.parse(jsonString);
        const clone = new RNN();
        clone.fromJSON(json);
        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);
      });

      it('can import model from json and train again', () => {
        const dataFormatter = new DataFormatter('abcdef'.split(''));
        const net = new RNN({
          inputSize: 6, // <- length
          inputRange: dataFormatter.characters.length,
          outputSize: dataFormatter.characters.length, // <- length
        });

        net.initialize();

        // over fit on purpose
        for (let i = 0; i < 10; i++) {
          net.trainPattern([0, 1, 1]);
          net.trainPattern([1, 0, 1]);
          net.trainPattern([1, 1, 0]);
          net.trainPattern([0, 0, 0]);
        }

        const error = net.trainPattern([0, 1, 1], true);
        const jsonString = JSON.stringify(net.toJSON());
        const clone = new RNN();
        clone.fromJSON(JSON.parse(jsonString));
        expect(jsonString).toBe(JSON.stringify(clone.toJSON()));
        const newError = clone.trainPattern([0, 1, 1], true);
        expect(error - newError < 0.02).toBeTruthy();
        expect(jsonString).not.toBe(JSON.stringify(clone.toJSON()));
        expect(clone.inputSize).toBe(6);
        expect(clone.inputRange).toBe(dataFormatter.characters.length);
        expect(clone.outputSize).toBe(dataFormatter.characters.length);
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
      expect(new RNN().maxPredictionLength).toBe(
        RNN.defaults.maxPredictionLength
      );
    });
    it('restores option', () => {
      const maxPredictionLength = Math.random();
      expect(new RNN({ maxPredictionLength }).maxPredictionLength).toBe(
        maxPredictionLength
      );
    });
    it('can be set multiple times', () => {
      const net = new RNN({ maxPredictionLength: 5 });
      expect(net.maxPredictionLength).toBe(5);
      net.maxPredictionLength = 1;
      expect(net.maxPredictionLength).toBe(1);
    });
    it('shortens returned values', () => {
      const net = new RNN({ maxPredictionLength: 3 });
      net.train([{ input: '123', output: '456' }], { errorThresh: 0.011 });
      const output1 = net.run('123');
      expect(output1.length).toBe(3);
      net.maxPredictionLength = 1;
      const output2 = net.run('123');
      expect(output2.length).toBe(1);
    });
  });

  describe('.toFunction()', () => {
    it('can output same as run method', () => {
      const dataFormatter = new DataFormatter(['h', 'i', ' ', 'm', 'o', '!']);
      const net = new RNN({
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
      expect(
        dataFormatter
          .toCharacters(net.toFunction(istanbulLinkerUtil)())
          .join('')
      ).toBe(lastOutput);
    });
    it('can include the DataFormatter', () => {
      const net = new RNN();
      net.train(['hi mom!'], { log: true, errorThresh: 0.011 });
      const expected = net.run('hi');
      const newNet = net.toFunction(istanbulLinkerUtil);
      expect(newNet('hi')).toBe(expected);
    });
  });

  describe('.bindEquation()', () => {
    beforeEach(() => {
      jest.spyOn(RNN, 'getEquation');
    });
    afterEach(() => {
      RNN.getEquation.mockRestore();
    });
    it('calls static getEquation method', () => {
      const net = new RNN();
      net.initialize();
      net.bindEquation();
      expect(RNN.getEquation).toBeCalled();
    });
  });

  describe('.setupData()', () => {
    describe('when working with array of strings', () => {
      it('creates an appropraite DataFormatter', () => {
        const net = new RNN();
        const result = net.setupData(['foo', 'bar', 'baz']);
        expect(result).toEqual([
          [0, 1, 1],
          [2, 3, 4],
          [2, 3, 5],
        ]);
        const { dataFormatter } = net;
        expect(dataFormatter.characters).toEqual([
          'f',
          'o',
          'b',
          'a',
          'r',
          'z',
          'unrecognized',
        ]);
      });
    });
    describe('when working with array of input & output strings', () => {
      it('creates an appropraite DataFormatter', () => {
        const net = new RNN();
        const result = net.setupData([
          { input: 'foo', output: 'bar' },
          { input: 'bar', output: 'baz' },
          { input: 'baz', output: 'foo' },
        ]);
        expect(result).toEqual([
          [0, 1, 1, 6, 7, 2, 3, 4],
          [2, 3, 4, 6, 7, 2, 3, 5],
          [2, 3, 5, 6, 7, 0, 1, 1],
        ]);
        const { dataFormatter } = net;
        expect(dataFormatter.characters).toEqual([
          'f',
          'o',
          'b',
          'a',
          'r',
          'z',
          'stop-input',
          'start-output',
          'unrecognized',
        ]);
      });
    });
    describe('when working with array of tokens', () => {
      it('creates an appropraite DataFormatter', () => {
        const net = new RNN();
        const result = net.setupData([
          ['foo', 'bar', 'baz'],
          ['bar', 'baz', 'foo'],
          ['baz', 'foo', 'bar'],
        ]);
        expect(result).toEqual([
          [0, 1, 2],
          [1, 2, 0],
          [2, 0, 1],
        ]);
        const { dataFormatter } = net;
        expect(dataFormatter.characters).toEqual([
          'foo',
          'bar',
          'baz',
          'unrecognized',
        ]);
      });
    });
    describe('when working with array of input & output tokens', () => {
      it('creates an appropraite DataFormatter', () => {
        const net = new RNN();
        const result = net.setupData([
          { input: ['foo', 'bar'], output: ['baz'] },
          { input: ['bar', 'baz'], output: ['foo'] },
          { input: ['baz', 'foo'], output: ['bar'] },
        ]);
        expect(result).toEqual([
          [0, 1, 3, 4, 2],
          [1, 2, 3, 4, 0],
          [2, 0, 3, 4, 1],
        ]);
        const { dataFormatter } = net;
        expect(dataFormatter.characters).toEqual([
          'foo',
          'bar',
          'baz',
          'stop-input',
          'start-output',
          'unrecognized',
        ]);
      });
    });
  });
});
