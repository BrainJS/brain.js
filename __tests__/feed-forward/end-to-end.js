import brain from '../../src'
import zeros2D from '../../src/utilities/zeros-2d'

const { layer, NeuralNetwork, FeedForward } = brain

const {
  // Base,
  // Convolution,
  // convolution,
  feedForward,
  // Input,
  input,
  // multiply,
  // Output,
  output,
  // Pool,
  // pool,
  // random,
  // Relu,
  // relu,
  Sigmoid,
  // sigmoid,
  // SoftMax,
  // softMax,
  Target,
  target,
  // Zeros,
  // zeros,
} = layer

const xorTrainingData = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [0] },
]

/* eslint-disable no-multi-assign */

describe('FeedForward Class: End to End', () => {
  describe('when configured like NeuralNetwork', () => {
    test('outputs the exact same values', () => {
      const standardNet = new NeuralNetwork([2, 3, 1])
      const ffNet = new FeedForward({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          inputLayer => feedForward({ height: 3 }, inputLayer),
          inputLayer => feedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: inputLayer => target({ height: 1 }, inputLayer),
      })

      ffNet.initialize()
      // learning deviates, which we'll test elsewhere, for the time being, just don't learn
      standardNet._adjustWeights = () => {}
      ffNet.layers.forEach(l => {
        l.praxis.run = () => {}
        l.learn = () => {}
      })
      standardNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1,
      })
      ffNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1,
      })

      // set both nets exactly the same, then train them once, and compare
      const biasLayers = ffNet.layers.filter(l => l.name === 'biases')
      const weightLayers = ffNet.layers.filter(l => l.name === 'weights')
      const sigmoidLayers = ffNet.layers.filter(l => l.constructor === Sigmoid)

      // zero out
      ffNet.layers.forEach(l => {
        l.deltas = zeros2D(l.width, l.height)
        l.weights = zeros2D(l.width, l.height)
      })

      standardNet.deltas.forEach(deltas => {
        for (let i = 0; i < deltas.length; i++) {
          deltas[i] = 0
        }
      })
      standardNet.outputs[1][0] = 0
      standardNet.outputs[1][1] = 0
      standardNet.outputs[1][2] = 0
      standardNet.outputs[2][0] = 0
      standardNet.errors[0][0] = 0
      standardNet.errors[0][1] = 0
      standardNet.errors[1][0] = 0
      standardNet.errors[1][1] = 0
      standardNet.errors[1][2] = 0
      standardNet.errors[2][0] = 0

      // set biases
      standardNet.biases[1][0] = biasLayers[0].weights[0][0] = 5
      standardNet.biases[1][1] = biasLayers[0].weights[1][0] = 7
      standardNet.biases[1][2] = biasLayers[0].weights[2][0] = 2
      standardNet.biases[2][0] = biasLayers[1].weights[0][0] = 7

      // set weights
      standardNet.outputs[0][0] = ffNet._inputLayer.weights[0][0] = 1
      standardNet.outputs[0][1] = ffNet._inputLayer.weights[1][0] = 1

      standardNet.weights[1][0][0] = weightLayers[0].weights[0][0] = 5
      standardNet.weights[1][0][1] = weightLayers[0].weights[0][1] = 10
      standardNet.weights[1][1][0] = weightLayers[0].weights[1][0] = 3
      standardNet.weights[1][1][1] = weightLayers[0].weights[1][1] = 1
      standardNet.weights[1][2][0] = weightLayers[0].weights[2][0] = 8
      standardNet.weights[1][2][1] = weightLayers[0].weights[2][1] = 4

      standardNet.weights[2][0][0] = weightLayers[1].weights[0][0] = 2
      standardNet.weights[2][0][1] = weightLayers[1].weights[0][1] = 6
      standardNet.weights[2][0][2] = weightLayers[1].weights[0][2] = 3

      standardNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1,
      })

      ffNet.train([{ input: [1, 1], output: [0] }], {
        iterations: 1,
        reinforce: true,
      })

      // TODO: Test fails
      expect(standardNet.outputs[1][0]).toBeCloseTo(
        sigmoidLayers[0].weights[0][0]
      )
      expect(standardNet.outputs[1][1]).toBeCloseTo(
        sigmoidLayers[0].weights[1][0]
      )
      expect(standardNet.outputs[1][2]).toBeCloseTo(
        sigmoidLayers[0].weights[2][0]
      )
      expect(standardNet.outputs[2][0]).toBeCloseTo(
        sigmoidLayers[0].weights[0][0]
      )
    })
  })

  describe('.runInput()', () => {
    test('outputs a number', () => {
      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          inputLayer => feedForward({ width: 1, height: 1 }, inputLayer),
        ],
        outputLayer: inputLayer => output({ width: 1, height: 1 }, inputLayer),
      })

      net.initialize()
      const result = net.runInput([[1]])

      expect(typeof result[0][0] === 'number').toBeTruthy()
    })
  })

  describe('.train()', () => {
    test('outputs a number that is smaller than when it started', () => {
      const net = new FeedForward({
        inputLayer: () => input({ height: 2 }),
        hiddenLayers: [
          inputLayer => feedForward({ height: 3 }, inputLayer),
          inputLayer => feedForward({ height: 1 }, inputLayer),
        ],
        outputLayer: inputLayer => target({ height: 1 }, inputLayer),
      })
      const errors = []
      net.errorCheckInterval = 1
      net.train(xorTrainingData, {
        iterations: 10,
        threshold: 0.5,
        callbackPeriod: 1,
        callback: info => errors.push(info.error),
      })

      expect(
        errors.reduce((prev, cur) => prev && typeof cur === 'number', true)
      ).toBeTruthy()

      expect(errors[0]).toBeGreaterThan(errors[9])
    })

    test('can learn xor', () => {
      const errors = []
      const net = new FeedForward({
        inputLayer: () =>
          input({
            height: 2,
          }),
        hiddenLayers: [
          inputLayer =>
            feedForward(
              {
                height: 3,
              },
              inputLayer
            ),
          inputLayer =>
            feedForward(
              {
                height: 1,
              },
              inputLayer
            ),
        ],
        outputLayer: inputLayer =>
          target(
            {
              height: 1,
            },
            inputLayer
          ),
      })

      net.train(xorTrainingData, {
        callbackPeriod: 1,
        callback: info => errors.push(info.error),
      })

      const result1 = net.run([0, 0])
      const result2 = net.run([0, 1])
      const result3 = net.run([1, 0])
      const result4 = net.run([1, 1])

      // TODO: Test fails

      expect(result1[0][0]).toBeLessThan(0.5)
      expect(result2[0][0]).toBeGreaterThan(0.5)
      expect(result3[0][0]).toBeGreaterThan(0.5)
      expect(result4[0][0]).toBeLessThan(0.5)
    })
  })

  describe('._calculateDeltas()', () => {
    test('populates deltas from output to input', () => {
      class SuperOutput extends Target {
        constructor(settings, inputLayer) {
          super(settings, inputLayer)
          this.deltas = zeros2D(this.width, this.height)
          this.inputLayer = inputLayer
        }
      }

      const net = new FeedForward({
        inputLayer: () => input({ width: 1, height: 1 }),
        hiddenLayers: [
          inputLayer => feedForward({ width: 1, height: 1 }, inputLayer),
        ],
        outputLayer: inputLayer =>
          new SuperOutput({ width: 1, height: 1 }, inputLayer),
      })
      net.initialize()
      net.layers[0].weights = [[1]]

      net.layers.forEach(layerLayer => {
        layerLayer.deltas.forEach(row => {
          row.forEach(delta => {
            expect(delta).toBe(0)
          })
        })
      })
      net.runInput([[1]])
      net._calculateDeltas([[1]])

      net.layers.forEach(l => {
        l.deltas.forEach(row => {
          row.forEach(delta => {
            expect(delta === 0).toBeFalsy()
          })
        })
      })
    })
  })
})
