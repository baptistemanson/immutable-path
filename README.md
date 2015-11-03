# immutable-path
Immutable path is a simple xpath-like tool, for handling POJO as immutables.

It is useful for libraries like redux.

Use at your own risk, this lib is really a work in progress.

## Usage

```javascript
var path = require('immutable-path').path;

let state = {
            level1: {
                level21: {
                    level3: 3
                },
                level22: [{
                    id: 1,
                    val: 1
                }, {
                    id: 2,
                    val: 2
                }]
            }
        };
  let newState = path(state, 'level1.level22[id=1].val', x => x + 10);
  
```

newState will contain:
```javascript
{
            level1: {
                level21: {
                    level3: 3
                },
                level22: [{
                    id:1,
                    val: 11
                }, {
                    id: 2,
                    val: 2
                }]
            }
        };
  ```

One can also extract elements with this lib, like so:

### Extract elements

```javascript
var extract = require('immutable-path').extract;

let state = {
            level1: {
                level21: {
                    level3: 3
                },
                level22: [{
                    id: 1,
                    val: 1
                }, {
                    id: 2,
                    val: 2
                }]
            }
        };
  let newExtractedElements = extract(state, 'level1.level22[id=1]';

  /*
    newExtractedElements.state = {
            level1: {
                level21: {
                    level3: 3
                },
                level22: [{
                    id: 2,
                    val: 2
                }]
            }
        };
    newExtractedElements.elements = [{id: 1,val: 1}];

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
