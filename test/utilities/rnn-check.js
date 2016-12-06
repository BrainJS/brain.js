import assert from 'assert';

export function allWeights(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (var p in layer) {
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

export function allRecurrences(model, fn) {
  fn(model.input.recurrence);
  model.hiddenLayers.forEach((layer) => {
    for (var p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      assert(fn(layer[p].recurrence));
    }
  });
  fn(model.output.recurrence);

  model.equations.forEach((equation) => {
    equation.states.forEach((state) => {
      if (state.left && state.left.recurrence) fn(state.left.recurrence);
      if (state.right && state.right.recurrence) fn(state.right.recurrence);
      if (state.product && state.product.recurrence) fn(state.product.recurrence);
    });
  });
}

export function allMatrices(model, fn) {
  fn(model.input.weights);
  model.hiddenLayers.forEach((layer) => {
    for (var p in layer) {
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

  fn(model.input.recurrence);
  model.hiddenLayers.forEach((layer) => {
    for (var p in layer) {
      if (!layer.hasOwnProperty(p)) continue;
      fn(layer[p].recurrence);
    }
  });
  fn(model.output.recurrence);

  model.equations.forEach((equation, equationIndex) => {
    equation.states.forEach((state, stateIndex) => {
      if (state.left && state.left.recurrence) fn(state.left.recurrence);
      if (state.right && state.right.recurrence) fn(state.right.recurrence);
      if (state.product && state.product.recurrence) fn(state.product.recurrence);
    });
  });
}

export default {
  allMatrices,
  allWeights,
  allRecurrences
};