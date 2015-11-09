# immutable-path
Immutable path is a simple micro library providing js object selectors and modifiers.

The design goals are:
- stick to immutability: modification always returns a new instance of the object.
- free optin and optout: no need to wrap all your plain objects in classes, no init.
- lightweight

Great for Redux, React.

It doesn't force you to use any API like Immutable.js. You are also free to use any other lib or method, optin or optout per reducer/function/module, when you need it.

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

Find can help you checking the value of such an object. Don't mutate the result of find, as it would loose immutability.

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

### Combine reducers lazy

```javascript
let reducerOne = function(state,action) { return Object.assign({},state,{a:'changed'});}
let reducerTwo = function(state,action) { return Object.assign({},state,{a:'changedSecond'});}

let combined = path.combineReducersLazy(reducerOne,reducerTwo);

/*
 * As long as reducerOne returns a new state, reducerTwo won't be executed.
 */

```

## Install with NPM
  

  ```bash
  npm install --save git+https://git@github.com/baptistemanson/immutable-path
  ```
  then simply add this require statement in your file:
  ```javascript
  var path = require('immutable-path');
  ```
