# easy-fsm

An easy-to-use finite state machine system for JavaScript.

## install

```bash
npm install easy-fsm
```

## usage

```javascript
const fsm = require('easy-fsm')

let machine = fsm.create({
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

console.log(machine.getState()) // init
await machine.fire('loaded')
console.log(machine.getState()) // ready
```

## APIs

You can use `fsm.create(options)` to create a finite state machine.

 - **fire(event)**

 Fire an event on current state.

 - **canFire(event)**
 
 Detect if the specified `event` can be fired.
 
 - **getState()**
 
 Get the current state.
 
 - **getLastState()**
 
 Get the last state.
