import { NeuralNetwork } from '../../src/neural-network';

describe('NeuralNetwork bitwise', () => {
  describe('bitwise functions sync training', () => {
    function testBitwise(
      data: Array<{
        input: number[];
        output: number[];
      }>
    ) {
      const net = new NeuralNetwork();
      net.train(data, { errorThresh: 0.003 });

      data.forEach((d) => {
        const actual = net.run(d.input);
        const expected = d.output;
        expect(actual[0]).toBeCloseTo(expected[0], 0.05);
      });
    }
    it('NOT function', () => {
      const not = [
        { input: [0], output: [1] },
        { input: [1], output: [0] },
      ];
      testBitwise(not);
    });

    it('XOR function', () => {
      const xor = [
        { input: [0.001, 0.001], output: [0.001] },
        { input: [0.001, 1], output: [1] },
        { input: [1, 0.001], output: [1] },
        { input: [1, 1], output: [0.001] },
      ];
      testBitwise(xor);
    });

    it('OR function', () => {
      const or = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [1] },
      ];
      testBitwise(or);
    });

    it('AND function', () => {
      const and = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
      ];
      testBitwise(and);
    });
  });

  describe('bitwise using adam praxis functions sync training', () => {
    function testBitwiseAdam(
      data: Array<{
        input: number[];
        output: number[];
      }>
    ) {
      const net = new NeuralNetwork();
      net.train(data, {
        errorThresh: 0.003,
        learningRate: 0.05,
        praxis: 'adam',
      });

      data.forEach((d) => {
        const actual = net.run(d.input);
        const expected = d.output;
        expect(actual[0]).toBeCloseTo(expected[0], 0.05);
      });
    }
    it('NOT function', () => {
      const not = [
        { input: [0], output: [1] },
        { input: [1], output: [0] },
      ];
      testBitwiseAdam(not);
    });

    it('XOR function', () => {
      const xor = [
        { input: [0.001, 0.001], output: [0.001] },
        { input: [0.001, 1], output: [1] },
        { input: [1, 0.001], output: [1] },
        { input: [1, 1], output: [0.001] },
      ];
      testBitwiseAdam(xor);
    });

    it('OR function', () => {
      const or = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [1] },
      ];
      testBitwiseAdam(or);
    });

    it('AND function', () => {
      const and = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
      ];
      testBitwiseAdam(and);
    });
  });

  describe('bitwise using async training', () => {
    async function testBitwiseAsync(data: Array<{
      input: number[];
      output: number[];
    }>) {
      const net = new NeuralNetwork();
      await net.trainAsync(data, { errorThresh: 0.003, timeout: 4800 })
      data.forEach((d) => {
        const actual = net.run(d.input);
        const expected = d.output;
        expect(actual[0]).toBeCloseTo(expected[0], 0.05);
      });
    }
    it('NOT function', async () => {
      const not = [
        { input: [0], output: [1] },
        { input: [1], output: [0] },
      ];
      await testBitwiseAsync(not);
    });

    it('XOR function', async () => {
      const xor = [
        { input: [0.001, 0.001], output: [0.001] },
        { input: [0.001, 1], output: [1] },
        { input: [1, 0.001], output: [1] },
        { input: [1, 1], output: [0.001] },
      ];
      await testBitwiseAsync(xor);
    });

    it('OR function', async () => {
      const or = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [1] },
        { input: [1, 0], output: [1] },
        { input: [1, 1], output: [1] },
      ];
      await testBitwiseAsync(or);
    });

    it('AND function', async () => {
      const and = [
        { input: [0, 0], output: [0] },
        { input: [0, 1], output: [0] },
        { input: [1, 0], output: [0] },
        { input: [1, 1], output: [1] },
      ];
      await testBitwiseAsync(and);
    });
  });
});
