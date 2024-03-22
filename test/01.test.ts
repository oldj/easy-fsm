/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, test, describe, it } from 'vitest'
import EasyFSM from '../src'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('01', () => {
  it('basic', async () => {
    let fsm = new EasyFSM({
      initial: 'loading',
      states: {
        loading: {
          on: {
            loaded: 'ready',
          },
        },
        ready: {
          on: {
            open_left: 'left_opened',
            open_right: 'right_opened',
          },
        },
        left_opened: {
          on: {
            close: 'ready',
          },
        },
        right_opened: {
          on: {
            close: 'ready',
          },
        },
      },
    })

    assert.equal(fsm.getState(), 'loading')
    await fsm.fire('loaded')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canFire('open_left'))
    assert.isTrue(fsm.canFire('open_right'))
    assert.isFalse(fsm.canFire('loaded'))

    await fsm.fire('open_left')
    assert.equal(fsm.getState(), 'left_opened')
    assert.isTrue(fsm.canFire('close'))
    assert.isFalse(fsm.canFire('open_left'))
    assert.isFalse(fsm.canFire('open_right'))

    await fsm.fire('close')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canFire('open_left'))
    assert.isTrue(fsm.canFire('open_right'))
    assert.isFalse(fsm.canFire('close'))

    await fsm.fire('open_right')
    assert.equal(fsm.getState(), 'right_opened')
    assert.isTrue(fsm.canFire('close'))
    assert.isFalse(fsm.canFire('open_left'))
    assert.isFalse(fsm.canFire('open_right'))

    await fsm.fire('close')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canFire('open_left'))
    assert.isTrue(fsm.canFire('open_right'))
    assert.isFalse(fsm.canFire('close'))
  })
})
