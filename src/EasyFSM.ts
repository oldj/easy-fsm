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
  ignore_can_not_send_error?: boolean
}

export interface ISendEventOptions {
  payload?: any
}

type RecordKeys<T extends Record<string, any>> = keyof T

type UnionKeys<T> = T extends Record<string, string> ? RecordKeys<T> : never

type On<T> = UnionKeys<T extends { on: any } ? T['on'] : never>

export default class EasyFSM<TConfigs extends IMachineConfigs> {
  private readonly _configs: TConfigs
  private readonly _states: TConfigs['states']
  private _state: keyof TConfigs['states']
  private _previous_state: keyof TConfigs['states'] | null = null
  private _next_state: keyof TConfigs['states'] | null = null
  private _listeners_for_state_change: Record<string, ActionFunc[]> = {}
  private _ignore_can_not_send_error: boolean = false
  private _listeners_for_can_not_send: ((
    event: On<TConfigs['states'][keyof TConfigs['states']]>,
    current_state: keyof TConfigs['states'],
  ) => void)[] = []

  constructor(configs: TConfigs) {
    this._configs = configs
    this._state = configs.initial
    this._states = configs.states
    this._ignore_can_not_send_error = !!configs.ignore_can_not_send_error
  }

  send(event: On<TConfigs['states'][keyof TConfigs['states']]>, options: ISendEventOptions = {}) {
    this._send(event, options)
  }

  async sendAndWait(
    event: On<TConfigs['states'][keyof TConfigs['states']]>,
    options: ISendEventOptions = {},
  ) {
    let results = this._send(event, options)
    await Promise.all(results)
  }

  private _send(
    event: On<TConfigs['states'][keyof TConfigs['states']]>,
    options: ISendEventOptions = {},
  ) {
    if (!this.canSend(event)) {
      for (let fn of this._listeners_for_can_not_send) {
        fn(event, this._state)
      }

      if (this._ignore_can_not_send_error) {
        return []
      }
      throw new Error(`cannot_send: ${event.toString()}, current: ${this._state.toString()}`)
    }

    const previous_state = this._state
    const next_state = this._states[this._state].on?.[event as string]
    // if (!to_state) {
    //   throw new Error(`bad event: ${event}`)
    // }

    if (!next_state || !this._states[next_state]) {
      throw new Error(`invalid_state: ${next_state}`)
    }

    const state_leave = `${this._state.toString()}_leave`
    const state_enter = `${next_state}_enter`
    const state_change = `state_change`

    let fns_leave = this._listeners_for_state_change[state_leave] || []
    let fns_enter = this._listeners_for_state_change[state_enter] || []
    let fns_change = this._listeners_for_state_change[state_change] || []

    let results: (void | Promise<any>)[] = []

    // leave previous state
    this._next_state = next_state
    for (let fn of fns_leave) {
      try {
        let r = fn(options.payload)
        results.push(r)
      } catch (e) {
        console.error(e)
      }
    }

    // enter next state
    this._previous_state = previous_state
    this._state = next_state
    this._next_state = null
    for (let fn of fns_enter) {
      try {
        let r = fn(options.payload)
        results.push(r)
      } catch (e) {
        console.error(e)
      }
    }

    // state change
    for (let fn of fns_change) {
      try {
        let r = fn({
          previous_state,
          next_state: next_state,
        })
        results.push(r)
      } catch (e) {
        console.error(e)
      }
    }

    return results
  }

  canSend(event: On<TConfigs['states'][keyof TConfigs['states']]>) {
    return !!this._states[this._state].on?.[event as string]
  }

  get state() {
    return this._state
  }

  get previous_state() {
    return this._previous_state
  }

  get next_state() {
    return this._next_state
  }

  getAllStates() {
    return Object.keys(this._states) as (keyof TConfigs['states'])[]
  }

  getAllEvents() {
    let events: string[] = []
    for (let state of this.getAllStates()) {
      let on = this._states[state].on || {}
      for (let event in on) {
        if (!events.includes(event)) {
          events.push(event)
        }
      }
    }
    return events as On<TConfigs['states'][keyof TConfigs['states']]>[]
  }

  private onStateEnterOrLeave(
    state: keyof TConfigs['states'],
    action: StateAction,
    callback: ActionFunc,
  ) {
    if (!this._states.hasOwnProperty(state)) {
      throw new Error(`invalid_state: ${state.toString()}`)
    }

    let key = `${state.toString()}_${action}`
    let fns = this._listeners_for_state_change[key] || []
    fns.push(callback)
    this._listeners_for_state_change[key] = fns
  }

  private offStateEnterOrLeave(
    state: keyof TConfigs['states'],
    action: StateAction,
    callback: ActionFunc,
  ) {
    let key = `${state.toString()}_${action}`
    let fns = this._listeners_for_state_change[key] || []
    fns = fns.filter((fn) => fn !== callback)
    this._listeners_for_state_change[key] = fns
  }

  onEnter(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.onStateEnterOrLeave(state, 'enter', callback)
  }

  onLeave(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.onStateEnterOrLeave(state, 'leave', callback)
  }

  onStateChange(
    callback: (t: {
      previous_state: keyof TConfigs['states']
      next_state: keyof TConfigs['states']
    }) => void,
  ) {
    let key = 'state_change'
    let fns = this._listeners_for_state_change[key] || []
    fns.push(callback)
    this._listeners_for_state_change[key] = fns
  }

  offEnter(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.offStateEnterOrLeave(state, 'enter', callback)
  }

  offLeave(state: keyof TConfigs['states'], callback: ActionFunc) {
    this.offStateEnterOrLeave(state, 'leave', callback)
  }

  offStateChange(callback: ActionFunc) {
    let key = 'state_change'
    let fns = this._listeners_for_state_change[key] || []
    fns = fns.filter((fn) => fn !== callback)
    this._listeners_for_state_change[key] = fns
  }

  offAll() {
    this._listeners_for_state_change = {}
  }

  onCanNotSend(
    callback: (
      event: On<TConfigs['states'][keyof TConfigs['states']]>,
      current_state: keyof TConfigs['states'],
    ) => void,
  ) {
    this._listeners_for_can_not_send.push(callback)
  }

  offCanNotSend(
    callback: (
      event: On<TConfigs['states'][keyof TConfigs['states']]>,
      current_state: keyof TConfigs['states'],
    ) => void,
  ) {
    this._listeners_for_can_not_send = this._listeners_for_can_not_send.filter(
      (fn) => fn !== callback,
    )
  }

  offAllCanNotSend() {
    this._listeners_for_can_not_send = []
  }
}
