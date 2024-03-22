/**
 * Machine.ts
 */

export type StateAction = 'enter' | 'leave'
export type ActionFunc = (...args: any[]) => void | Promise<void>

export interface IMachineState {
  on?: Record<string /* event */, string /* to state */>
}

export interface IMachineConfigs {
  initial: string // initial state
  states: {
    [key: string /* state */]: IMachineState
  }
}

type RecordKeys<T extends Record<string, any>> = keyof T

type UnionKeys<T> = T extends Record<string, string> ? RecordKeys<T> : never

type On<T> = UnionKeys<T extends { on: any } ? T['on'] : never>

export default class Machine<TConfigs extends IMachineConfigs> {
  private readonly configs: TConfigs
  private readonly states: TConfigs['states']
  private state: keyof TConfigs['states']
  private previous_state: keyof TConfigs['states'] | null = null
  private next_state: keyof TConfigs['states'] | null = null
  private listeners_for_state_change: Record<string, ActionFunc[]> = {}

  constructor(configs: TConfigs) {
    this.configs = configs
    this.state = configs.initial
    this.states = configs.states
  }

  async fire(event: On<TConfigs['states'][keyof TConfigs['states']]>, ...args: any[]) {
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

    const state_leave = `${this.state.toString()}_leave`
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

  canFire(event: On<TConfigs['states'][keyof TConfigs['states']]>) {
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

  private onStateChange(
    state: keyof TConfigs['states'],
    action: StateAction,
    callback: ActionFunc,
  ) {
    if (!this.states.hasOwnProperty(state)) {
      throw new Error(`invalid state: ${state.toString()}`)
    }

    let key = `${state.toString()}_${action}`
    let fns = this.listeners_for_state_change[key] || []
    fns.push(callback)
    this.listeners_for_state_change[key] = fns
  }

  private offStateChange(
    state: keyof TConfigs['states'],
    action: StateAction,
    callback: ActionFunc,
  ) {
    let key = `${state.toString()}_${action}`
    let fns = this.listeners_for_state_change[key] || []
    fns = fns.filter((fn) => fn !== callback)
    this.listeners_for_state_change[key] = fns
  }

  onEnter(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.onStateChange(state, 'enter', callback)
  }

  onLeave(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.onStateChange(state, 'leave', callback)
  }

  offEnter(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.offStateChange(state, 'enter', callback)
  }

  offLeave(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.offStateChange(state, 'leave', callback)
  }

  offAll() {
    this.listeners_for_state_change = {}
  }
}
