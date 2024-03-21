/**
 * @author: oldj
 * @homepage: https://oldj.net
 */

export interface IMachineState {
  on?: Record<string /* event */, string /* to state */>
}

export interface IMachineConfigs {
  initial: string // initial state
  states: {
    [key: string /* state */]: IMachineState
  }
}

export type StateAction = 'enter' | 'leave'

export type ActionFunc = (...args: any[]) => void | Promise<void>
