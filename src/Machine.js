/**
 * Machine.js
 */

const nameup = require('./nameup')

function Machine (options) {
  this._options = options
  this._state = options.initial
  this._states = this._options.states
}

Machine.prototype = {
  fire: function (event, ...args) {
    let current_state = this._state
    let states = this._states
    let to_state = ((states[current_state] || {}).on || {})[event]
    if (!to_state || typeof to_state !== 'string') {
      throw new Error(`bad event [${event}] on state [${current_state}]`)
    }

    if (!states[to_state]) {
      throw new Error(`can't transfer to state [${to_state}]`)
    }

    const onFunc = (name, ...args2) => {
      let fn = this[nameup(name)]
      if (typeof fn === 'function') {
        return fn.call(this, ...args2)
      }
    }

    // transfer to `to_state`
    return Promise.resolve()
      .then(() => onFunc('on_leave_' + current_state))
      .then(() => onFunc('on_enter_' + to_state))
      .then(() => {
        this._last_state = this._state
        this._state = to_state
      })
      .then(() => onFunc('on_' + to_state, ...args))
  },

  canFire: function (event) {
    return !!((this._states[this._state] || {}).on || {})[event]
  },

  getState: function () {
    return this._state
  },

  getLastState: function () {
    return this._last_state
  }
}

module.exports = Machine
