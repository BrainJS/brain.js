/* Functions for turning sparse hashes into arrays and vice versa */
export default class lookup {
  /**
   * Performs `[{a: 1}, {b: 6, c: 7}] -> {a: 0, b: 1, c: 2}`
   * @param {Object} hashes
   * @returns {Object}
   */
  static buildLookup(hashes) {
    const reducedHash = hashes.reduce(
      (memo, hash) => Object.assign(memo, hash),
      {}
    )

    return lookup.lookupFromHash(reducedHash)
  }

  /**
   * performs `{a: 6, b: 7} -> {a: 0, b: 1}`
   * @param {Object} hash
   * @returns {Object}
   */
  static lookupFromHash(hash) {
    const lookupHash = {}
    let index = 0

    Object.keys(hash).forEach(i => {
      index += 1
      lookupHash[i] = index
    })

    return lookupHash
  }

  /**
   * performs `{a: 0, b: 1}, {a: 6} -> [6, 0]`
   * @param {*} lookup
   * @param {*} hash
   * @returns {Array}
   */
  static toArray(lookupHash, hash) {
    const array = []

    Object.keys(lookupHash).forEach(i => {
      array[lookupHash[i]] = hash[i] || 0
    })

    return array
  }

  /**
   * performs `{a: 0, b: 1}, [6, 7] -> {a: 6, b: 7}`
   * @param {Object} lookupHash
   * @param {Array} array
   * @returns {Object}
   */
  static toHash(lookupHash, array) {
    const hash = {}

    Object.keys(lookupHash).forEach(i => {
      hash[i] = array[lookupHash[i]]
    })

    return hash
  }

  /**
   *
   * @param {Array} array
   * @returns {*}
   */
  static lookupFromArray(array) {
    const lookupHash = {}
    let z = 0
    let i = array.length

    while (i-- > 0) {
      lookupHash[array[i]] = z++
    }

    return lookupHash
  }
}
