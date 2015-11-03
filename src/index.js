'use strict';

var c = {};

/** PRIVATE FUNCTIONS **/

/*
 * Returns for a selector its type. ['MAP','FILTER']
 */
function getSelectorType(selector) {
    //todo add more type of selectors
    if (selector.indexOf('[') == -1) return 'MAP';
    return 'FILTER';
}

/*
* Returns {field:'key',value:'val'} when given '[key=val]'
*/
function parseFilter(selector) {
    //can be improved greatly, by supporting several filters for instance
    let s = selector.substring(1,selector.length-1).split('=');
    return {field:s[0],value:s[1]};
}


/*
 * Applies a recursive filter.
* @see c.pathWithArray
 */
var recFilter = function(state,selectors,func) {
    //console.log('calling recFilter with state',state,':',selectors)
    let filter = parseFilter(selectors[0])
    let s = selectors.slice();
    s.shift();
    if(state[filter.field] != filter.value) {
        return state
    }
    return c.pathWithArray(state,s,func)
}

/*
 * Applies a recursive map. 
 *
 * It is the function holding the termination of the recursion.
 * @see c.pathWithArray
 */
var recMap = function(state, selectors, func) {
    
    let currentSelector = selectors[0]; // the selector we will apply
    var output = {}; //the new immutable output.

    //termination
    if (selectors.length == 1) {
        //array/object
        if (Array.isArray(state[currentSelector])) {
            output[currentSelector] = state[currentSelector].map(func);
            return c.dup(state, output);
        }
        else {
            output[currentSelector] = func(state[currentSelector]);
            //no need to duplicate, it should be done on the level above.
            return c.dup(state,output);
        }

    } //recursion 
    else {
        if (state && state[currentSelector] !== undefined) {
            selectors.shift();
            //array/object
            if (Array.isArray(state[currentSelector])) {
                output[currentSelector] = (state[currentSelector]).map(element => c.pathWithArray(element, selectors, func));
            }
            else {
                output[currentSelector] = c.pathWithArray(state[currentSelector], selectors, func);
            }
            return c.dup(state, output);
        } else {
            throw currentSelector + " Not found"
        }

    }
}


/** PUBLIC FUNCTIONS */

/*
* Merges element into state as a new immutable.
* 
*/
c.dup = function(state, element) {
    return Object.assign({}, state, element);
}

/*
* Parses a path, from an array of selectors.
* 
* level1.level22[id=1].val   becomes  ['level1','level22','[id=1]','val']
*/
c.parsePath = function(path) {
    let reg = /(\w+)(\[[^\]]+\])?\.?/g;
    var elements = [];
    var match;
    while((match = reg.exec(path)) !== null) {
        elements.push(match[1]);
        //filter
        if(match[2] !== undefined) elements.push(match[2])
    }
    return elements;

}

/*
* Applies func to all the elements matching the pathstring, returning a new state;
* The original state is not modified.

* Use this function when you want to use immutable structures, for fast comparison.
* Redux & React compatible.
*
*/
c.path = function(state,pathstring,func) {
    return c.pathWithArray(state,c.parsePath(pathstring),func);

}

c.pathWithArray = function(state,selectors,func) {
    //console.log('called patharray', state, ':', selectors);
    let currentSelector = selectors[0];
    if(getSelectorType(currentSelector) == 'MAP') {
        return recMap(state,selectors,func)
    }
    else {
        return recFilter(state,selectors,func)
    }
};

/*
* Redux utility. Wraps a function to handle only the action.type == type. 
*
*/ 
c.handle = function(type, f) {
    return function(state, action) {
        if (action.type != type) return state;
        //if(state === undefined && initialState !== undefined) return path.dup({},initialState);
        return f(state, action);
    }
}

module.exports = c;