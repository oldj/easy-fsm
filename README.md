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
        load: 'loading'
      }
    },
    loading: {
      on: {
        loaded: 'ready'
      }
    },
    ready: {
      on: {
        reload: 'loading'
      }
    }
  }
})

machine.onEnterLoading = () => console.log('onEnterLoading')
machine.onLoading = () => console.log('onLoading')
machine.onLeaveLoading = () => console.log('onLeaveLoading')

console.log(machine.getState()) // init

await machine.fire('load')
console.log(machine.getState()) // loading

await machine.fire('loaded')
console.log(machine.getState()) // ready

await machine.fire('reload')
console.log(machine.getState()) // loading
```

## APIs

You can use `fsm.create(options)` to create a finite state machine.

 - **fire(event, [...args])**

   Fire an event on current state.

 - **canFire(event)**
 
   Detect if the specified `event` can be fired.
 
 - **getState()**
 
   Get the current state.
 
 - **getLastState()**
 
   Get the last state.

Every State has three actions:

 - **onEnterState()**
 - **OnState()**
 - **OnLeaveState()**

**Note:** The action names will be converted to camel-style, for example, a state named `loading_some_files` will corresponds to action `onEnterLoadingSomeFiles`, `onLoadingSomeFiles` and `onLeaveLoadingSomeFiles`.
