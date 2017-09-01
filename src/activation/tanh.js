'use strict';

export default {
  /**
   *
   * @param weight
   * @returns {number}
   */
  activate: function activate(weight) {
    return Math.tanh(weight);
  },

  /**
   * @description grad for z = tanh(x) is (1 - z^2)
   * @param weight
   * @param delta
   * @returns {number}
   */
  derivative: function derivative(weight, delta) {
    return (1 - weight * weight) * delta;
  }
};