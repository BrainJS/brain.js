'use strict';

export default {
  /**
   * Relu Activation, aka Rectified Linear Unit Activation
   * @description https://en.wikipedia.org/wiki/Rectifier_(neural_networks)
   * @param weight
   * @returns {number}
   */
  activate: function activate(weight) {
    return Math.max(0, weight);
  },

  /**
   * Leaky Relu derivative
   * @param weight
   * @param delta
   * @returns {number}
   */
  derivative: function derivative(weight, delta) {
    return weight > 0 ? delta : 0;
  }
};