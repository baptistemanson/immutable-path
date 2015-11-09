'use strict';

var c = require('./../src/index.js');
var _ = require('lodash');
var deepFreeze = require('deep-freeze-strict');

var debug = function(args) {
    console.log(JSON.stringify(args));
}

var eq = function(one, two) {
    return _.isEqual(one, two);
}

describe('immutable path', () => {
    it('simple use case', () => {
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



        var expectedNewState = {
            level1: {
                level21: {
                    level3: 3
                },
                level22: [{
                    id: 1,
                    val: 11
                }, {
                    id: 2,
                    val: 2
                }]
            }
        };
        deepFreeze(state);

        var newState = c.map(state, 'level1.level22[id=1].val', x => x + 10);

        expect(_.isEqual(newState, expectedNewState)).toBe(true);

        expect(state.level1.level22[0].val).toBe(1);
        expect(state.level1.level21 === newState.level1.level21).toBe(true);
        expect(state.level1 !== newState.level1).toBe(true);

    });

    it("should allow to strip an element from the state", () => {
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
                }, {
                    id: 3,
                    val: 1
                }]
            }
        };

        let expectedElements = [{
            id: 1,
            val: 1
        }, {
            id: 3,
            val: 1
        }];

        let expectedNewState = {
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
        deepFreeze(state);

        var filteredElement = c.extract(state, 'level1.level22[val=1]');
        expect(eq(filteredElement.elements, expectedElements)).toBe(true);
        expect(eq(filteredElement.state, expectedNewState)).toBe(true);
    });

    it('finds elements', () => {
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
                }, {
                    id: 3,
                    val: 1
                }]
            }
        };
        expect(c.find(state, 'level1.level22[id=1].val')).toEqual([1]);
        expect(c.find(state, 'level1.level21.level3')).toEqual([3]);
        expect(c.find(state, 'level1.level22[val=1]')).toEqual([{
            id: 1,
            val: 1
        }, {
            id: 3,
            val: 1
        }]);
    });

    it("moves element", () => {
        let state = {
            elements: {
                activeTodos: [{
                    id: 1,
                    val: "My task done"
                }, {
                    id: 2,
                    val: "My task not done"
                }],
                doneTodos: [{
                    id: 3,
                    val: "My task done long before"
                }]
            }
        }
        let expectedNewState = {
            "elements": {
                "activeTodos": [{
                    "id": 2,
                    "val": "My task not done"
                }],
                "doneTodos": [{
                    "id": 3,
                    "val": "My task done long before"
                }, {
                    "id": 1,
                    "val": "My task done"
                }]
            }
        }

        let newState = c.move(state, 'elements.activeTodos[id=1]', 'elements.doneTodos');
        expect(eq(newState, expectedNewState)).toBe(true);
    });

    it("lazy evals", () => {
        let state = {
            a: 'a',
            b: 'b',
            c:'c'
        };
        let reducerOne = function(state,action) { return state;}

        let reducerTwo = function(state,action) { return c.dup(state,{b:'changed'});}

        let reducerThree = function(state,action) { return c.dup(state,{c:'changed'});}

        let expected = {
            a: 'a',
            b: 'changed',
            c:'c'
        };
        let combined = c.reduceReducersLazy(reducerOne,reducerTwo,reducerThree);
        let result = combined(state,'');
        expect(result).toEqual(expected);

    })

});