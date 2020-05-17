const NeuralNetwork = require('../../src/neural-network');

const data = [
  { input: [0, 0], output: [0] },
  { input: [0, 1], output: [1] },
  { input: [1, 0], output: [1] },
  { input: [1, 1], output: [1] },
];

describe('train() options', () => {
  it('train until error threshold reached', () => {
    const net = new NeuralNetwork();
    const res = net.train(data, { errorThresh: 0.2 });
    expect(res.error < 0.2).toBeTruthy();
  });

  it('train until max iterations reached', () => {
    const net = new NeuralNetwork();
    const res = net.train(data, { iterations: 25 });
    expect(res.iterations).toBe(25);
  });

  it('training callback called with training stats', () => {
    const iters = 100;
    const period = 20;
    const target = iters / period;

    let calls = 0;

    const net = new NeuralNetwork();
    net.train(data, {
      iterations: iters,
      callbackPeriod: period,
      callback: (res) => {
        expect(res.iterations % period === 0).toBeTruthy();
        calls++;
      },
    });
    expect(target === calls).toBeTruthy();
  });

  it('learningRate - higher learning rate should train faster', () => {
    const data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] },
    ];

    const net = new NeuralNetwork();
    const res = net.train(data, { learningRate: 0.5 });

    const net2 = new NeuralNetwork();
    const res2 = net2.train(data, { learningRate: 0.8 });

    expect(res.iterations > res2.iterations * 1.1).toBeTruthy();
  });

  it('momentum - higher momentum should train faster', () => {
    const data = [
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [1] },
    ];

    const net = new NeuralNetwork({ momentum: 0.1 });
    const res = net.train(data);

    const net2 = new NeuralNetwork({ momentum: 0.5 });
    const res2 = net2.train(data);

    expect(Math.abs(res.iterations - res2.iterations)).toBeLessThan(500);
  });
});

describe('train() and trainAsync() use the same private methods', () => {
  const trainingData = [{ input: [0, 0], output: [0] }];
  const opts = { iterations: 1 };
  const net = new NeuralNetwork();
  const methodsChecked = [
    'prepTraining',
    'updateTrainingOptions',
    'formatData',
    'verifyIsInitialized',
    'trainingTick',
  ];

  beforeEach(() => {
    methodsChecked.forEach((m) => jest.spyOn(net, m));
  });
  afterEach(() => {
    methodsChecked.forEach((m) => net[m].mockRestore());
  });

  it('.prepTraining()', (done) => {
    net.train(trainingData, opts);
    expect(net.prepTraining.mock.calls.length).toBe(1);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        expect(net.prepTraining.mock.calls.length).toBe(2);
        done();
      })
      .catch(() => {
        expect(false).toBeTruthy();
        done();
      });
  });

  it('.updateTrainingOptions()', (done) => {
    net.train(trainingData, opts);
    expect(net.updateTrainingOptions.mock.calls.length).toBe(1);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        expect(net.updateTrainingOptions.mock.calls.length).toBe(2);
        done();
      })
      .catch(() => {
        expect(false).toBeTruthy();
        done();
      });
  });

  it('.formatData()', (done) => {
    net.train(trainingData, opts);
    expect(net.formatData.mock.calls.length).toBe(1);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        expect(net.formatData.mock.calls.length).toBe(2);
        done();
      })
      .catch(() => {
        expect(false).toBeTruthy();
        done();
      });
  });

  it('.verifyIsInitialized()', (done) => {
    net.train(trainingData, opts);
    expect(net.verifyIsInitialized.mock.calls.length).toBe(1);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        expect(net.verifyIsInitialized.mock.calls.length).toBe(2);
        done();
      })
      .catch(() => {
        expect(false).toBeTruthy();
        done();
      });
  });

  it('.trainingTick()', (done) => {
    net.train(trainingData, opts);
    // The loop calls _trainingTick twice and returns immediately on second call
    expect(net.trainingTick.mock.calls.length).toBe(2);
    net
      .trainAsync(trainingData, opts)
      .then(() => {
        // trainAsync only calls _trainingTick once
        expect(net.trainingTick.mock.calls.length).toBe(3);
        done();
      })
      .catch(() => {
        expect(false).toBeTruthy();
        done();
      });
  });
});

describe('training options validation', () => {
  it('iterations validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ iterations: 'should be a string' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ iterations: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ iterations: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ iterations: -1 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ iterations: 5000 });
    }).not.toThrow();
  });

  it('errorThresh validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: 5 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: -1 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ errorThresh: 0.008 });
    }).not.toThrow();
  });

  it('log validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ log: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ log: 4 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ log: false });
    }).not.toThrow();
    expect(() => {
      net.updateTrainingOptions({ log: () => {} });
    }).not.toThrow();
  });

  it('logPeriod validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ logPeriod: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ logPeriod: -50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ logPeriod: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ logPeriod: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ logPeriod: 40 });
    }).not.toThrow();
  });

  it('learningRate validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ learningRate: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ learningRate: -50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ learningRate: 50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ learningRate: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ learningRate: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ learningRate: 0.5 });
    }).not.toThrow();
  });

  it('momentum validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ momentum: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ momentum: -50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ momentum: 50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ momentum: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ momentum: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ momentum: 0.8 });
    }).not.toThrow();
  });

  it('callback validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ callback: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callback: 4 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callback: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callback: null });
    }).not.toThrow();
    expect(() => {
      net.updateTrainingOptions({ callback: () => {} });
    }).not.toThrow();
  });

  it('callbackPeriod validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ callbackPeriod: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callbackPeriod: -50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callbackPeriod: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callbackPeriod: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ callbackPeriod: 40 });
    }).not.toThrow();
  });

  it('timeout validation', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ timeout: 'no strings' });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ timeout: -50 });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ timeout: () => {} });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ timeout: false });
    }).toThrow();
    expect(() => {
      net.updateTrainingOptions({ timeout: 40 });
    }).not.toThrow();
  });

  it('should handle unsupported options', () => {
    const net = new NeuralNetwork();
    expect(() => {
      net.updateTrainingOptions({ fakeProperty: 'should be handled fine' });
    }).not.toThrow();
  });
});
