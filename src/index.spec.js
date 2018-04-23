/**
 * index.spec.js
 */


const {test} = require('ava')
const fsm = require('./index')
const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000))

test('basic', async t => {
  let m = fsm.create({
    initial: 'init',
    states: {
      init: {
        on: {
          loaded: 'ready'
        }
      },
      ready: {}
    }
  })

  let is_leave_init = 0
  let is_enter_ready = 0
  m.onLeaveInit = () => {
    wait(1)
    is_leave_init = 1
  }
  m.onEnterReady = () => is_enter_ready = 1

  t.is(m.getState(), 'init')
  t.true(m.canFire('loaded'))
  t.false(m.canFire('not_exist'))
  t.is(is_leave_init, 0)
  t.is(is_enter_ready, 0)
  await m.fire('loaded')
  t.is(is_leave_init, 1)
  t.is(is_enter_ready, 1)
  t.is(m.getState(), 'ready')

  let err
  try {
    await m.fire('ttt')
  } catch (e) {
    err = e.message
  }
  t.true(/bad event/.test(err))
})

test.only('switch', async t => {
  let machine = fsm.create({
    initial: 'off',
    states: {
      off: {
        on: {
          turn_on: 'on'
        }
      },
      on: {
        on: {
          turn_off: 'off'
        }
      }
    }
  })

  machine.onEnterOff = () => console.log('enter state: off')
  machine.onOff = () => console.log('on state: off')
  machine.onLeaveOff = () => console.log('leave state: off')
  machine.onEnterOn = () => console.log('enter state: on')
  machine.onOn = () => console.log('on state: on')
  machine.onLeaveOn = () => console.log('leave state: on')

  t.is(machine.getState(), 'off')
  await machine.fire('turn_on')
  t.is(machine.getState(), 'on')
  await machine.fire('turn_off')
  t.is(machine.getState(), 'off')
})
