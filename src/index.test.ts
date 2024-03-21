/**
 * index.test.ts
 */

import { assert, test } from 'vitest'
import fsm from './index'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms * 1000))

test('basic', async (t) => {
  let m = fsm.create({
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
