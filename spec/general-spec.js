'use strict';

var c = require('./../src/index.js');
var _ = require('lodash');
var deepFreeze = require('deep-freeze-strict');

var debug = function(args) {
    console.log(JSON.stringify(args));
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
        debug(newState)

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
        expect(_.isEqual(filteredElement.elements, expectedElements)).toBe(true);
        expect(_.isEqual(filteredElement.state, expectedNewState)).toBe(true);


    })

});