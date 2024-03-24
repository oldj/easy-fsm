/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { assert, describe, it } from 'vitest'
import EasyFSM from '../src'

describe('events test', () => {
  it('on & off', async () => {
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

    let flag = ''

    const fn1 = () => {
      flag = 'left_opened'
    }
    fsm.onEnter('left_opened', fn1)

    const fn2 = () => {
      flag = 'right_opened'
    }
    fsm.onEnter('right_opened', fn2)

    assert.equal(fsm.state, 'loading')
    await fsm.sendAndWait('loaded')
    assert.equal(flag, '')
    await fsm.sendAndWait('open_left')
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('close')
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('open_right')
    assert.equal(flag, 'right_opened')
    await fsm.sendAndWait('close')
    assert.equal(flag, 'right_opened')
    await fsm.sendAndWait('open_left')
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('close')

    fsm.offEnter('right_opened', fn2)
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('open_right')
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('close')

    flag = '111'
    fsm.offEnter('left_opened', fn1)
    assert.equal(flag, '111')
    await fsm.sendAndWait('open_left')
    assert.equal(flag, '111')
    await fsm.sendAndWait('close')

    // rebinding
    fsm.onEnter('left_opened', fn1)
    fsm.onEnter('right_opened', fn2)

    flag = '222'
    await fsm.sendAndWait('open_left')
    assert.equal(flag, 'left_opened')
    await fsm.sendAndWait('close')
    await fsm.sendAndWait('open_right')
    assert.equal(flag, 'right_opened')
    await fsm.sendAndWait('close')

    // off all
    fsm.offAll()

    flag = '333'
    await fsm.sendAndWait('open_left')
    assert.equal(flag, '333')
    await fsm.sendAndWait('close')
    await fsm.sendAndWait('open_right')
    assert.equal(flag, '333')
    await fsm.sendAndWait('close')
  })

  it('enter & leave', async () => {
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

    let flag_enter = ''
    let flag_leave = ''

    fsm.onEnter('ready', () => {
      flag_enter = ''
    })
    fsm.onEnter('left_opened', (...args) => {
      flag_enter = args[0]
    })
    fsm.onLeave('left_opened', (...args) => {
      flag_leave = args[0]
    })

    fsm.onEnter('right_opened', () => {
      flag_enter = fsm.previous_state || '11'
    })
    fsm.onLeave('right_opened', () => {
      flag_leave = fsm.state
    })

    assert.equal(fsm.state, 'loading')
    await fsm.sendAndWait('loaded')
    assert.equal(flag_enter, '')
    await fsm.sendAndWait('open_left', { payload: 'aaa' })
    assert.equal(flag_enter, 'aaa')
    assert.equal(flag_leave, '')

    await fsm.sendAndWait('close')
    assert.equal(flag_enter, '')
    assert.equal(flag_leave, undefined)

    await fsm.sendAndWait('open_right', { payload: 'xxx' })
    assert.equal(flag_enter, 'ready')

    await fsm.sendAndWait('close')
    assert.equal(flag_leave, 'right_opened')

    flag_enter = ''
    flag_leave = ''
    // 清除所有事件
    fsm.offAll()
    await fsm.sendAndWait('open_left', { payload: 'aaa' })
    assert.equal(flag_enter, '')
    assert.equal(flag_leave, '')
    await fsm.sendAndWait('close')
    await fsm.sendAndWait('open_right', { payload: 'aaa' })
    assert.equal(flag_enter, '')
    assert.equal(flag_leave, '')
  })
})
