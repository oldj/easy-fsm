/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, describe, it } from 'vitest'
import EasyFSM from '../src'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('basic', () => {
  it('basic', async () => {
    const configs = {
      initial: 'init',
      states: {
        init: {
          on: {
            loaded: 'ready',
          },
        },
        ready: {},
      },
    }
    let m = new EasyFSM(configs)
    // let m2: StateMachine<typeof configs> = m

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
    assert.isTrue(m.canSend('loaded'))
    // @ts-ignore
    assert.isFalse(m.canSend('not_exist'))
    assert.equal(is_leave_init, 0)
    assert.equal(is_enter_ready, 0)
    await m.sendAndWait('loaded')
    await wait(1)
    assert.equal(is_leave_init, 1)
    assert.equal(is_enter_ready, 1)
    assert.equal(m.getState(), 'ready')

    let err
    try {
      // @ts-ignore
      await m.sendAndWait('ttt')
    } catch (e: any) {
      err = e.message
    }
    assert.isTrue(/cannot_send/.test(err))
  })
})
