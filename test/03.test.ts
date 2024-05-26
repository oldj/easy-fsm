/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, describe, it } from 'vitest'
import EasyFSM from '../src'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('03', () => {
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

    let previous_state = ''
    let next_state = ''
    let code = ''
    fsm.onStateChange(async (t) => {
      await wait(1)
      previous_state = t.previous_state
      next_state = t.next_state
      code = t.payload.code
    })

    fsm.send('loaded', { payload: { code: 'loaded' } })
    // await fsm.sendAndWait('loaded')
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, '')
    assert.equal(code, '')
    await wait(2)
    assert.equal(previous_state, 'loading')
    assert.equal(code, 'loaded')

    fsm.send('open_left', { payload: { code: 'open_left' } })
    assert.equal(fsm.state, 'left_opened')
    assert.equal(previous_state, 'loading')
    assert.equal(code, 'loaded')
    await wait(2)
    assert.equal(previous_state, 'ready')
    assert.equal(code, 'open_left')

    await fsm.sendAndWait('close', { payload: { code: 'close' } })
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, 'left_opened')
    assert.equal(code, 'close')
  })
})
