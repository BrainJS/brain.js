import assert from 'assert';
const { getFileCoverageDataByName } = require('istanbul-spy');

function onePlusPlus3D(width, height, depth) {
  const grid = [];
  let i = 1;
  for (let z = 0; z < depth; z++) {
    const rows = [];
    for (let y = 0; y < height; y++) {
      const columns = [];
      for (let x = 0; x < width; x++) {
        columns.push(i++);
      }
      rows.push(columns);
    }
    grid.push(rows);
  }
  return grid;
}

function onePlusPlus2D(width, height) {
  const rows = [];
  let i = 1;
  for (let y = 0; y < height; y++) {
    const columns = [];
    for (let x = 0; x < width; x++) {
      columns.push(i++);
    }
    rows.push(columns);
  }
  return rows;
}

function zero3D(width, height, depth) {
  const grid = [];
  for (let z = 0; z < depth; z++) {
    const rows = [];
    for (let y = 0; y < height; y++) {
      const columns = [];
      for (let x = 0; x < width; x++) {
        columns.push(0);
      }
      rows.push(columns);
    }
    grid.push(rows);
  }
  return grid;
}

function zero2D(width, height) {
  const rows = [];
  for (let y = 0; y < height; y++) {
    const columns = [];
    for (let x = 0; x < width; x++) {
      columns.push(0);
    }
    rows.push(columns);
  }
  return rows;
}

function allWeights(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      assert(fn(layer[p].weights));
    }
  });
  fn(model.output.weights);

  model.equations.forEach((equation) => {
    equation.states.forEach((state) => {
      if (state.left && state.left.weights) fn(state.left.weights);
      if (state.right && state.right.weights) fn(state.right.weights);
      if (state.product && state.product.weights) fn(state.product.weights);
    });
  });
}

function allDeltas(model, fn) {
  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      assert(fn(layer[p].deltas));
    }
  });
  fn(model.output.deltas);

  model.equations.forEach((equation) => {
    equation.states.forEach((state) => {
      if (state.left && state.left.deltas) fn(state.left.deltas);
      if (state.right && state.right.deltas) fn(state.right.deltas);
      if (state.product && state.product.deltas) fn(state.product.deltas);
    });
  });
}

function allMatrices(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].weights);
    }
  });
  fn(model.output.weights);

  model.equations.forEach((equation) => {
    equation.states.forEach((state) => {
      if (state.left && state.left.weights) fn(state.left.weights);
      if (state.right && state.right.weights) fn(state.right.weights);
      if (state.product && state.product.weights) fn(state.product.weights);
    });
  });

  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer) => {
    for (const p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].deltas);
    }
  });
  fn(model.output.deltas);

  model.equations.forEach((equation) => {
    equation.states.forEach((state) => {
      if (state.left && state.left.deltas) fn(state.left.deltas);
      if (state.right && state.right.deltas) fn(state.right.deltas);
      if (state.product && state.product.deltas) fn(state.product.deltas);
    });
  });
}

function shave(array) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    if (Array.isArray(array[i]) || array[i].constructor === Float32Array) {
      result.push(shave(array[i]));
    } else {
      result.push(array[i].toFixed(8));
    }
  }
  return result;
}

// it was found that coverage breaks when you compare leftFunction.toString() === rightString.toString()
// this does a check on the first line of the function source, which is good enough for knowing the function signature
function expectFunction(source, fn) {
  expect(source.toString().split(/\n/g)[0]).toBe(fn.toString().split(/\n/g)[0]);
}

function injectIstanbulCoverage(name, kernel) {
  const data = getFileCoverageDataByName(name);
  if (!data) {
    throw new Error(`Could not find istanbul identifier ${name}`);
  }
  const { path } = data;
  const variable = `const ${name} = __coverage__['${path}'];\n`;
  if (!kernel.hasPrependString(variable)) {
    kernel.prependString(variable);
  }
}

module.exports = {
  onePlusPlus3D,
  onePlusPlus2D,
  zero3D,
  zero2D,
  allMatrices,
  allWeights,
  allDeltas,
  shave,
  expectFunction,
  injectIstanbulCoverage,
};
