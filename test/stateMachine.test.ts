/**
 * index.test.ts
 */

import { assert, test } from 'vitest'
import EasyFSM from '../src'
import { make } from './stateMachine'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * 1000))

test('basic', async (t) => {
  let m = new EasyFSM({
    initial: 'init',
    states: {
      init: {
        on: {
          loaded: 'ready',
        },
      },
      ready: {},
    },
  })

  let is_leave_init = 0
  let is_enter_ready = 0

  m.onLeave('init', async () => {
    await wait(1)
    is_leave_init = 1
  })
  m.onEnter('ready', async () => {
    is_enter_ready = 1
  })

  assert.equal(m.getState(), 'init')
  assert.isTrue(m.canFire('loaded'))
  assert.isFalse(m.canFire('not_exist'))
  assert.equal(is_leave_init, 0)
  assert.equal(is_enter_ready, 0)
  await m.fire('loaded')
  await wait(1)
  assert.equal(is_leave_init, 1)
  assert.equal(is_enter_ready, 1)
  assert.equal(m.getState(), 'ready')

  let err
  try {
    await m.fire('ttt')
  } catch (e: any) {
    err = e.message
  }
  assert.isTrue(/bad event/.test(err))
})

test('state events', async (t) => {
  let m = make()
  let err

  assert.equal(m.getState(), 'init')
  await m.fire('load')
  assert.equal(m.getState(), 'loading')
  assert.equal(m.getPreviousState(), 'init')
  await m.fire('loaded')
  assert.equal(m.getState(), 'rendering')
  assert.isTrue(m.canFire('rendered'))

  assert.isFalse(m.canFire('load_fail'))
  try {
    await m.fire('load_fail')
  } catch (e: any) {
    err = e.message
  }
  assert.isTrue(/bad event/.test(err))

  await m.fire('rendered')
  assert.equal(m.getState(), 'ready')
  await m.fire('disable')
  assert.equal(m.getState(), 'disabled')
  await m.fire('enable')
  assert.equal(m.getState(), 'ready')
  assert.equal(m.getState(), 'ready')
  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('load_fail')
  assert.equal(m.getState(), 'loadFail')
  assert.equal(m.getPreviousState(), 'loading')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('loaded')
  assert.isFalse(m.canFire('verify'))
  assert.equal(m.getState(), 'rendering')
  await m.fire('rendered')
  assert.equal(m.getState(), 'ready')
  await m.fire('verify')
  assert.equal(m.getState(), 'verifying')
  await m.fire('verify_fail')
  assert.equal(m.getState(), 'verifyFail')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('loaded')
  assert.equal(m.getState(), 'rendering')
  await m.fire('rendered')
  assert.equal(m.getState(), 'ready')
  await m.fire('verify')
  assert.equal(m.getState(), 'verifying')
  await m.fire('verify_success')
  assert.equal(m.getState(), 'verifySuccess')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('loaded')
  assert.equal(m.getState(), 'rendering')
  await m.fire('rendered')
  assert.equal(m.getState(), 'ready')
  await m.fire('verify')
  assert.equal(m.getState(), 'verifying')
  await m.fire('verify_2step')
  assert.equal(m.getState(), 'twoStepVerifying')
  await m.fire('verify_fail')
  assert.equal(m.getState(), 'verifyFail')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('loaded')
  assert.equal(m.getState(), 'rendering')
  await m.fire('rendered')
  assert.equal(m.getState(), 'ready')
  await m.fire('verify')
  assert.equal(m.getState(), 'verifying')
  await m.fire('verify_2step')
  assert.equal(m.getState(), 'twoStepVerifying')
  await m.fire('verify_success')
  assert.equal(m.getState(), 'verifySuccess')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
  await m.fire('server_pass')
  assert.equal(m.getState(), 'serverPass')

  await m.fire('reload')
  assert.equal(m.getState(), 'loading')
})

test('state with actions', async (t) => {
  let m = make()

  m.onEnter('loading', async () => {
    await wait(1)
    await m.fire('loaded')
  })

  m.onEnter('rendering', async () => {
    await wait(1)
    await m.fire('rendered')
  })

  let tmp = 0
  // m.onEnter('hidden', (v) => {
  //   assert.equal(v, 123)
  // })
  m.onEnter('disabled', (a, b) => {
    tmp = a
    assert.equal(b, 'abc')
  })

  await m.fire('load')
  await wait(1)
  assert.equal(m.getState(), 'ready')
  assert.isTrue(m.canFire('disable'))
  assert.isFalse(m.canFire('enable'))

  await m.fire('disable', 456, 'abc')
  assert.equal(tmp, 456)
})
