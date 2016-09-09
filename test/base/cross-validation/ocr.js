import canvas from 'canvas';
import assert from 'assert';
import brain from '../../../src';
import crossValidate from '../../../src/cross-validate';
let dim = 24;

function getSampling(context, letter, font) {
  context.clearRect(0, 0, dim, dim);
  context.font = dim + 'px ' + font;
  context.fillText(letter, 0, dim);

  let data = context.getImageData(0, 0, dim, dim);
  let lumas = extractPoints(data);
  return lumas;
}

function extractPoints(imageData) {
  let points = [];
  for (let x = 0; x < imageData.width; x = x + 2) {
    for (let y = 0; y < imageData.height; y = y + 2) {
      let i = x * 4 + y * 4 * imageData.width;
      let r = imageData.data[i];
      let g = imageData.data[i + 1];
      let b = imageData.data[i + 2];
      let a = imageData.data[i + 3];
      let luma = a == 0 ? 1 : (r * 299/1000 + g * 587/1000
        + b * 114/1000 ) / 255;

      points.push(luma);
    }
  }
  return points;
}

describe('OCR cross-validation', () => {
  it('recognize characters in different fonts', () => {
    let _canvas = new canvas(dim, dim);
    let context = _canvas.getContext('2d');
    let letters = [
      'A',
      'B',
      'C',
      'D',
      'E',
      'K',
      'O',
      'Z'
    ];
    let fonts = [
      'Arial',
      'Courier',
      'Georgia',
      'Menlo',
      'Optima',
      'Copperplate',
      'American Typewriter',
      'Comic Sans',
      'Baskerville',
      'Verdana',
      'Helvetica',
      'Didot',
      'Geneva',
      'Cracked',
      'Impact',
      'Cooper'
    ];
    let data = [];

    letters.forEach((letter) => {
       fonts.forEach((font) => {
          let input = getSampling(context, letter, font);

          let output = {};
          output[letter] = 1;
          data.push({ input: input, output: output });
       });
    });

    console.log('Cross validating');
    let opts = {};
    let trainOpts = { log: console.log, errorThresh: 0.08 };
    let result = crossValidate(brain.NeuralNetwork, data, opts, trainOpts);

    console.log('\nMisclassifications:');
    result.misclasses.forEach((misclass) => {
      console.log('input: ' + misclass.input
        + ' actual: ' + letters[misclass.actual]
        + ' expected: ' + letters[misclass.expected] + '\n')
    });

    console.log('\nCross-validation of OCR data:\n');
    console.log(result.avgs);

    console.log('\nMisclassification rate: '
      + result.misclasses.length / data.length);

    console.log('\nMean squared error: '
      + result.avgs.error);

    let perf = result.avgs.iterations / (result.avgs.trainTime / 1000);
    console.log('\nTraining iterations per second: ' + perf);

    assert.ok(result.avgs.error < .1);
  })
});
