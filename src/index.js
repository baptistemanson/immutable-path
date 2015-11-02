'use strict';

var c = {};

// merges element into state as a new immutable
c.dup = function(state, element) {
    return Object.assign({}, state, element);
}

//todo improve
function getSelectorType(selector) {
    if (selector.indexOf('[') == -1) return 'MAP';
    return 'FILTER';
}


function parseFilter(selector) {
    //can be improved greatly.
    let s = selector.substring(1,selector.length-1).split('=');
    return {field:s[0],value:s[1]};
}

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

c.path = function(state,pathstring,func) {
    return c.pathWithTable(state,c.parsePath(pathstring),func);

}

c.pathWithTable = function(state,selectors,func) {
    console.log('called', state, ':', selectors);
    let currentSelector = selectors[0];
    if(getSelectorType(currentSelector) == 'MAP') {
        return c.recMap(state,selectors,func)
    }
    else {
        return c.recFilter(state,selectors,func)
    }
};


c.recFilter = function(state,selectors,func) {
    //if(!Array.isArray(state)) throw 'Filtering only works on arrays'
    console.log('calling recFilter with',state,':',selectors)
    let filter = parseFilter(selectors[0])
    selectors.shift()
    console.log(filter);
    if(state[filter.field] != filter.value) {
        return state
    }
    return c.pathWithTable(state,selectors,func )
}

// call it on a POJO structure to get a new structure with a path of selectors.
//todo make it work with the last level being a collection
c.recMap = function(state, selectors, func) {
    
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
            return output;
        }

    } //recursion 
    else {
        if (state && state[currentSelector] !== undefined) {
            selectors.shift();
            //array/object
            if (Array.isArray(state[currentSelector])) {
                output[currentSelector] = (state[currentSelector]).map(element => c.pathWithTable(element, selectors, func));
            } 
            else {
                output[currentSelector] = c.pathWithTable(state[currentSelector], selectors, func);
            }
            return c.dup(state, output);
        } else {
            throw currentSelector + " Not found"
        }

    }
}

module.exports = c;