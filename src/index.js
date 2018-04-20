/**
 * index.js
 */

const Machine = require('./Machine')

module.exports = {
  create: (options) => new Machine(options)
}
