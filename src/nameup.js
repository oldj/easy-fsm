/**
 * nameup.js
 */

// convert `on_enter_ready` to `onEnterReady`
module.exports = name => name.replace(/_([a-zA-Z])/g, (m, p1) => p1.toUpperCase())
