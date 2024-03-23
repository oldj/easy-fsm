/**
 * index.test.ts
 */

import { assert, describe, it } from 'vitest'
import { make } from './stateMachine'

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

describe('stateMachine', () => {
  it('state events', async () => {
    let m = make()
    let err

    assert.equal(m.getState(), 'init')
    await m.sendAndWait('load')
    assert.equal(m.getState(), 'loading')
    assert.equal(m.getPreviousState(), 'init')
    await m.sendAndWait('loaded')
    assert.equal(m.getState(), 'rendering')
    assert.isTrue(m.canSend('rendered'))

    assert.isFalse(m.canSend('load_fail'))
    try {
      await m.sendAndWait('load_fail')
    } catch (e: any) {
      err = e.message
    }
    assert.isTrue(/cannot_send/.test(err))

    await m.sendAndWait('rendered')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('disable')
    assert.equal(m.getState(), 'disabled')
    await m.sendAndWait('enable')
    assert.equal(m.getState(), 'ready')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('load_fail')
    assert.equal(m.getState(), 'loadFail')
    assert.equal(m.getPreviousState(), 'loading')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('loaded')
    assert.isFalse(m.canSend('verify'))
    assert.equal(m.getState(), 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.getState(), 'verifying')
    await m.sendAndWait('verify_fail')
    assert.equal(m.getState(), 'verifyFail')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.getState(), 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.getState(), 'verifying')
    await m.sendAndWait('verify_success')
    assert.equal(m.getState(), 'verifySuccess')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.getState(), 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.getState(), 'verifying')
    await m.sendAndWait('verify_2step')
    assert.equal(m.getState(), 'twoStepVerifying')
    await m.sendAndWait('verify_fail')
    assert.equal(m.getState(), 'verifyFail')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.getState(), 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.getState(), 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.getState(), 'verifying')
    await m.sendAndWait('verify_2step')
    assert.equal(m.getState(), 'twoStepVerifying')
    await m.sendAndWait('verify_success')
    assert.equal(m.getState(), 'verifySuccess')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
    await m.sendAndWait('server_pass')
    assert.equal(m.getState(), 'serverPass')

    await m.sendAndWait('reload')
    assert.equal(m.getState(), 'loading')
  })

  it('state with actions', async () => {
    let m = make()

    m.onEnter('loading', async () => {
      await wait(1)
      await m.sendAndWait('loaded')
    })

    m.onEnter('rendering', async () => {
      await wait(1)
      await m.sendAndWait('rendered')
    })

    let tmp = 0
    // m.onEnter('hidden', (v) => {
    //   assert.equal(v, 123)
    // })
    m.onEnter('disabled', (a, b) => {
      tmp = a
      assert.equal(b, 'abc')
    })

    await m.sendAndWait('load')
    await wait(1)
    assert.equal(m.getState(), 'ready')
    assert.isTrue(m.canSend('disable'))
    assert.isFalse(m.canSend('enable'))

    await m.sendAndWait('disable', { payload: 456 })
    assert.equal(tmp, 456)
  })
})
