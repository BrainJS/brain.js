var canvas = require("canvas"),
    _ = require("underscore"),
    brain = require("../../lib/brain"),
    crossValidate = require("../../lib/cross-validate");

var dim = 24;

function getSampling(context, letter, font) {
  context.clearRect(0, 0, dim, dim);
  context.font = dim + "px " + font;
  context.fillText(letter, 0, dim);

  var data = context.getImageData(0, 0, dim, dim);
  var lumas = extractPoints(data);
  return lumas;
}

function extractPoints(imageData) {
  var points = [];
  for (var x = 0; x < imageData.width; x = x + 2) {
    for (var y = 0; y < imageData.height; y = y + 2) {
      var i = x * 4 + y * 4 * imageData.width;
      var r = imageData.data[i],
          g = imageData.data[i + 1],
          b = imageData.data[i + 2],
          a = imageData.data[i + 3];

      var luma = a == 0 ? 1 : (r * 299/1000 + g * 587/1000
        + b * 114/1000 ) / 255;

      points.push(luma);
    }
  }
  return points;
}

describe('OCR cross-validation', function() {
  it('recognize characters in different fonts', function() {
    var canvas = require("canvas");
    var canvas = new canvas(dim, dim);
    var context = canvas.getContext("2d");

    var letters = ["A", "B", "C", "D", "E",
                   "K", "O", "Z"];
    var fonts = ["Arial", "Courier", "Georgia", "Menlo", "Optima",
                 "Copperplate", "American Typewriter", "Comic Sans",
                 "Baskerville", "Verdana", "Helvetica", "Didot",
                 "Geneva", "Cracked", "Impact", "Cooper"];

    var data = [];

    letters.forEach(function(letter) {
       fonts.forEach(function(font) {
          var input = getSampling(context, letter, font);

          var output = {};
          output[letter] = 1;
          data.push({ input: input, output: output });
       });
    });

    console.log("Cross validating");
    var result = crossValidate(brain.NeuralNetwork, data, {});

    console.log("\nMisclassifications:");
    result.misclasses.forEach(function(misclass) {
      console.log("input: " + misclass.input
        + " actual: " + letters[misclass.actual]
        + " expected: " + letters[misclass.expected] + "\n")
    })

    console.log("\nCross-validation of OCR data:\n");
    console.log(result.avgs);

    console.log("\nMisclassification rate: "
      + result.misclasses.length / data.length);

    console.log("\nMean squared error: "
      + result.avgs.error);

    var perf = result.avgs.iterations / (result.avgs.trainTime / 1000);
    console.log("\nTraining iterations per second: " + perf);

    assert.ok(result.avgs.error < .1);
  })
})
