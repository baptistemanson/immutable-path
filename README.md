# immutable-path
Immutable path is a simple xpath-like tool, jquery-like state selectors and modifiers applied to the immutability concept.

The main design decisions in this lib were:
- all operations follow the principle of immutability: always return a new modified instance of the object.
- free optin and optout: no need to wrap all your objects in new classes.
- support for arrays and indexed collections

Great for Redux.

We inverted the responsibility in new tools. The view pulls whatever is needed from a state. Therefore we feel the need to provide selectors on this state as jquery was in its time the selector of the DOM Nodes.




It doesn't force you to use any API like Immutable.js. You are also free to use any other lib or method, optin or optout.

For instance if you use

Use at your own risk, this lib is really a work in progress.

## Usage

```javascript
var path = require('immutable-path');

let state = {
            app: {
                general: {
                    visibilityFilter: 'all'
                },
                todos: [{
                    id: 1,
                    priority : 1
                }, {
                    id: 2,
                    priority: 2
                }]
            }
        };
  let newState = path.map(state, 'app.todos[id=1].priority', x => x + 10 );

  /* newState is now {
            app: {
                general: {
                    visibilityFilter: 'all'
                },
                todos: [{
                    id:1,
                    priority: 11
                }, {
                    id: 2,
                    priority: 2
                }]
            }
        };
        */
  ```

### Extract one or several objects

```javascript
var path = require('immutable-path');

let state = {
            app: {
                general: {
                    visibilityFilter: 'all'
                },
                todos: [{
                    id: 1,
                    priority: 1
                }, {
                    id: 2,
                    priority: 2
                },
                {
                    id: 3,
                    priority: 1
                }]
            }
        };
  let extracted = path.extract(state, 'app.todos[priority=1])';

  /*
    extracted.state = {
            app: {
                general: {
                    visibilityFilter: 'all'
                },
                todos: [{
                    id: 2,
                    priority: 2
                }]
            }
        };
    extracted.elements = [{id: 1,priority: 1}, {id: 3,priority: 1}];

   */
  
```
### Find one or several object(s)

Sometimes you want to denormalize some data into another, leaving the first item untouched.
Find can help you checking the value of such an object. Don't mutate the result of find, as it would defeat the purpose of this lib.

```javascript
//with the same dataset
let found = path.find(state, 'app.todos[priority=1])';
/*
    found = [{id:1,priority:1},{id:3,priority:3}];
*/
```

### Move one object into an array.

Move is limited to grabbing a single element and putting it into an array.

```javascript

let newState = path.move('app.todos[id=1])','app.doneItems');

```


## Install with NPM
  

  ```bash
  npm install --save git+https://git@github.com/baptistemanson/immutable-path
  ```
  then simply add this require statement in your file:
  ```javascript
  var path = require('immutable-path');
  ```
