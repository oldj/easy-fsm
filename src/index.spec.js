/**
 * index.spec.js.js
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

