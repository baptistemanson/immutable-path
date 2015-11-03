# immutable-path
Immutable path is a simple xpath-like tool, for handling POJO as immutables.

It is useful for libraries like redux.

Use at your own risk, this lib is really a work in progress.

## Usage

```javascript
var path = require('immutable-path').path;

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
  let newState = path(state, 'app.todos[id=1].priority', x => x + 10 );

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

You can also extract elements with this lib, like so:

### Extract elements

```javascript
var extract = require('immutable-path').extract;

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
  let extracted = extract(state, 'app.todos[priority=1])';

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

## Install with NPM
  

  ```bash
  npm install --save git+https://git@github.com/baptistemanson/immutable-path
  ```
  then simply add this require statement in your file:
  ```javascript
  var path = require('immutable-path').path;
  ```
