# easy-fsm

An easy-to-use finite state machine system for JavaScript.

## install

```bash
npm install easy-fsm
```

## usage

```TypeScript
import EasyFSM from 'easy-fsm'

let fsm = new EasyFSM({
  initial: 'init',
  states: {
    init: {
      on: {
        loaded: 'ready'
      }
    },
    ready: {}
  }
})

console.log(fsm.getState()) // init
await fsm.fire('loaded')
console.log(fsm.getState()) // ready
```

## APIs

You can use `new EasyFSM(options)` to create a finite state machine.

- **send(event)**

Send an event on current state.

- **sendAndWait(event)**

Send an event on current state and wait for all listeners to finish.

- **canSend(event)**

Detect if the specified `event` can be sent.

- **[getter] state**

Get the current state.

- **[getter] previous_state**

Get the previous state.

- **onEnter(state, callback)**

Execute `callback` when entering `state`.

- **onLeave(state, callback)**

Execute `callback` when leaving `state`.
