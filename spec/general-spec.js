'use strict';

var c = require('./../src/index.js');
var _ = require('lodash');
var deepFreeze = require('deep-freeze-strict');

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
                    id:1,
                    val: 11
                }, {
                    id: 2,
                    val: 2
                }]
            }
        };
        deepFreeze(state);

        var newState = c.path(state, 'level1.level22[id=1].val', x => x + 10);

        expect(_.isEqual(newState, expectedNewState)).toBe(true);

        expect(state.level1.level22[0].val).toBe(1);
        expect(state.level1.level21 === newState.level1.level21).toBe(true);
        expect(state.level1 !== newState.level1).toBe(true);

    });

});