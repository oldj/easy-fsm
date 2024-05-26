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
    fsm.onStateChange(async (d) => {
      await wait(1)
      previous_state = d.previous_state
      next_state = d.next_state
    })

    fsm.send('loaded')
    // await fsm.sendAndWait('loaded')
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, '')
    await wait(2)
    assert.equal(previous_state, 'loading')

    fsm.send('open_left')
    assert.equal(fsm.state, 'left_opened')
    assert.equal(previous_state, 'loading')
    await wait(2)
    assert.equal(previous_state, 'ready')

    await fsm.sendAndWait('close')
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, 'left_opened')
  })
})
