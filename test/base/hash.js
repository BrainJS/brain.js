import assert from 'assert';
import brain from '../../src';

describe('hash input and output', function () {
  it ('runs correctly with array input and output', function () {
    let net = new brain.NeuralNetwork ();

    net.train ([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ]);

    let output = net.run ([1, 0]);
    assert.ok (output[0] > 0.9, 'output: ' + output[0]);
  });

  it ('runs correctly with hash input', function () {
    let net = new brain.NeuralNetwork ();
    net.train ([
      { input: { x: 0, y: 0 }, output: [0] },
      { input: { x: 0, y: 1 }, output: [1] },
      { input: { x: 1, y: 0 }, output: [1] },
      { input: { x: 1, y: 1 }, output: [0] }
    ]);

    let output = net.run ({x: 1, y: 0});
    assert.ok (output[0] > 0.9, 'output: ' + output[0]);
  });

  it ('runs correctly with hash output', function () {
    let net = new brain.NeuralNetwork();
    net.train ([
      { input: [0, 0], output: { answer: 0 } },
      { input: [0, 1], output: { answer: 1 } },
      { input: [1, 0], output: { answer: 1 } },
      { input: [1, 1], output: { answer: 0 } }
    ]);

    let output = net.run ([1, 0]);
    assert.ok (output.answer > 0.9, 'output: ' + output.answer);
  });

  it ('runs correctly with hash input and output', function () {
    let net = new brain.NeuralNetwork();
    net.train ([
      { input: { x: 0, y: 0 }, output: { answer: 0 } },
      { input: { x: 0, y: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 0 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: { answer: 0 } }
    ]);

    let output = net.run ({x: 1, y: 0});
    assert.ok (output.answer > 0.9, 'output: ' + output.answer);
  });

  it ('runs correctly with sparse hashes', function () {
    let net = new brain.NeuralNetwork ();
    net.train ([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ]);

    let output = net.run ({x: 1});
    assert.ok (output.answer > 0.9);
  });

  it ('runs correctly with unseen input', function () {
    let net = new brain.NeuralNetwork ();
    net.train ([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ]);

    let output = net.run ({x: 1, z: 1});
    assert.ok (output.answer > 0.9);
  });
});

describe('async hash input and output', function () {
  it ('runs correctly with array input and output', function (done) {
    let net = new brain.NeuralNetwork ();

    net.trainAsync ([
      { input: [0, 0], output: [0] },
      { input: [0, 1], output: [1] },
      { input: [1, 0], output: [1] },
      { input: [1, 1], output: [0] }
    ], function () {
      let output = net.run ([1, 0]);
      assert.ok (output[0] > 0.9, 'output: ' + output[0]);
      done ();
    });
  }).timeout (10000);

 it ('runs correctly with hash input', function (done) {
    let net = new brain.NeuralNetwork ();

    net.trainAsync ([
      { input: { x: 0, y: 0 }, output: [0] },
      { input: { x: 0, y: 1 }, output: [1] },
      { input: { x: 1, y: 0 }, output: [1] },
      { input: { x: 1, y: 1 }, output: [0] }
    ], function () {
      let output = net.run ({x: 1, y: 0});
      assert.ok (output[0] > 0.9, 'output: ' + output[0]);
      done ();
    });
  }).timeout (10000);

 it ('runs correctly with hash output', function (done) {
    let net = new brain.NeuralNetwork();

    net.trainAsync ([
      { input: [0, 0], output: { answer: 0 } },
      { input: [0, 1], output: { answer: 1 } },
      { input: [1, 0], output: { answer: 1 } },
      { input: [1, 1], output: { answer: 0 } }
    ], function () {
      let output = net.run ([1, 0]);
      assert.ok (output.answer > 0.9, 'output: ' + output.answer);
      done ();
    });
  }).timeout (10000);

  it ('runs correctly with hash input and output', function (done) {
    let net = new brain.NeuralNetwork();

    net.trainAsync ([
      { input: { x: 0, y: 0 }, output: { answer: 0 } },
      { input: { x: 0, y: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 0 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: { answer: 0 } }
    ], function () {
      let output = net.run ({x: 1, y: 0});
      assert.ok (output.answer > 0.9, 'output: ' + output.answer);
      done ();
    });
  }).timeout (10000);

  it ('runs correctly with sparse hashes', function (done) {
    let net = new brain.NeuralNetwork ();

    net.trainAsync  ([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ], function () {
      let output = net.run ({x: 1});
      assert.ok (output.answer > 0.9);
      done ();
    });
  }).timeout (10000);

  it ('runs correctly with unseen input', function (done) {
    let net = new brain.NeuralNetwork ();

    net.trainAsync  ([
      { input: {}, output: {} },
      { input: { y: 1 }, output: { answer: 1 } },
      { input: { x: 1 }, output: { answer: 1 } },
      { input: { x: 1, y: 1 }, output: {} }
    ], function () {
      let output = net.run ({x: 1, z: 1});
      assert.ok (output.answer > 0.9);
      done ();
    });
  }).timeout (10000);
});
