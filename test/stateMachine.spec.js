/**
 * index.spec.js.js
 */


const {test} = require('ava')
const m_state = require('./stateMachine')
const wait = seconds => new Promise(resolve => setTimeout(resolve, seconds * 1000))

test('state events', async t => {
  let m = m_state.make()
  let err

  t.is(m.getState(), 'init')
  await m.fire('load')
  t.is(m.getState(), 'loading')
  t.is(m.getLastState(), 'init')
  await m.fire('loaded')
  t.is(m.getState(), 'rendering')
  t.true(m.canFire('rendered'))

  t.false(m.canFire('load_fail'))
  try {
    await m.fire('load_fail')
  } catch (e) {
    err = e.message
  }
  t.true(/bad event/.test(err))

  await m.fire('rendered')
  t.is(m.getState(), 'ready')
  await m.fire('disable')
  t.is(m.getState(), 'disabled')
  await m.fire('enable')
  t.is(m.getState(), 'ready')
  t.is(m.getState(), 'ready')
  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('load_fail')
  t.is(m.getState(), 'loadFail')
  t.is(m.getLastState(), 'loading')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('loaded')
  t.false(m.canFire('verify'))
  t.is(m.getState(), 'rendering')
  await m.fire('rendered')
  t.is(m.getState(), 'ready')
  await m.fire('verify')
  t.is(m.getState(), 'verifying')
  await m.fire('verify_fail')
  t.is(m.getState(), 'verifyFail')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('loaded')
  t.is(m.getState(), 'rendering')
  await m.fire('rendered')
  t.is(m.getState(), 'ready')
  await m.fire('verify')
  t.is(m.getState(), 'verifying')
  await m.fire('verify_success')
  t.is(m.getState(), 'verifySuccess')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('loaded')
  t.is(m.getState(), 'rendering')
  await m.fire('rendered')
  t.is(m.getState(), 'ready')
  await m.fire('verify')
  t.is(m.getState(), 'verifying')
  await m.fire('verify_2step')
  t.is(m.getState(), 'twoStepVerifying')
  await m.fire('verify_fail')
  t.is(m.getState(), 'verifyFail')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('loaded')
  t.is(m.getState(), 'rendering')
  await m.fire('rendered')
  t.is(m.getState(), 'ready')
  await m.fire('verify')
  t.is(m.getState(), 'verifying')
  await m.fire('verify_2step')
  t.is(m.getState(), 'twoStepVerifying')
  await m.fire('verify_success')
  t.is(m.getState(), 'verifySuccess')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
  await m.fire('server_pass')
  t.is(m.getState(), 'serverPass')

  await m.fire('reload')
  t.is(m.getState(), 'loading')
})

test('state with actions', async t => {
  let m = m_state.make()

  m.onLoading = async () => {
    await wait(1)
    await m.fire('loaded')
  }

  m.onRendering = async () => {
    await wait(1)
    await m.fire('rendered')
  }

  let tmp = 0
  m.onHidden = v => t.is(v, 123)
  m.onDisabled = (a, b) => {
    tmp = a
    t.is(b, 'abc')
  }

  await m.fire('load')
  await wait(1)
  t.is(m.getState(), 'ready')
  t.true(m.canFire('disable'))
  t.false(m.canFire('enable'))

  await m.fire('disable', 456, 'abc')
  t.is(tmp, 456)
})
