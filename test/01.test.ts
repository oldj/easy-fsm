/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, describe, it } from 'vitest'
import EasyFSM from '../src'

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
    await fsm.sendAndWait('loaded')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canSend('open_left'))
    assert.isTrue(fsm.canSend('open_right'))
    assert.isFalse(fsm.canSend('loaded'))

    await fsm.sendAndWait('open_left')
    assert.equal(fsm.getState(), 'left_opened')
    assert.isTrue(fsm.canSend('close'))
    assert.isFalse(fsm.canSend('open_left'))
    assert.isFalse(fsm.canSend('open_right'))

    await fsm.sendAndWait('close')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canSend('open_left'))
    assert.isTrue(fsm.canSend('open_right'))
    assert.isFalse(fsm.canSend('close'))

    fsm.send('open_right')
    assert.equal(fsm.getState(), 'right_opened')
    assert.isTrue(fsm.canSend('close'))
    assert.isFalse(fsm.canSend('open_left'))
    assert.isFalse(fsm.canSend('open_right'))

    fsm.send('close')
    assert.equal(fsm.getState(), 'ready')
    assert.isTrue(fsm.canSend('open_left'))
    assert.isTrue(fsm.canSend('open_right'))
    assert.isFalse(fsm.canSend('close'))
  })
})
