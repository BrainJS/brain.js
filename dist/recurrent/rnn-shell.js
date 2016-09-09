/*function run() {
  bindEquations: function() {
    var model = this.model;
    var hiddenSizes = this.hiddenSizes;
    var hiddenLayers = model.hiddenLayers;

    var equation = new Equation();
    model.equations.push(equation);
    // 0 index
    var output = this.getEquation(equation, equation.inputMatrixToRow(this.model.input), hiddenSizes[0], hiddenLayers[0]);
    equation.addPreviousResult(output);
    // 1+ indexes
    for (var i = 1, max = hiddenSizes.length; i < max; i++) {
      output = this.getEquation(equation, output, hiddenSizes[i], hiddenLayers[i]);
      equation.addPreviousResult(output);
    }
    equation.add(equation.multiply(model.outputConnector, output), model.output);
  },

  run: function(input) {
    this.runs++;
    input = input || this.model.input;
    var equations = this.model.equations;
    var max = input.length;
    var log2ppl = 0;
    var cost = 0;

    for (var equationIndex = 0, equationMax = equations.length; equationIndex < equationMax; equationIndex++) {
      equations[equationIndex].resetPreviousResults();
    }

    while (equations.length <= max) {
      this.bindEquations();
    }

    for (var i = -1; i < max; i++) {
      // start and end tokens are zeros
      var equation = equations[i + 1];
      var ixSource = (i === -1 ? 0 : input[i]); // first step: start with START token
      var ixTarget = (i === max - 1 ? 0 : input[i + 1]); // last step: end with END token
      var output = equation.run(ixSource);
      if (equations[i + 2]) {
        equation.copyPreviousResultsTo(equations[i + 2]);
      }

      // set gradients into log probabilities
      this.logProbabilities = output; // interpret output as log probabilities
      var probabilities = softmax(output); // compute the softmax probabilities

      log2ppl += -Math.log2(probabilities.weights[ixTarget]); // accumulate base 2 log prob and do smoothing
      cost += -Math.log(probabilities.weights[ixTarget]);

      // write gradients into log probabilities
      this.logProbabilities.recurrence = probabilities.weights.slice(0);
      this.logProbabilities.recurrence[ixTarget] -= 1
    }

    while (i > -1) {
      equations[i--].runBackpropagate();
    }

    this.step();

    this.totalPerplexity = Math.pow(2, log2ppl / (max - 1));
    this.totalCost = cost;
    return output;
  }
}*/
"use strict";
//# sourceMappingURL=rnn-shell.js.map