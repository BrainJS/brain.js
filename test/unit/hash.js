var assert = require("assert"),
    brain = require("../../lib/brain");

describe('hash input and output', function() {
  it('runs correctly with array input and output', function() {
    var net = new brain.NeuralNetwork();

    net.train([{input: [0, 0], output: [0]},
               {input: [0, 1], output: [1]},
               {input: [1, 0], output: [1]},
               {input: [1, 1], output: [0]}]);
    var output = net.run([1, 0]);

    assert.ok(output[0] > 0.9, "output: " + output[0]);
  })

 it('runs correctly with hash input', function() {
    var net = new brain.NeuralNetwork();

    var info = net.train([{input: { x: 0, y: 0 }, output: [0]},
               {input: { x: 0, y: 1 }, output: [1]},
               {input: { x: 1, y: 0 }, output: [1]},
               {input: { x: 1, y: 1 }, output: [0]}]);
    var output = net.run({x: 1, y: 0});

    assert.ok(output[0] > 0.9, "output: " + output[0]);
  })

 it('runs correctly with hash output', function() {
    var net = new brain.NeuralNetwork();

    net.train([{input: [0, 0], output: { answer: 0 }},
               {input: [0, 1], output: { answer: 1 }},
               {input: [1, 0], output: { answer: 1 }},
               {input: [1, 1], output: { answer: 0 }}]);

    var output = net.run([1, 0]);

    assert.ok(output.answer > 0.9, "output: " + output.answer);
  })

  it('runs correctly with hash input and output', function() {
    var net = new brain.NeuralNetwork();

    net.train([{input: { x: 0, y: 0 }, output: { answer: 0 }},
               {input: { x: 0, y: 1 }, output: { answer: 1 }},
               {input: { x: 1, y: 0 }, output: { answer: 1 }},
               {input: { x: 1, y: 1 }, output: { answer: 0 }}]);

    var output = net.run({x: 1, y: 0});

    assert.ok(output.answer > 0.9, "output: " + output.answer);
  })

  it('runs correctly with sparse hashes', function() {
      var net = new brain.NeuralNetwork();

      net.train([{input: {}, output: {}},
                 {input: { y: 1 }, output: { answer: 1 }},
                 {input: { x: 1 }, output: { answer: 1 }},
                 {input: { x: 1, y: 1 }, output: {}}]);


      var output = net.run({x: 1});

      assert.ok(output.answer > 0.9);
  })

  it('runs correctly with unseen input', function() {
      var net = new brain.NeuralNetwork();

      net.train([{input: {}, output: {}},
                 {input: { y: 1 }, output: { answer: 1 }},
                 {input: { x: 1 }, output: { answer: 1 }},
                 {input: { x: 1, y: 1 }, output: {}}]);

      var output = net.run({x: 1, z: 1});
      assert.ok(output.answer > 0.9);
  })
})
