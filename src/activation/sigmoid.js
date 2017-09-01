'use strict';

export default {
  /**
   *
   * @param value
   * @returns {number}
   */
  activate: function activate(value) {
    return 1 / (1 + Math.exp(-value));
  },

  /**
   *
   * @param weight
   * @param delta
   * @returns {number}
   */
  derivative: function derivative(weight, delta) {
    return weight * (1 - weight) * delta;
  }
};