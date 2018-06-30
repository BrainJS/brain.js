# Layer

## Basics
### Memory
A "basic layer" is composed of three types of Matrices which store what the neural network understand, its memory.
* `weights` - how a layer forward propagates, or `predicts`. Usually weights initialize as random numbers and are
* `errors` - how a network knows how far it was from an input or `target` during back propagation
* `deltas` - how a network knows to adjust its `weights` during back propagation

### Action 
A layer has three different operations for it to "learn" 
* `predict` - usually referred to by non-mortals as "forward propagation", this is where `weights` are used
* `compare` - the first of two steps in "back propagation", this compares what a network predicted to a `target` to calculate `deltas` and `errors`
* `learn` - the second step in "back propagation", this step used to update the `weights` from what was measured from `deltas` and `errors` during `compare`


### Layer Composition
A layer can be very simple, like `Random` or `Add`, but layers can also be described as "layers of layers".
Layer Example:
```js
import { FeedForward, layer } from 'brain.js';
const { input, output, add, random } = layer;

function mySuperLayer(input) {
  return add(random(), input);
}
```

Usage example:
```js
const net = new FeedForward({
  inputLayer: () => input(),
  hiddenLayers: [
    input => mySuperLayer(input)
  ],
  outputLayer: input => output(input)
});
```
In this example both `add` and `random` are composed together, ie `layer composition`.  This simple means of composing
layers and in turn networks works with both simple (feedforward) or complex (lstm) networks.

