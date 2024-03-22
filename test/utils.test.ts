/**
 * utils.test.ts
 */

import { describe, expect, it } from 'vitest'
import { nameUp } from '../src/utils'

describe('utils', () => {
  it('basic', (t) => {
    expect(nameUp('on_leave_init')).toBe('onLeaveInit')
    expect(nameUp('on_LeaveInit')).toBe('onLeaveInit')
  })
})
