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
    let new_state = ''
    fsm.onStateChange((d) => {
      previous_state = d.previous_state
      new_state = d.new_state
    })

    assert.equal(fsm.state, 'loading')
    assert.equal(previous_state, '')
    assert.equal(new_state, '')

    await fsm.sendAndWait('loaded')
    assert.equal(fsm.state, 'ready')
    assert.equal(previous_state, 'loading')
    assert.equal(new_state, 'ready')

    await fsm.sendAndWait('open_left')
    assert.equal(fsm.state, 'left_opened')
    assert.equal(previous_state, 'ready')
    assert.equal(new_state, 'left_opened')
  })
})
