# [Praxis](https://en.wikipedia.org/wiki/Praxis_(process))
Models to assist in helping neural networks improve their abilities.

## Why the name?
"Efficiency" is what is trying to be obtained, we could effectively call them "heuristic"s (probably the more technical
name), but that'd be no fun to type.  Too if we are targeting simplicity the very model, should not its name reflect that?
with Here is a list of other projects and what they call their "heuristic" models:

| Project Name | Praxis Synonym      | Url |
|--------------|---------------------|-----|
| Caffe        | Solvers             | https://github.com/BVLC/caffe/tree/master/src/caffe/solvers |
| Tensor       | Estimator/Optimizer | https://github.com/tensorflow/tensorflow/tree/master/tensorflow/python/estimator |
| torch        | Optim               | https://github.com/torch/optim |
| Synaptic     | Trainer             | https://github.com/cazala/synaptic/blob/master/src/Trainer.js |
| mlpack       | Optimizer           | https://github.com/mlpack/mlpack/tree/master/src/mlpack/core/optimizers |
| Shogun       | Optimization        | https://github.com/shogun-toolbox/shogun/tree/develop/src/shogun/optimization |
| Accord.net   | Models              | https://github.com/accord-net/framework/tree/master/Sources/Accord.Statistics/Models |
| Brain.js     | Praxis              | |

A praxis can be used on a layer as its means of learning like this:

```js
import { Pool } from 'brain.js/layer';
import { MRmsProp } from 'brain.js/praxis';

new Pool({ praxis: (layer) => new MRmsProp(layer, { /* optional settings*/ }) });
```

For layer and praxis shorthand helpers you can do:

```js
import { pool } from 'brain.js/layer';
import { mRmsProp } from 'brain.js/praxis';

pool({ praxis: mRmsProp });
```

A praxis can also be used with the `FeedForward` and planned `Recurrent` classes like this, which will cause all layers to inherit praxis:
```js
import { input, pool, relu, output } from 'brain.js/layer';
import { mRmsProp } from 'brain.js/praxis';
new FeedForward({
  praxis: mRmsProp, // defines for all layers, their praxis
  input: () => input(),
  hiddenLayers: [
    (input) => pool({ praxis: mRmsProp }, input), // overrides network praxis
    (input) => relu(input)
  ],
  output: () => output()
})
```