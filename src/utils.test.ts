/**
 * utils.test.ts
 */

import { expect, test } from 'vitest'
import { nameUp } from './utils'

test('basic', (t) => {
  expect(nameUp('on_leave_init')).toBe('onLeaveInit')
  expect(nameUp('on_LeaveInit')).toBe('onLeaveInit')
})
