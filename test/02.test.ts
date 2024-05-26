/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, describe, it } from 'vitest'
import EasyFSM from '../src'

describe('02', () => {
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
    fsm.onStateChange((t) => {
      previous_state = t.previous_state
      next_state = t.next_state
    })

    assert.equal(fsm.state, 'loading')
    assert.equal(previous_state, '')
    assert.equal(next_state, '')

    await fsm.sendAndWait('loaded')
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, 'loading')
    assert.equal(next_state, 'ready')

    await fsm.sendAndWait('open_left')
    assert.equal(fsm.state, 'left_opened')
    assert.equal(previous_state, 'ready')
    assert.equal(next_state, 'left_opened')
  })
})
