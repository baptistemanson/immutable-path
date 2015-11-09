'use strict';

var c = {};

/** PRIVATE FUNCTIONS **/

/*
 * Returns for a selector its type. ['MAP','FILTER']
 */
function getSelectorType(selector) {
    //todo add more type of selectors
    if (selector.indexOf('[') !== -1) return 'FILTER';
    //if (selector.indexOf('{' !== -1)) return '';
    return 'MAP';
}

// FILTERS UTILITIES

/*
 * Returns {field:'key',value:'val'} when given '[key=val]'
 */
function parseFilter(selector) {
    //can be improved greatly, by supporting several filters for instance
    var s = selector.substring(1, selector.length - 1).split('=');
    return {
        field: s[0],
        value: s[1]
    };
}

var filterApply = function(element, filterString) {
    var filter = parseFilter(filterString);
    return element[filter.field] == filter.value;
}

/*
 * Applies a recursive filter.
 * @see c.pathWithArray
 */
var recFilter = function(state, selectors, func, flag) {
    //console.log('calling recFilter with state', state, ':', selectors)
    var s = selectors.slice();
    s.shift();
    if (filterApply(state, selectors[0])) {
        return c.pathWithArray(state, s, func, flag)
    }
    return state
}


var filterCurried = function(filterString) {
    return function(x) {
        return filterApply(x, filterString);
    }
}


/*
 * Applies a recursive map. 
 *
 *
 * It is the function holding the termination of the recursion.
 * @see c.pathWithArray
 */
var recMap = function(state, selectors, func, flag) {
    //console.log("calling recMap", state, ':', selectors)
    var selector = selectors[0]; // the selector we will apply
    var output = {}; //the new immutable output.

    //termination
    if (selectors.length == 1) {
        //array/object
        if (Array.isArray(state[selector])) {
            output[selector] = state[selector].map(func);
            return c.dup(state, output);
        } else {
            output[selector] = func(state[selector]);
            //no need to duplicate, it should be done on the level above.
            return c.dup(state, output);
        }

    } //recursion 
    else {
        if (state && state[selector] !== undefined) {
            selectors.shift();
            //array/object
            if (Array.isArray(state[selector])) {
                if (selectors.length == 1 && flag == 'filter') {
                    output[selector] = (state[selector]).filter(func);
                } else {
                    output[selector] = (state[selector]).map(function(element) {
                        return c.pathWithArray(element, selectors, func, flag)
                    });
                }
            } else {
                output[selector] = c.pathWithArray(state[selector], selectors, func, flag);
            }
            return c.dup(state, output);
        } else {
            throw selector + " Not found"
        }

    }
}


var recFind = function(state, selectors) {

        var selector = selectors[0];
        if (selectors.length == 1) { //termination
            if (getSelectorType(selector) == 'FILTER' && Array.isArray(state)) {
                return state.filter(filterCurried(selector));
            } else {
                if (state[selector] !== undefined) {
                    return [state[selector]];
                } else {
                    return [];
                }
            }
        }

        var rest = selectors.slice();
        rest.shift();
        if (getSelectorType(selector) == 'FILTER' && Array.isArray(state)) {
            return [].concat.apply([], state.filter(filterCurried(selector)).map(function(x) {
                return recFind(x, rest);
            }));
        } else {
            if (Array.isArray(state)) {
                return [].concat.apply([], state.map(function(x) {
                    return recFind(x, selectors);
                }));
            } else
                return recFind(state[selector], rest);
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
    var reg = /(\w+)(\[[^\]]+\])?\.?/g;
    var elements = [];
    var match;
    while ((match = reg.exec(path)) !== null) {
        elements.push(match[1]);
        //filter
        if (match[2] !== undefined) elements.push(match[2])
    }
    return elements;

}

c.buildPath = function(pathArray) {
    var path = pathArray[0];
    for (var i = 1; i < pathArray.length; i++) {
        if (getSelectorType(pathArray[i]) == 'FILTER') {
            path = path + pathArray[i];
        } else path = path + '.' + pathArray[i];
    }
    return path;
};

/*
 * Find matching elements and returns them.
 *
 */
c.find = function(state, pathstring) {
    return recFind(state, c.parsePath(pathstring));
}

/*
 * Applies func to all the elements matching the pathstring, returning a new state
 * 
 * It always returns a new state, even if the function doesn't change anything, so wrap the map function into something like handle to ditch treatment if needed
 *  
 * The original state is not modified.
 
 * Use this function when you want to use immutable structures, for fast comparison.
 * Redux & React compatible.
 *
 */
c.map = function(state, pathstring, func) {
        return c.pathWithArray(state, c.parsePath(pathstring), func, 'map');

    }
    /*
     * Finds elements and removes them from the returned state. Immutable.
     *
     */
c.extract = function(state, pathstring, flag) {
    var elements = [];
    var selectors = c.parsePath(pathstring);
    var lastFilter = selectors[selectors.length - 1]
    var newState = c.pathWithArray(state, selectors, function(x) {
        if (filterApply(x, lastFilter)) {
            elements.push(x);
            return false;
        }
        return true;
    }, 'filter');
    return {
        elements: elements,
        state: newState
    };
}

c.splitLast = function(pathString) {
    var ar = c.parsePath(pathString);
    var last = ar[ar.length - 1];
    ar.splice(-1, 1);
    return {
        path: c.buildPath(ar),
        property: last
    };
}


/**
 *
 * Move a single element into an array.
 */
c.move = function(state, srcPath, destPath) {

    //remove the attachment card from where it is (has to be in play).
    var xtract = c.extract(state, srcPath);
    if (xtract.elements.length > 1) throw 'Moving several elements at once is not yet supported'
        //console.log(splitLast(destPath));
        //add the attached card in the player zone
    return c.map(xtract.state, c.splitLast(destPath).path, function(parent) {
        if (!Array.isArray(parent[c.splitLast(destPath).property])) throw 'Move only works with arrays as destinations'
        var obj = {};
        obj[c.splitLast(destPath).property] = parent[c.splitLast(destPath).property].slice();
        obj[c.splitLast(destPath).property].push(xtract.elements[0])
        return c.dup(parent, obj);
    })
};

c.pathWithArray = function(state, selectors, func, flag) {
    //console.log("\n");
    //console.log('called patharray', state, ':', selectors, ' : ' + flag);
    if (selectors.length === 0) {
        return c.dup(state, func(state));
    }
    switch (getSelectorType(selectors[0])) {
        case 'MAP':
            return recMap(state, selectors, func, flag);
        case 'FILTER':
            return recFilter(state, selectors, func, flag);
        default:
            throw "COULDN'T MATCH SELECTOR"
    }
};

c.reduceReducersLazy = function() {
    var arg = arguments;
    return function(state, action) {
        for (var i = 0; i < arg.length; i++) {
            var newState = arg[i](state, action);
            if (newState !== state) return newState;
        }
        return state;

    }
}

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