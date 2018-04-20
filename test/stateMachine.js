/**
 * state.js
 */

const fsm = require('../src')

exports.make = () => fsm.create({
  initial: 'init',
  states: {
    init: {
      on: {
        load: 'loading'
      }
    },
    loading: {
      on: {
        loaded: 'rendering',
        load_fail: 'loadFail',
        server_pass: 'serverPass'
      }
    },
    serverPass: {
      on: {
        reload: 'loading'
      }
    },
    rendering: {
      on: {
        rendered: 'ready'
      }
    },
    loadFail: {
      on: {
        reload: 'loading'
      }
    },
    ready: {
      on: {
        disable: 'disabled',
        reload: 'loading',
        verify: 'verifying'
      }
    },
    disabled: {
      on: {
        enable: 'ready'
      }
    },
    verifying: {
      on: {
        verify_fail: 'verifyFail',
        verify_2step: 'twoStepVerifying',
        verify_success: 'verifySuccess'
      }
    },
    verifyFail: {
      on: {
        reload: 'loading'
      }
    },
    twoStepVerifying: {
      on: {
        reload: 'loading',
        verify_fail: 'verifyFail',
        verify_success: 'verifySuccess'
      }
    },
    verifySuccess: {
      on: {
        reload: 'loading'
      }
    }
  }
})
