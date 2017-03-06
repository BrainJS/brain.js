import assert from 'assert';

export function allWeights(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (let p in layer) {
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

export function allDeltas(model, fn) {
  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer) => {
    for (let p in layer) {
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

export function allMatrices(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (let p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].weights);
    }
  });
  fn(model.output.weights);

  model.equations.forEach((equation, equationIndex) => {
    equation.states.forEach((state, stateIndex) => {
      if (state.left && state.left.weights) fn(state.left.weights);
      if (state.right && state.right.weights) fn(state.right.weights);
      if (state.product && state.product.weights) fn(state.product.weights);
    });
  });

  fn(model.input.deltas);
  model.hiddenLayers.forEach((layer) => {
    for (let p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].deltas);
    }
  });
  fn(model.output.deltas);

  model.equations.forEach((equation, equationIndex) => {
    equation.states.forEach((state, stateIndex) => {
      if (state.left && state.left.deltas) fn(state.left.deltas);
      if (state.right && state.right.deltas) fn(state.right.deltas);
      if (state.product && state.product.deltas) fn(state.product.deltas);
    });
  });
}

export default {
  allMatrices,
  allWeights,
  allDeltas
};