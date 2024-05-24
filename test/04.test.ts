/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { expect, test } from 'vitest'
import EasyFSM from '../src'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

test('ignore_can_not_send_error', async () => {
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

  fsm.send('loaded')
  expect(fsm.state).toBe('ready')

  expect(fsm.canSend('close')).toBeFalsy()
  let err = false
  let msg = ''
  try {
    fsm.send('close')
  } catch (e: any) {
    // console.log(e)
    msg = e.message
    err = true
  }
  expect(err).toBeTruthy()
  expect(msg.includes('cannot_send')).toBeTruthy()

  // -----

  let fsm2 = new EasyFSM({
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
    ignore_can_not_send_error: true,
  })

  fsm2.send('loaded')
  expect(fsm2.state).toBe('ready')

  expect(fsm2.canSend('close')).toBeFalsy()
  let err2 = false
  let msg2 = ''
  try {
    fsm2.send('close')
  } catch (e: any) {
    // console.log(e)
    msg2 = e.message
    err2 = true
  }
  expect(err2).toBeFalsy()
  expect(msg2).toBe('')

  let states = fsm2.getAllStates()
  let events = fsm2.getAllEvents()
  expect(states).toEqual(['loading', 'ready', 'left_opened', 'right_opened'])
  expect(events).toEqual(['loaded', 'open_left', 'open_right', 'close'])
})
