/**
 * nameup.spec.js
 */

const {test} = require('ava')
const nameup = require('./nameup')

test('basic', t => {
  t.is(nameup('on_leave_init'), 'onLeaveInit')
  t.is(nameup('on_LeaveInit'), 'onLeaveInit')
})
