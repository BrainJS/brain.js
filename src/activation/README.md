# [Activation](https://en.wikipedia.org/wiki/Activation_function)
## What is activation?
Activation can be thought of as a sort of one way compressor for numerical values.

Activation is useful for:
* representing a wide array of numbers in a very small number
* throwing away values the network does not care about
* focusing on values the network does care about

For every activation, there is usually a widely accepted means of measuring it, this term
the activation's derivative function.  For simplicity, it is referred to as our "measure"
function.


## Programming structure
### Each activation has at least the following two exported functions 
* `activate` - the activation type's mathematical function
  * The term `activate` specifically correlates to the activation function type
* `measure` - the derivative to measure the activation

For programmatic, simplicity, and practicality, we namespace the structure as:
```
relu (activation type)
 |-activate
 |-meassure
```
