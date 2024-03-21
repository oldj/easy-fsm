/**
 * Machine.ts
 */

import { ActionFunc, IMachineConfigs, IMachineState, StateAction } from './types'

export default class Machine<TConfigs extends IMachineConfigs> {
  private readonly configs: IMachineConfigs
  private readonly states: Record<string, IMachineState>
  private state: string
  private previous_state: string | null = null
  private next_state: string | null = null
  private listeners_for_state_change: Record<string, ActionFunc[]> = {}

  constructor(configs: TConfigs) {
    this.configs = configs
    this.state = configs.initial
    this.states = configs.states
  }

  async fire(event: string, ...args: any[]) {
    if (!this.canFire(event)) {
      throw new Error(`bad event: ${event.toString()}`)
    }

    const next_state = this.states[this.state].on?.[event as string]
    // if (!to_state) {
    //   throw new Error(`bad event: ${event}`)
    // }

    if (!next_state || !this.states[next_state]) {
      throw new Error(`bad state: ${next_state}`)
    }

    const state_leave = `${this.state}_leave`
    const state_enter = `${next_state}_enter`

    let fns_leave = this.listeners_for_state_change[state_leave] || []
    let fns_enter = this.listeners_for_state_change[state_enter] || []

    this.next_state = next_state
    for (let fn of fns_leave) {
      try {
        await fn(...args)
      } catch (e) {
        console.error(e)
      }
    }

    this.previous_state = this.state
    this.state = next_state
    this.next_state = null
    for (let fn of fns_enter) {
      try {
        await fn(...args)
      } catch (e) {
        console.error(e)
      }
    }
  }

  canFire(event: string) {
    return !!this.states[this.state].on?.[event as string]
  }

  getState() {
    return this.state
  }

  getPreviousState() {
    return this.previous_state
  }

  getNextState() {
    return this.next_state
  }

  onStateChange(state: string, action: StateAction, callback: ActionFunc) {
    // do nothing
    let key = `${state.toString()}_${action}`
    let fns = this.listeners_for_state_change[key] || []
    fns.push(callback)
    this.listeners_for_state_change[key] = fns
  }

  offStateChange(state: string, action: StateAction, callback: ActionFunc) {
    let key = `${state.toString()}_${action}`
    let fns = this.listeners_for_state_change[key] || []
    fns = fns.filter((fn) => fn !== callback)
    this.listeners_for_state_change[key] = fns
  }

  onEnter(state: string, callback: ActionFunc) {
    this.onStateChange(state, 'enter', callback)
  }

  onLeave(state: string, callback: ActionFunc) {
    this.onStateChange(state, 'leave', callback)
  }
}
