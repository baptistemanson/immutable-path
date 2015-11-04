# immutable-path
Immutable path is a simple xpath-like tool, for handling POJO as immutables.

It is useful for libraries like redux, which promotes immutability, but doesn't provide tools to do so.
Avoids callback hell at the expense of a bit of speed in state change.

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

### Extract objects

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
### Find object

```javascript
//with the same dataset
let found = path.find(state, 'app.todos[priority=1])';
/*
    found = [{id:1,priority:1},{id:3,priority:3}];
*/
```

### Move one object

Move is limited to grabbing a single element and putting it into an array.

```javascript

let newState = path.move('app.todos[id=1])','app.doneItems');

## Install with NPM
  

  ```bash
  npm install --save git+https://git@github.com/baptistemanson/immutable-path
  ```
  then simply add this require statement in your file:
  ```javascript
  var path = require('immutable-path');
  ```
