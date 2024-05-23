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

    assert.equal(m.state, 'init')
    await m.sendAndWait('load')
    assert.equal(m.state, 'loading')
    assert.equal(m.previous_state, 'init')
    await m.sendAndWait('loaded')
    assert.equal(m.state, 'rendering')
    assert.isTrue(m.canSend('rendered'))

    assert.isFalse(m.canSend('load_fail'))
    try {
      await m.sendAndWait('load_fail')
    } catch (e: any) {
      // console.log(e)
      err = e.message
    }
    // console.log(111111111, err)
    assert.isTrue(/cannot_send/.test(err))

    await m.sendAndWait('rendered')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('disable')
    assert.equal(m.state, 'disabled')
    await m.sendAndWait('enable')
    assert.equal(m.state, 'ready')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('load_fail')
    assert.equal(m.state, 'loadFail')
    assert.equal(m.previous_state, 'loading')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('loaded')
    assert.isFalse(m.canSend('verify'))
    assert.equal(m.state, 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.state, 'verifying')
    await m.sendAndWait('verify_fail')
    assert.equal(m.state, 'verifyFail')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.state, 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.state, 'verifying')
    await m.sendAndWait('verify_success')
    assert.equal(m.state, 'verifySuccess')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.state, 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.state, 'verifying')
    await m.sendAndWait('verify_2step')
    assert.equal(m.state, 'twoStepVerifying')
    await m.sendAndWait('verify_fail')
    assert.equal(m.state, 'verifyFail')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('loaded')
    assert.equal(m.state, 'rendering')
    await m.sendAndWait('rendered')
    assert.equal(m.state, 'ready')
    await m.sendAndWait('verify')
    assert.equal(m.state, 'verifying')
    await m.sendAndWait('verify_2step')
    assert.equal(m.state, 'twoStepVerifying')
    await m.sendAndWait('verify_success')
    assert.equal(m.state, 'verifySuccess')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
    await m.sendAndWait('server_pass')
    assert.equal(m.state, 'serverPass')

    await m.sendAndWait('reload')
    assert.equal(m.state, 'loading')
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

    let tmp: any = 0
    // m.onEnter('hidden', (v) => {
    //   assert.equal(v, 123)
    // })
    m.onEnter('disabled', (a) => {
      assert.equal(tmp, 0)
      tmp = a
      // assert.equal(b, 'abc')
      assert.equal(a.code, '456')
    })

    await m.sendAndWait('load')
    await wait(1)
    assert.equal(m.state, 'ready')
    assert.isTrue(m.canSend('disable'))
    assert.isFalse(m.canSend('enable'))

    await m.sendAndWait('disable', { payload: { code: '456' } })
    assert.equal(tmp.code, '456')
  })
})
